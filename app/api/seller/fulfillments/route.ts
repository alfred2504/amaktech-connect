import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticationError, requireApiRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateSchema = z.object({
  fulfillmentId: z.string().min(1),
  status: z.enum(['READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED']),
  carrier: z.string().trim().max(100).optional(),
  trackingNumber: z.string().trim().max(150).optional(),
  trackingUrl: z.string().url().optional(),
  notes: z.string().trim().max(1000).optional(),
})

export async function GET() {
  let user
  try {
    user = await requireApiRole(['SELLER'])
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const seller = await prisma.seller.findUnique({ where: { userId: user.id } })
  if (!seller || seller.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Seller approval required.' }, { status: 403 })
  }
  const fulfillments = await prisma.sellerFulfillment.findMany({
    where: { sellerId: seller.id },
    include: {
      order: {
        select: {
          orderNumber: true,
          status: true,
          recipientName: true,
          recipientPhone: true,
          shippingAddress: true,
          shippingCity: true,
          shippingCountry: true,
        },
      },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(fulfillments)
}

export async function PATCH(request: Request) {
  let user
  try {
    user = await requireApiRole(['SELLER'])
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Fulfilment update is invalid.' }, { status: 400 })
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } })
  if (!seller || seller.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Seller approval required.' }, { status: 403 })
  }

  const fulfillment = await prisma.sellerFulfillment.findFirst({
    where: { id: parsed.data.fulfillmentId, sellerId: seller.id },
    include: { order: { select: { id: true, userId: true, status: true } } },
  })
  if (!fulfillment) return NextResponse.json({ error: 'Fulfilment not found.' }, { status: 404 })
  if (!['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(fulfillment.order.status)) {
    return NextResponse.json({ error: 'The order must be confirmed before fulfilment.' }, { status: 409 })
  }

  const allowedNext: Record<string, string> = {
    PENDING: 'READY_FOR_PICKUP',
    READY_FOR_PICKUP: 'IN_TRANSIT',
    IN_TRANSIT: 'DELIVERED',
  }
  if (allowedNext[fulfillment.status] !== parsed.data.status) {
    return NextResponse.json({ error: 'Invalid fulfilment status transition.' }, { status: 409 })
  }

  const result = await prisma.$transaction(async tx => {
    const updated = await tx.sellerFulfillment.update({
      where: { id: fulfillment.id },
      data: {
        status: parsed.data.status,
        carrier: parsed.data.carrier ?? fulfillment.carrier,
        trackingNumber: parsed.data.trackingNumber ?? fulfillment.trackingNumber,
        trackingUrl: parsed.data.trackingUrl ?? fulfillment.trackingUrl,
        notes: parsed.data.notes ?? fulfillment.notes,
        deliveredAt: parsed.data.status === 'DELIVERED' ? new Date() : null,
      },
    })
    const allFulfillments = await tx.sellerFulfillment.findMany({
      where: { orderId: fulfillment.order.id },
      select: { status: true },
    })
    const allDelivered = allFulfillments.every(item => item.status === 'DELIVERED')
    const allDispatched = allFulfillments.every(item => ['IN_TRANSIT', 'DELIVERED'].includes(item.status))
    const anyPreparing = allFulfillments.some(item => ['READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED'].includes(item.status))
    const orderStatus = allDelivered ? 'DELIVERED' : allDispatched ? 'SHIPPED' : anyPreparing ? 'PROCESSING' : fulfillment.order.status
    if (orderStatus !== fulfillment.order.status) {
      await tx.order.update({ where: { id: fulfillment.order.id }, data: { status: orderStatus } })
    }
    await tx.notification.create({
      data: {
        userId: fulfillment.order.userId,
        title: 'Order fulfilment updated',
        message: `Your order fulfilment is now ${parsed.data.status.toLowerCase().replaceAll('_', ' ')}.`,
        type: 'ORDER_FULFILLMENT',
        metadata: { orderId: fulfillment.order.id, fulfillmentId: fulfillment.id },
      },
    })
    return updated
  }, { isolationLevel: 'Serializable' })

  return NextResponse.json({ fulfillment: result })
}
