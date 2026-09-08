import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'

export async function POST(request: Request) {
  const user = await requireUser()
  const data = await request.formData()
  const firstName = String(data.get('firstName') || '').trim(); const lastName = String(data.get('lastName') || '').trim()
  const line1 = String(data.get('line1') || '').trim(); const city = String(data.get('city') || '').trim(); const state = String(data.get('state') || '').trim(); const postalCode = String(data.get('postalCode') || '').trim(); const country = String(data.get('country') || '').trim()
  if (![firstName, lastName, line1, city, state, postalCode, country].every(Boolean)) return NextResponse.redirect(new URL('/checkout?error=address', request.url), 303)
  const carts = await prisma.$queryRawUnsafe<Array<{ id: string }>>('SELECT id FROM public."Cart" WHERE "userId" = $1::uuid AND "deletedAt" IS NULL LIMIT 1', user.id)
  if (!carts[0]) return NextResponse.redirect(new URL('/cart', request.url), 303)
  const items = await prisma.$queryRawUnsafe<Array<{ productId: string; quantity: number; unitPrice: number }>>('SELECT "productId", quantity, "unitPrice" FROM public."CartItem" WHERE "cartId" = $1::uuid', carts[0].id)
  if (!items.length) return NextResponse.redirect(new URL('/cart', request.url), 303)
  const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0); const tax = 0; const shipping = 0; const total = subtotal
  const addressId = randomUUID(); const orderId = randomUUID()
  await prisma.$executeRawUnsafe('INSERT INTO public."Address" (id, "userId", "firstName", "lastName", line1, city, state, "postalCode", country, "isDefault", "createdAt", "updatedAt") VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, FALSE, NOW(), NOW())', addressId, user.id, firstName, lastName, line1, city, state, postalCode, country)
  await prisma.$executeRawUnsafe('INSERT INTO public."Order" (id, "userId", "addressId", subtotal, tax, shipping, total, "createdAt", "updatedAt") VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, NOW(), NOW())', orderId, user.id, addressId, subtotal, tax, shipping, total)
  for (const item of items) await prisma.$executeRawUnsafe('INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "unitPrice", "totalPrice", "createdAt", "updatedAt") VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, NOW(), NOW())', randomUUID(), orderId, item.productId, item.quantity, item.unitPrice, Number(item.unitPrice) * item.quantity)
  await prisma.$executeRawUnsafe('DELETE FROM public."CartItem" WHERE "cartId" = $1::uuid', carts[0].id)
  return NextResponse.redirect(new URL(`/account/orders/${orderId}`, request.url), 303)
}