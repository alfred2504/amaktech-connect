import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const formData = await request.formData()
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  if (!name || !email || password.length < 8) return NextResponse.redirect(new URL('/register?error=invalid', request.url), 303)
  const role = await prisma.$queryRawUnsafe<Array<{ id: string }>>('SELECT id FROM public."Role" WHERE name = $1 AND "deletedAt" IS NULL LIMIT 1', 'Customer')
  if (!role[0]) return NextResponse.redirect(new URL('/register?error=setup', request.url), 303)
  const hash = await bcrypt.hash(password, 12)
  try {
    await prisma.$executeRawUnsafe(`INSERT INTO public."User" (id, name, email, password, "isActive", "roleId", "createdAt", "updatedAt") VALUES ($1::uuid, $2, $3, $4, TRUE, $5::uuid, NOW(), NOW())`, randomUUID(), name, email, hash, role[0].id)
  } catch { return NextResponse.redirect(new URL('/register?error=exists', request.url), 303) }
  return NextResponse.redirect(new URL('/login?registered=1', request.url), 303)
}