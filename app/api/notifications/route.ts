import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticationError, requireApiUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateSchema = z.object({ notificationId: z.string().min(1) })

export async function GET() {
  let user
  try {
    user = await requireApiUser()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(notifications)
}

export async function PATCH(request: Request) {
  let user
  try {
    user = await requireApiUser()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Notification id is required.' }, { status: 400 })
  const updated = await prisma.notification.updateMany({
    where: { id: parsed.data.notificationId, userId: user.id },
    data: { readAt: new Date() },
  })
  if (!updated.count) return NextResponse.json({ error: 'Notification not found.' }, { status: 404 })
  return NextResponse.json({ success: true })
}
