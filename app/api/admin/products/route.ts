import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const createSchema = z.object({
  name: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(220).regex(/^[a-z0-9-]+$/i),
  description: z.string().min(10).max(10000),
  price: z.number().positive(),
  comparePrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0),
  sku: z.string().trim().max(100).optional(),
  categoryId: z.string().min(1),
  sellerId: z.string().min(1),
  status: z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  condition: z.string().max(40).default('NEW'),
  imageUrl: z.string().url().optional(),
})

const moderationSchema = z.object({
  productId: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT', 'ARCHIVE']),
})

export async function GET() {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const products = await prisma.product.findMany({
    include: {
      seller: { select: { id: true, storeName: true, status: true } },
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Product details are invalid.' }, { status: 400 })
  const data = parsed.data

  const [category, seller] = await Promise.all([
    prisma.category.findFirst({ where: { id: data.categoryId, isActive: true } }),
    prisma.seller.findFirst({ where: { id: data.sellerId, status: 'APPROVED' } }),
  ])
  if (!category) return NextResponse.json({ error: 'Active category not found.' }, { status: 400 })
  if (!seller) return NextResponse.json({ error: 'Approved seller not found.' }, { status: 400 })

  const requestedStatus = data.status === 'ACTIVE' && data.stock === 0 ? 'OUT_OF_STOCK' : data.status
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug.toLowerCase(),
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        stock: data.stock,
        sku: data.sku || null,
        categoryId: category.id,
        sellerId: seller.id,
        status: requestedStatus,
        isFeatured: data.isFeatured,
        condition: data.condition,
        images: data.imageUrl ? { create: [{ url: data.imageUrl, alt: data.name, sortOrder: 0 }] } : undefined,
      },
      include: { category: true, seller: true, images: true },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Product slug or SKU already exists.' }, { status: 409 })
    }
    throw error
  }
}

export async function PATCH(request: Request) {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const parsed = moderationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Moderation request is invalid.' }, { status: 400 })

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    include: { seller: true },
  })
  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })

  if (parsed.data.action === 'APPROVE' && product.seller.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Approve the seller before publishing products.' }, { status: 409 })
  }

  const status = parsed.data.action === 'APPROVE'
    ? product.stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK'
    : 'ARCHIVED'
  const updated = await prisma.product.update({ where: { id: product.id }, data: { status } })
  return NextResponse.json({ product: updated })
}
