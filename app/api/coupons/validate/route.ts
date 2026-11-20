import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  code: z.string().trim().min(1).max(30),
  subtotal: z.number().nonnegative().finite(),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Coupon code or subtotal is invalid.' }, { status: 400 })

  const coupon = await prisma.coupon.findUnique({
    where: { code: parsed.data.code.toUpperCase() },
  })
  if (!coupon || !coupon.isActive) return NextResponse.json({ error: 'Coupon is invalid.' }, { status: 404 })
  if (coupon.expiresAt && coupon.expiresAt <= new Date()) {
    return NextResponse.json({ error: 'Coupon has expired.' }, { status: 400 })
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: 'Coupon usage limit reached.' }, { status: 409 })
  }
  if (coupon.minimumAmount && parsed.data.subtotal < Number(coupon.minimumAmount)) {
    return NextResponse.json({ error: `Minimum order value is $${Number(coupon.minimumAmount).toFixed(2)}.` }, { status: 400 })
  }

  let discount = 0
  if (coupon.discountType === 'PERCENT') {
    if (Number(coupon.discountValue) > 100) {
      return NextResponse.json({ error: 'Coupon configuration is invalid.' }, { status: 500 })
    }
    discount = parsed.data.subtotal * Number(coupon.discountValue) / 100
  } else if (coupon.discountType === 'FIXED') {
    discount = Number(coupon.discountValue)
  } else {
    return NextResponse.json({ error: 'Coupon configuration is invalid.' }, { status: 500 })
  }

  discount = Math.min(discount, parsed.data.subtotal)
  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discount: Number(discount.toFixed(2)),
    finalTotal: Number((parsed.data.subtotal - discount).toFixed(2)),
  })
}
