import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ productId: z.string().min(1) });
export async function GET() {
  let user
  try {
    user = await requireApiUser()
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: error.status })
    throw error
  }
  const items = await prisma.wishlistItem.findMany({ where: { userId: user.id, product: { status: 'ACTIVE' } }, include: { product: { include: { category: true, images: { orderBy: { sortOrder: 'asc' } } } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}
export async function POST(req: Request) {
  let user
  try {
    user = await requireApiUser()
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: error.status })
    throw error
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Product is required." }, { status: 400 });
  const product = await prisma.product.findFirst({ where: { id: parsed.data.productId, status: "ACTIVE" } });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  const item = await prisma.wishlistItem.upsert({ where: { userId_productId: { userId: user.id, productId: product.id } }, create: { userId: user.id, productId: product.id }, update: {} });
  return NextResponse.json({ item }, { status: 201 });
}
export async function DELETE(req: Request) {
  let user
  try {
    user = await requireApiUser()
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: error.status })
    throw error
  }
  const queryProductId = new URL(req.url).searchParams.get('productId')
  const parsed = schema.safeParse(queryProductId ? { productId: queryProductId } : await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Product is required." }, { status: 400 });
  await prisma.wishlistItem.deleteMany({ where: { userId: user.id, productId: parsed.data.productId } });
  return NextResponse.json({ ok: true });
}
