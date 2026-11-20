import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const formData = await request.formData()
  const token = String(formData.get('token') || '')
  const password = String(formData.get('password') || '')
  const confirmPassword = String(formData.get('confirmPassword') || '')
  if (!token || password.length < 8 || password !== confirmPassword) return NextResponse.redirect(new URL('/reset-password?error=invalid', request.url), 303)
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: createHash('sha256').update(token).digest('hex') },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  })
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
    return NextResponse.redirect(new URL('/forgot-password?error=expired', request.url), 303)
  }

  const hash = await bcrypt.hash(password, 12)
  const claimed = await prisma.$transaction(async tx => {
    const updated = await tx.passwordResetToken.updateMany({
      where: { id: resetToken.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    })
    if (updated.count !== 1) return false
    await tx.user.update({ where: { id: resetToken.userId }, data: { passwordHash: hash } })
    return true
  })
  if (!claimed) return NextResponse.redirect(new URL('/forgot-password?error=expired', request.url), 303)
  return NextResponse.redirect(new URL('/login?reset=1', request.url), 303)
}