import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeAdmin, requireAdmin } from '@/lib/admin'
import { AuthenticationError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createSchema = z.object({
  code: z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/),
  description: z.string().trim().max(500).optional(),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.number().positive().finite(),
  minimumAmount: z.number().nonnegative().finite().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
})

const updateSchema = z.object({
  couponId: z.string().min(1),
  isActive: z.boolean(),
})

export async function GET() {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(coupons)
}

export async function POST(request: Request) {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Coupon details are invalid.' }, { status: 400 })
  if (parsed.data.discountType === 'PERCENT' && parsed.data.discountValue > 100) {
    return NextResponse.json({ error: 'Percentage discount cannot exceed 100%.' }, { status: 400 })
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        ...parsed.data,
        code: parsed.data.code.toUpperCase(),
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    })
    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Coupon code already exists.' }, { status: 409 })
    }
    throw error
  }
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
  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Coupon update is invalid.' }, { status: 400 })
  const result = await prisma.coupon.updateMany({
    where: { id: parsed.data.couponId },
    data: { isActive: parsed.data.isActive },
  })
  if (!result.count) return NextResponse.json({ error: 'Coupon not found.' }, { status: 404 })
  await prisma.auditLog.create({
    data: { actorId: admin.id, action: parsed.data.isActive ? 'COUPON_ACTIVATED' : 'COUPON_DEACTIVATED', entity: 'Coupon', entityId: parsed.data.couponId },
  })
  return NextResponse.json({ success: true })
}
