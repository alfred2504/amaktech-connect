import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
const schema = z.object({ productId: z.string().min(1), rating: z.number().int().min(1).max(5), title: z.string().max(120).optional(), body: z.string().max(3000).optional() });
export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId is required." }, { status: 400 });
  const reviews = await prisma.review.findMany({ where: { productId, status: "APPROVED" }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ reviews });
}
export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in to leave a review." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Review details are invalid." }, { status: 400 });
  const purchased = await prisma.orderItem.findFirst({ where: { productId: parsed.data.productId, order: { userId: user.id, status: "DELIVERED" } } });
  if (!purchased) return NextResponse.json({ error: "Only customers who received this product can review it." }, { status: 403 });
  const review = await prisma.review.upsert({ where: { userId_productId: { userId: user.id, productId: parsed.data.productId } }, create: { ...parsed.data, userId: user.id }, update: { ...parsed.data, status: "PENDING" } });
  return NextResponse.json({ review, message: "Review submitted for moderation." }, { status: 201 });
}
