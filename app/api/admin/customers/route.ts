import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeAdmin, requireAdmin } from '@/lib/admin'
import { AuthenticationError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  userId: z.string().min(1),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

export async function GET() {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(customers)
}

export async function PATCH(request: Request) {
  let admin
  try {
    admin = await requireAdmin()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Customer update is invalid.' }, { status: 400 })
  if (parsed.data.userId === admin.id && parsed.data.status === 'SUSPENDED') {
    return NextResponse.json({ error: 'You cannot suspend your own account.' }, { status: 409 })
  }

  const result = await prisma.user.updateMany({
    where: { id: parsed.data.userId, role: 'CUSTOMER' },
    data: { status: parsed.data.status },
  })
  if (!result.count) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 })
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: `CUSTOMER_${parsed.data.status}`,
      entity: 'User',
      entityId: parsed.data.userId,
    },
  })
  return NextResponse.json({ success: true })
}
