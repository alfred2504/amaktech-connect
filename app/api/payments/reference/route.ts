import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticationError, requireApiUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  orderId: z.string().min(1),
  reference: z.string().trim().min(3).max(100),
  proofUrl: z.string().url().optional(),
})

export async function POST(request: Request) {
  let user
  try {
    user = await requireApiUser()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Payment reference details are invalid.' }, { status: 400 })

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: user.id },
    include: { payments: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  const payment = order.payments[0]
  if (!payment || payment.status !== 'PENDING' || ['CARD', 'CASH_ON_DELIVERY'].includes(payment.method)) {
    return NextResponse.json({ error: 'This payment cannot accept a manual reference.' }, { status: 409 })
  }

  const updated = await prisma.$transaction(async tx => {
    const result = await tx.payment.update({
      where: { id: payment.id },
      data: { reference: parsed.data.reference, proofUrl: parsed.data.proofUrl, status: 'PROCESSING' },
    })
    await tx.notification.create({
      data: {
        userId: user.id,
        title: 'Payment submitted',
        message: `Your payment reference for order ${order.orderNumber} is awaiting verification.`,
        type: 'PAYMENT_SUBMITTED',
        metadata: { orderId: order.id, paymentId: payment.id },
      },
    })
    return result
  })
  return NextResponse.json({ message: 'Payment submitted for verification.', payment: updated })
}
