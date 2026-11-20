import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Server-side carts are not available. Use the storefront cart instead.' },
    { status: 410 },
  );
}