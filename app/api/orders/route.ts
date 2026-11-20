import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { AuthenticationError, requireApiUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

const checkoutSchema = z.object({
  checkoutKey: z.string().min(10).max(100),
  addressId: z.string().min(1),
  paymentMethod: z.enum([
    'CASH_ON_DELIVERY',
    'ECOCASH',
    'INNBUCKS',
    'BANK_TRANSFER',
    'CARD',
  ]),
  couponCode: z.string().trim().min(1).max(30).optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(100),
    }),
  ).min(1).max(50),
  notes: z.string().max(500).optional(),
})

class CheckoutError extends Error {
  constructor(readonly code: string) {
    super(code)
    this.name = 'CheckoutError'
  }
}

function isCheckoutError(error: unknown): error is CheckoutError {
  return error instanceof CheckoutError
}

export async function GET() {
  try {
    const user = await requireApiUser()
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true, payments: true, shipment: true, sellerFulfillments: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }
}

export async function POST(request: Request) {
  let user: Awaited<ReturnType<typeof requireApiUser>>
  try {
    user = await requireApiUser()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Checkout information is incomplete or invalid.' }, { status: 400 })
  }

  const input = parsed.data
  const quantities = new Map<string, number>()
  for (const item of input.items) {
    const quantity = (quantities.get(item.productId) ?? 0) + item.quantity
    if (quantity > 100) {
      return NextResponse.json({ error: 'A product quantity cannot exceed 100.' }, { status: 400 })
    }
    quantities.set(item.productId, quantity)
  }

  const previous = await prisma.order.findUnique({
    where: { checkoutKey: input.checkoutKey },
    include: { items: true, payments: true, shipment: true, sellerFulfillments: true },
  })
  if (previous) {
    if (previous.userId !== user.id) {
      return NextResponse.json({ error: 'This checkout key belongs to another account.' }, { status: 409 })
    }
    return NextResponse.json({ order: previous })
  }

  const address = await prisma.address.findFirst({
    where: { id: input.addressId, userId: user.id },
  })
  if (!address) {
    return NextResponse.json({ error: 'Delivery address not found.' }, { status: 400 })
  }

  try {
    const result = await prisma.$transaction(async tx => {
      const previous = await tx.order.findUnique({
        where: { checkoutKey: input.checkoutKey },
        include: { items: true, payments: true, shipment: true, sellerFulfillments: true },
      })
      if (previous) {
        if (previous.userId !== user.id) throw new CheckoutError('INVALID_CHECKOUT_KEY')
        return { order: previous, replayed: true }
      }

      const requestedItems = [...quantities.entries()].map(([productId, quantity]) => ({ productId, quantity }))
      const products = await tx.product.findMany({
        where: {
          id: { in: requestedItems.map(item => item.productId) },
          status: 'ACTIVE',
          seller: { status: 'APPROVED' },
        },
        include: {
          seller: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      })
      if (products.length !== requestedItems.length) throw new CheckoutError('INVALID_PRODUCTS')

      const requestedById = new Map(requestedItems.map(item => [item.productId, item.quantity]))
      const lines = products.map(product => {
        const quantity = requestedById.get(product.id)
        if (!quantity) throw new CheckoutError('INVALID_PRODUCTS')
        if (product.stock < quantity) throw new CheckoutError('INSUFFICIENT_STOCK')
        const lineTotal = product.price.mul(quantity).toDecimalPlaces(2)
        return {
          product,
          quantity,
          price: product.price,
          lineTotal,
          commissionRate: product.seller.commissionRate,
        }
      })

      const subtotal = lines.reduce(
        (sum, line) => sum.plus(line.lineTotal),
        new Prisma.Decimal(0),
      ).toDecimalPlaces(2)

      let discountTotal = new Prisma.Decimal(0)
      let coupon: {
        id: string
        isActive: boolean
        expiresAt: Date | null
        minimumAmount: Prisma.Decimal | null
        discountType: string
        discountValue: Prisma.Decimal
        usageLimit: number | null
        usedCount: number
      } | null = null
      if (input.couponCode) {
        coupon = await tx.coupon.findUnique({
          where: { code: input.couponCode.toUpperCase() },
        })
        if (!coupon || !coupon.isActive) throw new CheckoutError('INVALID_COUPON')
        if (coupon.expiresAt && coupon.expiresAt <= new Date()) throw new CheckoutError('COUPON_EXPIRED')
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          throw new CheckoutError('COUPON_LIMIT_REACHED')
        }
        if (coupon.minimumAmount && subtotal.lessThan(coupon.minimumAmount)) {
          throw new CheckoutError('COUPON_MINIMUM_NOT_MET')
        }
        if (coupon.discountType === 'PERCENT') {
          if (coupon.discountValue.greaterThan(100)) throw new CheckoutError('INVALID_COUPON')
          discountTotal = subtotal.mul(coupon.discountValue).div(100).toDecimalPlaces(2)
        } else if (coupon.discountType === 'FIXED') {
          discountTotal = coupon.discountValue.toDecimalPlaces(2)
        } else {
          throw new CheckoutError('INVALID_COUPON')
        }
        if (discountTotal.greaterThan(subtotal)) discountTotal = subtotal
      }

      let allocatedDiscount = new Prisma.Decimal(0)
      const finalLines = lines.map((line, index) => {
        const discount = index === lines.length - 1
          ? discountTotal.minus(allocatedDiscount)
          : subtotal.isZero()
            ? new Prisma.Decimal(0)
            : discountTotal.mul(line.lineTotal).div(subtotal).toDecimalPlaces(2)
        allocatedDiscount = allocatedDiscount.plus(discount)
        const lineTotal = line.lineTotal.minus(discount).toDecimalPlaces(2)
        const commission = lineTotal.mul(line.commissionRate).div(100).toDecimalPlaces(2)
        return {
          ...line,
          lineTotal,
          commission,
          sellerAmount: lineTotal.minus(commission).toDecimalPlaces(2),
        }
      })

      const shippingTotal = new Prisma.Decimal(0)
      const total = subtotal.plus(shippingTotal).minus(discountTotal).toDecimalPlaces(2)

      for (const line of finalLines) {
        const result = await tx.product.updateMany({
          where: {
            id: line.product.id,
            status: 'ACTIVE',
            stock: { gte: line.quantity },
          },
          data: { stock: { decrement: line.quantity } },
        })
        if (result.count !== 1) throw new CheckoutError('INSUFFICIENT_STOCK')
      }

      if (coupon) {
        const couponUpdate = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            isActive: true,
            ...(coupon.usageLimit === null ? {} : { usedCount: { lt: coupon.usageLimit } }),
          },
          data: { usedCount: { increment: 1 } },
        })
        if (couponUpdate.count !== 1) throw new CheckoutError('COUPON_LIMIT_REACHED')
      }

      const created = await tx.order.create({
        data: {
          orderNumber: `AKC-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`,
          checkoutKey: input.checkoutKey,
          userId: user.id,
          status: 'PENDING',
          subtotal,
          shippingTotal,
          discountTotal,
          total,
          recipientName: address.fullName,
          recipientPhone: address.phone,
          shippingAddress: address.street,
          shippingCity: address.city,
          shippingProvince: address.province,
          shippingCountry: address.country,
          notes: input.notes,
          items: {
            create: finalLines.map(line => ({
              productId: line.product.id,
              sellerId: line.product.sellerId,
              productName: line.product.name,
              productSku: line.product.sku,
              productImage: line.product.images[0]?.url,
              quantity: line.quantity,
              unitPrice: line.price,
              lineTotal: line.lineTotal,
              commissionRate: line.commissionRate,
              commission: line.commission,
              sellerAmount: line.sellerAmount,
            })),
          },
          payments: {
            create: {
              method: input.paymentMethod,
              status: 'PENDING',
              amount: total,
              currency: 'USD',
            },
          },
          shipment: { create: { status: 'PENDING', deliveryFee: shippingTotal } },
          couponUsage: coupon ? { create: { couponId: coupon.id, userId: user.id } } : undefined,
        },
      })

      const sellerIds = [...new Set(finalLines.map(line => line.product.sellerId))]
      for (const sellerId of sellerIds) {
        const fulfillment = await tx.sellerFulfillment.create({
          data: { orderId: created.id, sellerId },
        })
        await tx.orderItem.updateMany({
          where: { orderId: created.id, sellerId },
          data: { fulfillmentId: fulfillment.id },
        })
      }

      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Order received',
          message: `Your order ${created.orderNumber} has been received and is pending confirmation.`,
          type: 'ORDER_PLACED',
        },
      })

      const completedOrder = await tx.order.findUniqueOrThrow({
        where: { id: created.id },
        include: { items: true, payments: true, shipment: true, sellerFulfillments: true },
      })
      return { order: completedOrder, replayed: false }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    return NextResponse.json({ order: result.order }, { status: result.replayed ? 200 : 201 })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (isCheckoutError(error)) {
      const status = error.code === 'INVALID_CHECKOUT_KEY' ? 409 :
        error.code === 'INSUFFICIENT_STOCK' ? 409 :
          error.code === 'INVALID_PRODUCTS' ? 400 :
            error.code === 'COUPON_LIMIT_REACHED' ? 409 : 400
      const messages: Record<string, string> = {
        INVALID_CHECKOUT_KEY: 'This checkout key belongs to another account.',
        INVALID_PRODUCTS: 'One or more products are unavailable.',
        INSUFFICIENT_STOCK: 'Some products are no longer available in the requested quantity.',
        INVALID_COUPON: 'Coupon is invalid.',
        COUPON_EXPIRED: 'Coupon has expired.',
        COUPON_LIMIT_REACHED: 'Coupon usage limit reached.',
        COUPON_MINIMUM_NOT_MET: 'Order subtotal does not meet the coupon minimum.',
      }
      return NextResponse.json({ error: messages[error.code] ?? 'Checkout failed.' }, { status })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await prisma.order.findUnique({
        where: { checkoutKey: input.checkoutKey },
        include: { items: true, payments: true, shipment: true, sellerFulfillments: true },
      })
      if (existing?.userId === user.id) return NextResponse.json({ order: existing })
      if (existing) return NextResponse.json({ error: 'This checkout key belongs to another account.' }, { status: 409 })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json({ error: 'Checkout changed concurrently. Please retry.' }, { status: 409 })
    }

    console.error('Order checkout failed.', error)
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 })
  }
}
