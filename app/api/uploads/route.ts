import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { AuthenticationError, requireApiRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadToSupabase } from '@/lib/storage'

export const runtime = 'nodejs'

const imageTypes = new Map([
  ['image/jpeg', { extension: 'jpg', signature: (bytes: Buffer) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff }],
  ['image/png', { extension: 'png', signature: (bytes: Buffer) => bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) }],
  ['image/webp', { extension: 'webp', signature: (bytes: Buffer) => bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' }],
])

export async function POST(request: Request) {
  let user
  try {
    user = await requireApiRole(['SELLER', 'ADMIN'])
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const productId = String(formData.get('productId') ?? '').trim()
  if (!(file instanceof File)) return NextResponse.json({ error: 'Select an image file.' }, { status: 400 })
  if (file.size < 1 || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be no larger than 5MB.' }, { status: 400 })
  }

  const imageType = imageTypes.get(file.type)
  if (!imageType) return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are accepted.' }, { status: 415 })
  const bytes = Buffer.from(await file.arrayBuffer())
  if (!imageType.signature(bytes)) {
    return NextResponse.json({ error: 'The image content does not match its file type.' }, { status: 400 })
  }

  const seller = user.role === 'SELLER'
    ? await prisma.seller.findUnique({ where: { userId: user.id } })
    : null
  if (user.role === 'SELLER' && (!seller || seller.status !== 'APPROVED')) {
    return NextResponse.json({ error: 'Approved seller account required.' }, { status: 403 })
  }

  let product = null
  if (productId) {
    if (user.role === 'ADMIN') {
      product = await prisma.product.findFirst({
        where: { id: productId },
        select: { id: true, name: true },
      })
    } else if (seller) {
      product = await prisma.product.findFirst({
        where: { id: productId, sellerId: seller.id },
        select: { id: true, name: true },
      })
    }
    if (!product) return NextResponse.json({ error: 'Product not found for this account.' }, { status: 404 })
  }

  const folder = product ? product.id : seller?.id ?? user.id
  const path = `${folder}/${randomUUID()}.${imageType.extension}`
  try {
    const url = await uploadToSupabase(new File([bytes], file.name, { type: file.type }), path)
    if (!product) return NextResponse.json({ url })

    const sortOrder = await prisma.productImage.count({ where: { productId: product.id } })
    const image = await prisma.productImage.create({
      data: { productId: product.id, url, alt: product.name, sortOrder },
    })
    return NextResponse.json({ image, url }, { status: 201 })
  } catch (error) {
    console.error('Image upload failed.', error)
    return NextResponse.json({ error: 'Image upload failed. Check storage configuration and try again.' }, { status: 500 })
  }
}
