import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeAdmin, requireAdmin } from '@/lib/admin'
import { AuthenticationError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  reviewId: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT']),
})

export async function GET() {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reviews)
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
  if (!parsed.success) return NextResponse.json({ error: 'Review moderation request is invalid.' }, { status: 400 })
  const review = await prisma.review.findUnique({ where: { id: parsed.data.reviewId } })
  if (!review) return NextResponse.json({ error: 'Review not found.' }, { status: 404 })

  const updated = await prisma.$transaction(async tx => {
    const result = await tx.review.update({
      where: { id: review.id },
      data: { status: parsed.data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED' },
    })
    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: `REVIEW_${parsed.data.action}`,
        entity: 'Review',
        entityId: review.id,
      },
    })
    return result
  })
  return NextResponse.json({ review: updated })
}
