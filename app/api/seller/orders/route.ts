import { NextResponse } from 'next/server'
import { AuthenticationError, requireApiRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    return NextResponse.json({ error: 'Approved seller account required.' }, { status: 403 })
  }

  const items = await prisma.orderItem.findMany({
    where: { sellerId: seller.id },
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true } },
          payments: true,
        },
      },
      fulfillment: true,
    },
    orderBy: { order: { createdAt: 'desc' } },
  })
  return NextResponse.json(items)
}
