import { randomBytes, randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const users = await prisma.$queryRawUnsafe<Array<{ id: string }>>('SELECT id FROM public."User" WHERE lower(email) = $1 AND "deletedAt" IS NULL LIMIT 1', email)
  if (!users[0]) return NextResponse.redirect(new URL('/forgot-password?sent=1', request.url), 303)
  const token = randomBytes(32).toString('hex')
  await prisma.$executeRawUnsafe('INSERT INTO public."PasswordResetToken" (id, token, "expiresAt", "createdAt", "userId") VALUES ($1, $2, NOW() + INTERVAL \'1 hour\', NOW(), $3::uuid)', randomUUID(), token, users[0].id)
  return NextResponse.redirect(new URL(`/reset-password?token=${token}`, request.url), 303)
}