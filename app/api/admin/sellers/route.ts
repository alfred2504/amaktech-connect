import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticationError } from '@/lib/auth'
import { authorizeAdmin, requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  sellerId: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT', 'SUSPEND']),
})

export async function GET() {
  const denied = await authorizeAdmin()
  if (denied) return denied
  const sellers = await prisma.seller.findMany({
    include: { user: { select: { id: true, name: true, email: true, phone: true, status: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sellers)
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
  if (!parsed.success) return NextResponse.json({ error: 'Seller action is invalid.' }, { status: 400 })
  const seller = await prisma.seller.findUnique({ where: { id: parsed.data.sellerId } })
  if (!seller) return NextResponse.json({ error: 'Seller not found.' }, { status: 404 })

  const updated = await prisma.$transaction(async tx => {
    const now = new Date()
    const result = await tx.seller.update({
      where: { id: seller.id },
      data: {
        status: parsed.data.action === 'APPROVE'
          ? 'APPROVED'
          : parsed.data.action === 'REJECT'
            ? 'REJECTED'
            : 'SUSPENDED',
        approvedAt: parsed.data.action === 'APPROVE' ? now : seller.approvedAt,
      },
    })

    if (parsed.data.action === 'APPROVE') {
      await tx.user.update({ where: { id: seller.userId }, data: { role: 'SELLER', status: 'ACTIVE' } })
      await tx.notification.create({
        data: {
          userId: seller.userId,
          title: 'Seller application approved',
          message: 'Your store is approved. You can now start selling.',
          type: 'SELLER_APPROVED',
        },
      })
    } else if (parsed.data.action === 'REJECT') {
      await tx.notification.create({
        data: {
          userId: seller.userId,
          title: 'Seller application update',
          message: 'Your seller application was not approved.',
          type: 'SELLER_REJECTED',
        },
      })
    } else {
      await tx.user.update({ where: { id: seller.userId }, data: { status: 'SUSPENDED' } })
      await tx.product.updateMany({ where: { sellerId: seller.id }, data: { status: 'ARCHIVED' } })
    }

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: `SELLER_${parsed.data.action}`,
        entity: 'Seller',
        entityId: seller.id,
      },
    })
    return result
  })

  return NextResponse.json({ seller: updated })
}
