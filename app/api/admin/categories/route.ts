import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const createSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/i).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
})

const updateSchema = z.object({
  categoryId: z.string().min(1),
  isActive: z.boolean(),
})

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function GET() {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const categories = await prisma.category.findMany({
    include: { children: true, _count: { select: { products: true } } },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Category details are invalid.' }, { status: 400 })

  const data = parsed.data
  const slug = slugify(data.slug || data.name)
  try {
    const category = await prisma.category.create({
      data: { ...data, slug },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this slug already exists.' }, { status: 409 })
    }
    throw error
  }
}

export async function PATCH(request: Request) {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Category update is invalid.' }, { status: 400 })

  const result = await prisma.category.updateMany({
    where: { id: parsed.data.categoryId },
    data: { isActive: parsed.data.isActive },
  })
  if (!result.count) return NextResponse.json({ error: 'Category not found.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
