import { NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthenticationError, requireApiUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const addressUpdateSchema = z.object({
  label: z.string().trim().max(40).optional(),
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().min(7).max(30).optional(),
  street: z.string().trim().min(3).max(300).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  province: z.string().trim().max(100).optional(),
  country: z.string().trim().min(2).max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  isDefault: z.boolean().optional(),
}).refine(value => Object.keys(value).length > 0, 'At least one field is required.')

function authFailure(error: unknown) {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  throw error
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ addressId: string }> },
) {
  let user
  try {
    user = await requireApiUser()
  } catch (error) {
    return authFailure(error)
  }

  const { addressId } = await params
  const parsed = addressUpdateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Address information is invalid.' }, { status: 400 })
  }

  const updated = await prisma.$transaction(async tx => {
    const address = await tx.address.findFirst({ where: { id: addressId, userId: user.id } })
    if (!address) return null

    if (parsed.data.isDefault) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
    }

    return tx.address.update({ where: { id: address.id }, data: parsed.data })
  })

  if (!updated) return NextResponse.json({ error: 'Address not found.' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ addressId: string }> },
) {
  let user
  try {
    user = await requireApiUser()
  } catch (error) {
    return authFailure(error)
  }

  const { addressId } = await params
  const deleted = await prisma.$transaction(async tx => {
    const address = await tx.address.findFirst({ where: { id: addressId, userId: user.id } })
    if (!address) return false

    await tx.address.delete({ where: { id: address.id } })
    if (address.isDefault) {
      const nextDefault = await tx.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      })
      if (nextDefault) {
        await tx.address.update({ where: { id: nextDefault.id }, data: { isDefault: true } })
      }
    }
    return true
  })

  if (!deleted) return NextResponse.json({ error: 'Address not found.' }, { status: 404 })
  return NextResponse.json({ message: 'Address deleted.' })
}
