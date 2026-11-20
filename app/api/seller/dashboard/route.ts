import { NextResponse } from 'next/server'
import { AuthenticationError, requireApiRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  let user
  try {
    user = await requireApiRole(['SELLER', 'ADMIN'])
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const seller = await prisma.seller.findUnique({ where: { userId: user.id } })
  if (!seller || seller.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Seller approval is required.' }, { status: 403 })
  }

  const [productCount, pendingProducts, items, payouts] = await Promise.all([
    prisma.product.count({ where: { sellerId: seller.id } }),
    prisma.product.count({ where: { sellerId: seller.id, status: 'DRAFT' } }),
    prisma.orderItem.findMany({
      where: { sellerId: seller.id },
      select: { lineTotal: true, sellerAmount: true, order: { select: { status: true } } },
    }),
    prisma.payout.findMany({ where: { sellerId: seller.id }, select: { amount: true, status: true } }),
  ])

  const settledStatuses = new Set(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'])
  const settledItems = items.filter(item => settledStatuses.has(item.order.status))
  const deliveredItems = items.filter(item => item.order.status === 'DELIVERED')
  const sellerEarnings = deliveredItems.reduce((sum, item) => sum + Number(item.sellerAmount), 0)
  const committedPayouts = payouts
    .filter(payout => ['PENDING', 'PROCESSING', 'PAID'].includes(payout.status))
    .reduce((sum, payout) => sum + Number(payout.amount), 0)

  return NextResponse.json({
    store: seller,
    stats: {
      productCount,
      pendingProducts,
      pendingOrders: items.filter(item => item.order.status === 'CONFIRMED').length,
      totalSales: settledItems.reduce((sum, item) => sum + Number(item.lineTotal), 0),
      sellerEarnings,
      paidPayouts: payouts.filter(payout => payout.status === 'PAID').reduce((sum, payout) => sum + Number(payout.amount), 0),
      availableBalance: Math.max(0, sellerEarnings - committedPayouts),
    },
  })
}
