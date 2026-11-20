import { NextResponse } from 'next/server'
import { AuthenticationError, requireApiUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { items: true, payments: true, shipment: true, sellerFulfillments: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  return NextResponse.json(order)
}
