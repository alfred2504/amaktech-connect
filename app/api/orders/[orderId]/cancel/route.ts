import { NextResponse } from 'next/server'
import { AuthenticationError, requireApiUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  let user
  try {
    user = await requireApiUser()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const { orderId } = await params
  const order = await prisma.$transaction(async tx => {
    const existing = await tx.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: { items: true },
    })
    if (!existing) return { error: 'NOT_FOUND' as const }
    if (existing.status !== 'PENDING') return { error: 'CANNOT_CANCEL' as const }

    await tx.order.update({ where: { id: existing.id }, data: { status: 'CANCELLED' } })
    for (const item of existing.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    }
    await tx.payment.updateMany({
      where: { orderId: existing.id, status: { in: ['PENDING', 'PROCESSING'] } },
      data: { status: 'FAILED' },
    })
    await tx.sellerFulfillment.deleteMany({ where: { orderId: existing.id } })

    const couponUsage = await tx.couponUsage.findUnique({ where: { orderId: existing.id } })
    if (couponUsage) {
      await tx.coupon.update({
        where: { id: couponUsage.couponId },
        data: { usedCount: { decrement: 1 } },
      })
      await tx.couponUsage.delete({ where: { orderId: existing.id } })
    }
    await tx.notification.create({
      data: {
        userId: user.id,
        title: 'Order cancelled',
        message: `Order ${existing.orderNumber} was cancelled.`,
        type: 'ORDER_CANCELLED',
        metadata: { orderId: existing.id },
      },
    })
    return { order: existing }
  }, { isolationLevel: 'Serializable' })

  if ('error' in order) {
    const status = order.error === 'NOT_FOUND' ? 404 : 409
    const message = order.error === 'NOT_FOUND' ? 'Order not found.' : 'Only pending orders can be cancelled.'
    return NextResponse.json({ error: message }, { status })
  }
  return NextResponse.json({ message: 'Order cancelled.' })
}
