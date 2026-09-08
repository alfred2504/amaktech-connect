import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function POST(request: Request) {
  const user = await requireUser()
  const data = await request.formData()
  const productId = String(data.get('productId') || '')
  const quantity = Math.max(1, Number(data.get('quantity') || 1))
  const products = await prisma.$queryRawUnsafe<Array<{ price: number }>>('SELECT price FROM public."Product" WHERE id = $1::uuid AND "isActive" = TRUE AND "deletedAt" IS NULL LIMIT 1', productId)
  if (!products[0] || !Number.isFinite(quantity)) return NextResponse.redirect(new URL('/products', request.url), 303)
  const carts = await prisma.$queryRawUnsafe<Array<{ id: string }>>('SELECT id FROM public."Cart" WHERE "userId" = $1::uuid AND "deletedAt" IS NULL LIMIT 1', user.id)
  const cartId = carts[0]?.id || randomUUID()
  if (!carts[0]) await prisma.$executeRawUnsafe('INSERT INTO public."Cart" (id, "userId", "createdAt", "updatedAt") VALUES ($1::uuid, $2::uuid, NOW(), NOW())', cartId, user.id)
  const items = await prisma.$queryRawUnsafe<Array<{ id: string; quantity: number }>>('SELECT id, quantity FROM public."CartItem" WHERE "cartId" = $1::uuid AND "productId" = $2::uuid LIMIT 1', cartId, productId)
  if (items[0]) await prisma.$executeRawUnsafe('UPDATE public."CartItem" SET quantity = quantity + $1, "unitPrice" = $2, "updatedAt" = NOW() WHERE id = $3::uuid', quantity, products[0].price, items[0].id)
  else await prisma.$executeRawUnsafe('INSERT INTO public."CartItem" (id, "cartId", "productId", quantity, "unitPrice", "createdAt", "updatedAt") VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, NOW(), NOW())', randomUUID(), cartId, productId, quantity, products[0].price)
  return NextResponse.redirect(new URL('/cart', request.url), 303)
}