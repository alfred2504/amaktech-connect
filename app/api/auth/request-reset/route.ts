import { createHash, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!)
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const apiKey = process.env.RESEND_API_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!apiKey || !appUrl) {
    return NextResponse.redirect(new URL('/forgot-password?error=email-unavailable', request.url), 303)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.status !== 'ACTIVE') return NextResponse.redirect(new URL('/forgot-password?sent=1', request.url), 303)

  const token = randomBytes(32).toString('hex')
  const resetToken = await prisma.passwordResetToken.create({
    data: {
      token: createHash('sha256').update(token).digest('hex'),
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  })

  const resetUrl = new URL('/reset-password', appUrl)
  resetUrl.searchParams.set('token', token)
  let response: Response
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'AmakTech Connect <onboarding@resend.dev>',
        to: [user.email],
        subject: 'Reset your AmakTech Connect password',
        html: `<p>Hello ${escapeHtml(user.name)},</p><p>We received a request to reset your password.</p><p><a href="${escapeHtml(resetUrl.toString())}">Reset your password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`,
      }),
    })
  } catch (error) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
    console.error('Password reset email delivery failed.', error)
    return NextResponse.redirect(new URL('/forgot-password?error=email-unavailable', request.url), 303)
  }

  if (!response.ok) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
    console.error('Password reset email delivery failed.', { status: response.status })
    return NextResponse.redirect(new URL('/forgot-password?error=email-unavailable', request.url), 303)
  }

  return NextResponse.redirect(new URL('/forgot-password?sent=1', request.url), 303)
}