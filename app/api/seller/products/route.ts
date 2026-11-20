import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticationError, requireApiRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createSchema = z.object({
  name: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(10000),
  categoryId: z.string().min(1),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  sku: z.string().trim().max(100).optional(),
  stock: z.number().int().min(0),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function getApprovedSeller(userId: string) {
  const seller = await prisma.seller.findUnique({ where: { userId } })
  return seller?.status === 'APPROVED' ? seller : null
}

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

  const seller = await getApprovedSeller(user.id)
  if (!seller) return NextResponse.json({ error: 'Approved seller account required.' }, { status: 403 })
  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: { category: true, images: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  let user
  try {
    user = await requireApiRole(['SELLER', 'ADMIN'])
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const seller = await getApprovedSeller(user.id)
  if (!seller) return NextResponse.json({ error: 'Seller approval is required.' }, { status: 403 })
  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Product details are invalid.' }, { status: 400 })

  const category = await prisma.category.findFirst({
    where: { id: parsed.data.categoryId, isActive: true },
  })
  if (!category) return NextResponse.json({ error: 'Active category not found.' }, { status: 400 })

  const baseSlug = slugify(parsed.data.name)
  let slug = baseSlug
  for (let suffix = 2; await prisma.product.findUnique({ where: { slug } }); suffix += 1) {
    slug = `${baseSlug}-${suffix}`
  }
  const { imageUrl, ...productData } = parsed.data

  try {
    const product = await prisma.product.create({
      data: {
        ...productData,
        sku: productData.sku || null,
        sellerId: seller.id,
        slug,
        status: 'DRAFT',
        images: imageUrl
          ? { create: [{ url: imageUrl, alt: productData.name, sortOrder: 0 }] }
          : undefined,
      },
      include: { category: true, images: true },
    })
    return NextResponse.json({ message: 'Product submitted for review.', product }, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'A product with this slug already exists.' }, { status: 409 })
    }
    throw error
  }
}
