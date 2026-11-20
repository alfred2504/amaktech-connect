import { getAuthenticatedUser } from '@/lib/auth'
import {
  clearSession,
  createSession as createSignedSession,
  getSession as getSignedSession,
} from '@/lib/session'

export type SessionUser = {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN'
}

export async function createSession(user: SessionUser) {
  await createSignedSession(user)
}

export async function getSession(): Promise<SessionUser | null> {
  return getSignedSession()
}

export async function requireUser() {
  const user = await getAuthenticatedUser()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

export async function requireRole(roles: SessionUser['role'][]) {
  const user = await requireUser()
  if (!roles.includes(user.role)) throw new Error('FORBIDDEN')
  return user
}

export async function destroySession() {
  await clearSession()
}
