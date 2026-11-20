import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticationError, requireApiRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateSchema = z.object({
  name: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(10).max(10000).optional(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().nullable().optional(),
  sku: z.string().trim().max(100).nullable().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'ARCHIVED']).optional(),
}).refine(value => Object.keys(value).length > 0, 'At least one field is required.')

async function getSeller(userId: string) {
  return prisma.seller.findUnique({ where: { userId } })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  let user
  try {
    user = await requireApiRole(['SELLER'])
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const { productId } = await params
  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Product update is invalid.' }, { status: 400 })
  const seller = await getSeller(user.id)
  if (!seller || seller.status !== 'APPROVED') return NextResponse.json({ error: 'Approved seller account required.' }, { status: 403 })

  const product = await prisma.product.findFirst({ where: { id: productId, sellerId: seller.id } })
  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })

  if (parsed.data.categoryId) {
    const category = await prisma.category.findFirst({ where: { id: parsed.data.categoryId, isActive: true } })
    if (!category) return NextResponse.json({ error: 'Active category not found.' }, { status: 400 })
  }

  const requiresReview = ['name', 'description', 'price', 'comparePrice', 'categoryId', 'imageUrl']
    .some(field => field in parsed.data)
  const status = requiresReview
    ? 'DRAFT'
    : parsed.data.stock === 0 && product.status === 'ACTIVE'
      ? 'OUT_OF_STOCK'
      : parsed.data.stock !== undefined && parsed.data.stock > 0 && product.status === 'OUT_OF_STOCK'
        ? 'DRAFT'
        : parsed.data.status ?? product.status
  const { imageUrl, ...productData } = parsed.data
  const updated = await prisma.$transaction(async tx => {
    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: { ...productData, status },
    })
    if (imageUrl !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: product.id } })
      if (imageUrl) {
        await tx.productImage.create({
          data: { productId: product.id, url: imageUrl, alt: updatedProduct.name, sortOrder: 0 },
        })
      }
    }
    return tx.product.findUniqueOrThrow({
      where: { id: product.id },
      include: { category: true, images: { orderBy: { sortOrder: 'asc' } } },
    })
  })
  return NextResponse.json({ product: updated })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  let user
  try {
    user = await requireApiRole(['SELLER'])
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }
  const { productId } = await params
  const seller = await getSeller(user.id)
  if (!seller || seller.status !== 'APPROVED') return NextResponse.json({ error: 'Approved seller account required.' }, { status: 403 })

  const result = await prisma.product.updateMany({
    where: { id: productId, sellerId: seller.id },
    data: { status: 'ARCHIVED' },
  })
  if (!result.count) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
  return NextResponse.json({ message: 'Product archived.' })
}
