import {NextResponse} from 'next/server'; import type {NextRequest} from 'next/server';
export function middleware(req:NextRequest){const p=req.nextUrl.pathname;if(!p.startsWith('/admin')&&!p.startsWith('/account')&&!p.startsWith('/checkout')&&!p.startsWith('/api/admin'))return NextResponse.next();if(!req.cookies.get('session')){const u=req.nextUrl.clone();u.pathname='/login';u.searchParams.set('next',p);return NextResponse.redirect(u)}return NextResponse.next()}
export const config={matcher:['/admin/:path*','/account/:path*','/checkout','/api/admin/:path*']};
