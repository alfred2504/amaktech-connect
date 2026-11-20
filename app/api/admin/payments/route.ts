import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeAdmin, requireAdmin } from '@/lib/admin'
import { AuthenticationError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  paymentId: z.string().min(1),
  action: z.enum(['VERIFY', 'REJECT', 'CONFIRM_COD_ORDER']),
})

export async function GET() {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const payments = await prisma.payment.findMany({
    include: { order: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(payments)
}

export async function PATCH(request: Request) {
  let admin
  try {
    admin = await requireAdmin()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Payment action is invalid.' }, { status: 400 })

  const payment = await prisma.payment.findUnique({
    where: { id: parsed.data.paymentId },
    include: { order: { select: { id: true, orderNumber: true, userId: true, status: true } } },
  })
  if (!payment) return NextResponse.json({ error: 'Payment not found.' }, { status: 404 })

  if (parsed.data.action === 'CONFIRM_COD_ORDER') {
    if (payment.method !== 'CASH_ON_DELIVERY' || payment.status !== 'PENDING' || payment.order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending cash-on-delivery orders can be confirmed.' }, { status: 409 })
    }
  } else if (payment.method === 'CASH_ON_DELIVERY' || payment.method === 'CARD') {
    return NextResponse.json({ error: 'This payment method requires its own confirmation workflow.' }, { status: 409 })
  } else if (payment.status !== 'PROCESSING' || payment.order.status !== 'PENDING') {
    return NextResponse.json({ error: 'Payment is not awaiting verification.' }, { status: 409 })
  }

  const result = await prisma.$transaction(async tx => {
    if (parsed.data.action !== 'CONFIRM_COD_ORDER') {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: parsed.data.action === 'VERIFY' ? 'PAID' : 'FAILED',
          paidAt: parsed.data.action === 'VERIFY' ? new Date() : null,
        },
      })
    }
    if (parsed.data.action === 'VERIFY' || parsed.data.action === 'CONFIRM_COD_ORDER') {
      await tx.order.update({ where: { id: payment.order.id }, data: { status: 'CONFIRMED' } })
    }
    await tx.notification.create({
      data: {
        userId: payment.order.userId,
        title: parsed.data.action === 'REJECT' ? 'Payment not verified' : 'Order payment update',
        message: parsed.data.action === 'VERIFY'
          ? `Payment for order ${payment.order.orderNumber} was verified.`
          : parsed.data.action === 'CONFIRM_COD_ORDER'
            ? `Order ${payment.order.orderNumber} was confirmed for cash on delivery.`
            : `Payment for order ${payment.order.orderNumber} could not be verified.`,
        type: 'PAYMENT_STATUS',
        metadata: { orderId: payment.order.id, paymentId: payment.id },
      },
    })
    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: `PAYMENT_${parsed.data.action}`,
        entity: 'Payment',
        entityId: payment.id,
      },
    })
    return tx.payment.findUniqueOrThrow({
      where: { id: payment.id },
      include: { order: { select: { id: true, orderNumber: true, userId: true, status: true } } },
    })
  })

  return NextResponse.json({ payment: result })
}
