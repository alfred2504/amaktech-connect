import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticationError } from '@/lib/auth'
import { authorizeAdmin, requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  payoutId: z.string().min(1),
  action: z.enum(['PROCESS', 'PAY', 'FAIL']),
  reference: z.string().trim().min(3).max(100).optional(),
  notes: z.string().trim().max(500).optional(),
})

export async function GET() {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const payouts = await prisma.payout.findMany({
    include: { seller: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(payouts)
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
  if (!parsed.success) return NextResponse.json({ error: 'Payout action is invalid.' }, { status: 400 })
  if (parsed.data.action === 'PAY' && !parsed.data.reference) {
    return NextResponse.json({ error: 'A payout transfer reference is required before marking it paid.' }, { status: 400 })
  }

  const payout = await prisma.payout.findUnique({
    where: { id: parsed.data.payoutId },
    include: { seller: { select: { userId: true } } },
  })
  if (!payout) return NextResponse.json({ error: 'Payout not found.' }, { status: 404 })
  const allowed: Record<string, string[]> = {
    PENDING: ['PROCESS', 'FAIL'],
    PROCESSING: ['PAY', 'FAIL'],
  }
  if (!allowed[payout.status]?.includes(parsed.data.action)) {
    return NextResponse.json({ error: 'Invalid payout status transition.' }, { status: 409 })
  }

  const updated = await prisma.$transaction(async tx => {
    const result = await tx.payout.update({
      where: { id: payout.id },
      data: {
        status: parsed.data.action === 'PROCESS' ? 'PROCESSING' : parsed.data.action === 'PAY' ? 'PAID' : 'FAILED',
        reference: parsed.data.reference ?? payout.reference,
        notes: parsed.data.notes ?? payout.notes,
        processedAt: parsed.data.action === 'PAY' || parsed.data.action === 'FAIL' ? new Date() : payout.processedAt,
      },
    })
    await tx.notification.create({
      data: {
        userId: payout.seller.userId,
        title: 'Payout status updated',
        message: `Your payout request status is now ${result.status.toLowerCase()}.`,
        type: 'PAYOUT_STATUS',
        metadata: { payoutId: payout.id },
      },
    })
    await tx.auditLog.create({
      data: { actorId: admin.id, action: `PAYOUT_${parsed.data.action}`, entity: 'Payout', entityId: payout.id },
    })
    return result
  })
  return NextResponse.json({ payout: updated })
}
