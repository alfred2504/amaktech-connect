import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth'
import { AuthenticationError } from '@/lib/auth'

export async function requireAdmin() {
  return requireApiRole(['ADMIN'])
}

export async function authorizeAdmin() {
  try {
    await requireAdmin()
    return null
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }
}
