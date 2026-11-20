import { NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const settledStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const

export async function GET() {
  const denied = await authorizeAdmin()
  if (denied) return denied

  const [
    customers,
    sellers,
    pendingSellers,
    products,
    pendingProducts,
    orders,
    pendingOrders,
    recentOrders,
    recentSellers,
    paidOrders,
    openPayouts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.seller.count({ where: { status: 'APPROVED' } }),
    prisma.seller.count({ where: { status: 'PENDING' } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.product.count({ where: { status: 'DRAFT' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.seller.findMany({
      take: 10,
      where: { status: 'PENDING' },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      where: { status: { in: [...settledStatuses] } },
      select: { total: true, items: { select: { commission: true } } },
    }),
    prisma.payout.findMany({
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
      select: { amount: true },
    }),
  ])

  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0)
  const commissionRevenue = paidOrders.reduce(
    (sum, order) => sum + order.items.reduce((orderSum, item) => orderSum + Number(item.commission), 0),
    0,
  )

  return NextResponse.json({
    metrics: {
      customers,
      sellers,
      pendingSellers,
      products,
      pendingProducts,
      orders,
      pendingOrders,
      revenue,
      commissionRevenue,
      outstandingPayouts: openPayouts.reduce((sum, payout) => sum + Number(payout.amount), 0),
    },
    recentOrders,
    recentSellers,
  })
}
