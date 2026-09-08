import { NextResponse } from 'next/server'

export async function GET(request: Request) { const response = NextResponse.redirect(new URL('/', request.url)); response.cookies.delete('session_user_id'); return response }
export async function POST(request: Request) { const response = NextResponse.redirect(new URL('/', request.url), 303); response.cookies.delete('session_user_id'); return response }