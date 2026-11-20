import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticationError, requireApiUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const addressSchema = z.object({
  label: z.string().trim().max(40).optional(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  street: z.string().trim().min(3).max(300),
  city: z.string().trim().min(2).max(100),
  province: z.string().trim().max(100).optional(),
  country: z.string().trim().min(2).max(100).default('Zimbabwe'),
  postalCode: z.string().trim().max(20).optional(),
  isDefault: z.boolean().default(false),
})

function authFailure(error: unknown) {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  throw error
}

export async function GET() {
  let user
  try {
    user = await requireApiUser()
  } catch (error) {
    return authFailure(error)
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(addresses)
}

export async function POST(request: Request) {
  let user
  try {
    user = await requireApiUser()
  } catch (error) {
    return authFailure(error)
  }

  const parsed = addressSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Address information is invalid.' }, { status: 400 })
  }

  const address = await prisma.$transaction(async tx => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
    }

    const count = await tx.address.count({ where: { userId: user.id } })
    return tx.address.create({
      data: {
        ...parsed.data,
        isDefault: parsed.data.isDefault || count === 0,
        userId: user.id,
      },
    })
  })

  return NextResponse.json(address, { status: 201 })
}
