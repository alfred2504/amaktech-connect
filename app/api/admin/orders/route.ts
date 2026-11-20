import { NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: { include: { seller: { select: { storeName: true } }, fulfillment: true } },
      payments: true,
      shipment: true,
      sellerFulfillments: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}
