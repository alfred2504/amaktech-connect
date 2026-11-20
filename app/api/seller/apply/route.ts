import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticationError, requireApiRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  storeName: z.string().trim().min(3).max(100),
  description: z.string().trim().max(2000).optional(),
  businessAddress: z.string().trim().min(5).max(300),
  businessPhone: z.string().trim().min(7).max(30),
  businessEmail: z.string().trim().email().max(200),
})

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function POST(request: Request) {
  let user
  try {
    user = await requireApiRole(['CUSTOMER'])
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Seller application details are invalid.' }, { status: 400 })

  if (await prisma.seller.findUnique({ where: { userId: user.id } })) {
    return NextResponse.json({ error: 'A seller application already exists for this account.' }, { status: 409 })
  }

  const baseSlug = slugify(parsed.data.storeName)
  let slug = baseSlug
  for (let suffix = 2; await prisma.seller.findUnique({ where: { slug } }); suffix += 1) {
    slug = `${baseSlug}-${suffix}`
  }

  try {
    const seller = await prisma.seller.create({
      data: { ...parsed.data, slug, userId: user.id, status: 'PENDING' },
    })
    return NextResponse.json({ message: 'Seller application submitted.', seller }, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'A seller application or store with these details already exists.' }, { status: 409 })
    }
    throw error
  }
}
