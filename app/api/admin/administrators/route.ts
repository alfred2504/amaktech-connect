import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  AuthenticationError,
  requireApiSuperAdmin,
} from '@/lib/auth'
import { SUPER_ADMIN_EMAIL } from '@/lib/admin-constants'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  action: z.enum(['ADD', 'REMOVE']),
  email: z.string().email().transform(value => value.toLowerCase().trim()),
})

async function getSuperAdmin(): Promise<
  | { authorized: true; admin: Awaited<ReturnType<typeof requireApiSuperAdmin>> }
  | { authorized: false; response: NextResponse }
> {
  try {
    return { authorized: true, admin: await requireApiSuperAdmin() }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        authorized: false,
        response: NextResponse.json({ error: error.message }, { status: error.status }),
      }
    }
    throw error
  }
}

export async function GET() {
  const access = await getSuperAdmin()
  if (!access.authorized) return access.response

  const administrators = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(administrators.map(admin => ({
    ...admin,
    isSuperAdmin: admin.email.toLowerCase() === SUPER_ADMIN_EMAIL,
  })))
}

export async function POST(request: Request) {
  const access = await getSuperAdmin()
  if (!access.authorized) return access.response

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Provide a valid email and administrator action.' }, { status: 400 })
  }

  if (parsed.data.email === SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'The super administrator account cannot be changed here.' }, { status: 409 })
  }

  const target = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, role: true },
  })
  if (!target) {
    return NextResponse.json({ error: 'Create the account before granting administrator access.' }, { status: 404 })
  }

  const expectedRole = parsed.data.action === 'ADD' ? 'CUSTOMER' : 'ADMIN'
  const nextRole = parsed.data.action === 'ADD' ? 'ADMIN' : 'CUSTOMER'
  if (target.role !== expectedRole) {
    return NextResponse.json({ error: 'This account cannot be changed with that action.' }, { status: 409 })
  }

  const changed = await prisma.$transaction(async transaction => {
    const result = await transaction.user.updateMany({
      where: { id: target.id, role: expectedRole },
      data: { role: nextRole },
    })
    if (!result.count) return false

    await transaction.auditLog.create({
      data: {
        actorId: access.admin.id,
        action: parsed.data.action === 'ADD' ? 'ADMIN_ADDED' : 'ADMIN_REMOVED',
        entity: 'User',
        entityId: target.id,
      },
    })
    return true
  })

  if (!changed) {
    return NextResponse.json({ error: 'The account role changed; refresh and try again.' }, { status: 409 })
  }

  return NextResponse.json({ success: true })
}
