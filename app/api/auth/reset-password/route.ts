import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const formData = await request.formData()
  const token = String(formData.get('token') || '')
  const password = String(formData.get('password') || '')
  const confirmPassword = String(formData.get('confirmPassword') || '')
  if (!token || password.length < 8 || password !== confirmPassword) return NextResponse.redirect(new URL('/reset-password?error=invalid', request.url), 303)
  const tokens = await prisma.$queryRawUnsafe<Array<{ userId: string }>>('SELECT "userId" FROM public."PasswordResetToken" WHERE token = $1 AND "usedAt" IS NULL AND "expiresAt" > NOW() LIMIT 1', token)
  if (!tokens[0]) return NextResponse.redirect(new URL('/forgot-password?error=expired', request.url), 303)
  const hash = await bcrypt.hash(password, 12)
  await prisma.$executeRawUnsafe('UPDATE public."User" SET password = $1, "updatedAt" = NOW() WHERE id = $2::uuid', hash, tokens[0].userId)
  await prisma.$executeRawUnsafe('UPDATE public."PasswordResetToken" SET "usedAt" = NOW() WHERE token = $1', token)
  return NextResponse.redirect(new URL('/login?reset=1', request.url), 303)
}