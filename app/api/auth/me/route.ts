import { NextResponse } from 'next/server'
import { AuthenticationError, requireApiUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireApiUser()
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ user: null, error: error.message }, { status: error.status })
    }
    throw error
  }
}
