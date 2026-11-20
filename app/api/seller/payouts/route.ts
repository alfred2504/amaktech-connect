import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { AuthenticationError, requireApiRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  amount: z.number().positive().finite(),
  method: z.string().trim().min(2).max(50),
  notes: z.string().trim().max(500).optional(),
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
  if (!seller) return NextResponse.json({ error: 'Seller profile not found.' }, { status: 404 })

  const [payouts, earnings, committed] = await Promise.all([
    prisma.payout.findMany({ where: { sellerId: seller.id }, orderBy: { createdAt: 'desc' } }),
    prisma.orderItem.aggregate({
      where: { sellerId: seller.id, order: { status: 'DELIVERED' } },
      _sum: { sellerAmount: true },
    }),
    prisma.payout.aggregate({
      where: { sellerId: seller.id, status: { in: ['PENDING', 'PROCESSING', 'PAID'] } },
      _sum: { amount: true },
    }),
  ])
  const rawAvailableBalance = new Prisma.Decimal(earnings._sum.sellerAmount ?? 0)
    .minus(committed._sum.amount ?? 0)
  const availableBalance = rawAvailableBalance.greaterThan(0) ? rawAvailableBalance : new Prisma.Decimal(0)
  return NextResponse.json({ payouts, availableBalance: availableBalance.toFixed(2) })
}

export async function POST(request: Request) {
  let user
  try {
    user = await requireApiRole(['SELLER'])
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Payout request is invalid.' }, { status: 400 })
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } })
  if (!seller || seller.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Approved seller account required.' }, { status: 403 })
  }

  try {
    const payout = await prisma.$transaction(async tx => {
      const earned = await tx.orderItem.aggregate({
        where: { sellerId: seller.id, order: { status: 'DELIVERED' } },
        _sum: { sellerAmount: true },
      })
      const committed = await tx.payout.aggregate({
        where: { sellerId: seller.id, status: { in: ['PENDING', 'PROCESSING', 'PAID'] } },
        _sum: { amount: true },
      })
      const available = new Prisma.Decimal(earned._sum.sellerAmount ?? 0)
        .minus(committed._sum.amount ?? 0)
      const amount = new Prisma.Decimal(parsed.data.amount).toDecimalPlaces(2)
      if (amount.greaterThan(available)) throw new Error('INSUFFICIENT_BALANCE')

      const created = await tx.payout.create({
        data: {
          sellerId: seller.id,
          amount,
          method: parsed.data.method,
          notes: parsed.data.notes,
        },
      })
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Payout request received',
          message: `Your payout request for ${amount.toFixed(2)} is awaiting review.`,
          type: 'PAYOUT_REQUESTED',
          metadata: { payoutId: created.id },
        },
      })
      return created
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    return NextResponse.json({ payout }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'INSUFFICIENT_BALANCE') {
      return NextResponse.json({ error: 'Insufficient available balance.' }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json({ error: 'Payout balance changed. Please retry.' }, { status: 409 })
    }
    throw error
  }
}
