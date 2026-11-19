import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
const schema = z.object({ productId: z.string().min(1) });
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const items = await prisma.wishlistItem.findMany({ where: { userId: user.id }, include: { product: { include: { category: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}
export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in to save favorites." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Product is required." }, { status: 400 });
  const product = await prisma.product.findFirst({ where: { id: parsed.data.productId, active: true } });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  const item = await prisma.wishlistItem.upsert({ where: { userId_productId: { userId: user.id, productId: product.id } }, create: { userId: user.id, productId: product.id }, update: {} });
  return NextResponse.json({ item }, { status: 201 });
}
export async function DELETE(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Product is required." }, { status: 400 });
  await prisma.wishlistItem.deleteMany({ where: { userId: user.id, productId: parsed.data.productId } });
  return NextResponse.json({ ok: true });
}
