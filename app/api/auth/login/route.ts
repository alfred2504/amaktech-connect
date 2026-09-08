import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const users = email
    ? await prisma.$queryRaw<Array<{ id: string; password: string; role: string }>>`
        SELECT u.id, u.password, r.name AS role
        FROM public."User" u
        JOIN public."Role" r ON r.id = u."roleId"
        WHERE lower(u.email) = ${email}
          AND u."isActive" = TRUE
          AND u."deletedAt" IS NULL
        LIMIT 1
      `
    : []
  const user = users[0]

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url), 303)
  }

  const destination = ['Administrator', 'Super Administrator', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)
    ? '/admin'
    : ['Vendor', 'Seller', 'VENDOR'].includes(user.role)
      ? '/vendor'
      : '/account'
  const response = NextResponse.redirect(new URL(destination, request.url), 303)
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
  response.cookies.set('session_user_id', user.id, cookieOptions)
  response.cookies.set('session', user.id, cookieOptions)
  return response
}