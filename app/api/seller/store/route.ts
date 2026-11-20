import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticationError, requireApiRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  storeName: z.string().trim().min(3).max(100),
  description: z.string().trim().max(2000).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  businessAddress: z.string().trim().max(300).optional(),
  businessPhone: z.string().trim().max(30).optional(),
  businessEmail: z.string().trim().email().optional().or(z.literal('')),
})

async function sellerFor(userId: string) {
  return prisma.seller.findUnique({ where: { userId } })
}

export async function GET() {
  let user
  try {
    user = await requireApiRole(['SELLER'])
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: error.status })
    throw error
  }
  const seller = await sellerFor(user.id)
  if (!seller) return NextResponse.json({ error: 'Seller profile not found.' }, { status: 404 })
  return NextResponse.json(seller)
}

export async function PATCH(request: Request) {
  let user
  try {
    user = await requireApiRole(['SELLER'])
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: error.status })
    throw error
  }
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Store details are invalid.' }, { status: 400 })
  const seller = await sellerFor(user.id)
  if (!seller || seller.status !== 'APPROVED') return NextResponse.json({ error: 'Approved seller account required.' }, { status: 403 })

  try {
    const updated = await prisma.seller.update({
      where: { id: seller.id },
      data: {
        ...parsed.data,
        logoUrl: parsed.data.logoUrl || null,
        bannerUrl: parsed.data.bannerUrl || null,
        businessEmail: parsed.data.businessEmail || null,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'A store with this name already exists.' }, { status: 409 })
    }
    throw error
  }
}
