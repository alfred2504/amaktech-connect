import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from './lib/session-constants'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const protectedPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/api/admin')

  if (!protectedPath || request.cookies.get(SESSION_COOKIE_NAME)) {
    return NextResponse.next()
  }

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout', '/api/admin/:path*'],
}
