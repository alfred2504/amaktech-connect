import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeAdmin, requireAdmin } from '@/lib/admin'
import { AuthenticationError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  orderId: z.string().min(1),
  status: z.enum(['PENDING', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED']),
  carrier: z.string().trim().max(100).optional(),
  trackingNumber: z.string().trim().max(150).optional(),
  trackingUrl: z.string().url().optional(),
  estimatedDate: z.string().datetime().optional(),
  notes: z.string().trim().max(1000).optional(),
})

export async function GET() {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const shipments = await prisma.shipment.findMany({
    include: { order: { select: { orderNumber: true, status: true, user: { select: { name: true, email: true } } } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(shipments)
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
  if (!parsed.success) return NextResponse.json({ error: 'Shipment update is invalid.' }, { status: 400 })
  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    select: { id: true, userId: true, status: true, _count: { select: { sellerFulfillments: true } } },
  })
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })

  const shipment = await prisma.$transaction(async tx => {
    const updated = await tx.shipment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        status: parsed.data.status,
        carrier: parsed.data.carrier,
        trackingNumber: parsed.data.trackingNumber,
        trackingUrl: parsed.data.trackingUrl,
        estimatedDate: parsed.data.estimatedDate ? new Date(parsed.data.estimatedDate) : null,
        notes: parsed.data.notes,
        deliveredAt: parsed.data.status === 'DELIVERED' ? new Date() : null,
      },
      update: {
        status: parsed.data.status,
        carrier: parsed.data.carrier,
        trackingNumber: parsed.data.trackingNumber,
        trackingUrl: parsed.data.trackingUrl,
        estimatedDate: parsed.data.estimatedDate ? new Date(parsed.data.estimatedDate) : null,
        notes: parsed.data.notes,
        deliveredAt: parsed.data.status === 'DELIVERED' ? new Date() : null,
      },
    })

    if (parsed.data.status === 'DELIVERED' && order._count.sellerFulfillments === 0) {
      await tx.order.update({ where: { id: order.id }, data: { status: 'DELIVERED' } })
    }
    await tx.notification.create({
      data: {
        userId: order.userId,
        title: 'Shipment updated',
        message: `Shipment status is now ${parsed.data.status.toLowerCase().replace(/_/g, ' ')}.`,
        type: 'SHIPMENT_UPDATED',
        metadata: { orderId: order.id },
      },
    })
    await tx.auditLog.create({
      data: { actorId: admin.id, action: 'SHIPMENT_UPDATED', entity: 'Shipment', entityId: updated.id },
    })
    return updated
  })
  return NextResponse.json({ shipment })
}
