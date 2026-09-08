import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'

async function currentUser() {
  const userId = (await cookies()).get('session_user_id')?.value
  if (!userId) return null

  const users = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; role: string }>>(
    `SELECT u.id, u.name, r.name AS role
     FROM public."User" u
     JOIN public."Role" r ON r.id = u."roleId"
     WHERE u.id = $1::uuid AND u."isActive" = TRUE AND u."deletedAt" IS NULL
     LIMIT 1`,
    userId,
  )

  return users[0] ?? null
}

export async function requireUser() {
  const user = await currentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireAdmin() {
  const user = await currentUser()
  if (!user) redirect('/login')
  if (!['Administrator', 'Super Administrator', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) redirect('/')
  return user
}

export async function requireVendor() {
  const user = await currentUser()
  if (!user) redirect('/login')
  if (!['Vendor', 'Seller', 'VENDOR', 'Administrator', 'Super Administrator'].includes(user.role)) redirect('/account')
  return user
}