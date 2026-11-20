import { redirect } from 'next/navigation'
import { getSession } from './session'
import { prisma } from './prisma'

export class AuthenticationError extends Error {
  constructor(readonly status: 401 | 403, message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export async function getAuthenticatedUser() {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, phone: true, role: true, status: true },
  })

  return user?.status === 'ACTIVE' ? user : null
}

export async function requireUser() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')
  return user
}

export async function requireApiUser() {
  const user = await getAuthenticatedUser()
  if (!user) throw new AuthenticationError(401, 'Authentication required.')
  return user
}

export async function requireApiRole(roles: Array<'CUSTOMER' | 'SELLER' | 'ADMIN'>) {
  const user = await requireApiUser()
  if (!roles.includes(user.role)) throw new AuthenticationError(403, 'Insufficient permissions.')
  return user
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') redirect('/')
  return user
}

export async function requireVendor() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')
  if (user.role !== 'SELLER' && user.role !== 'ADMIN') redirect('/account')
  return user
}