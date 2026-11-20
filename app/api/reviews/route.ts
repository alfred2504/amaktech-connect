import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ productId: z.string().min(1), rating: z.number().int().min(1).max(5), title: z.string().trim().max(120).optional(), comment: z.string().trim().max(3000).optional() });
export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId is required." }, { status: 400 });
  const reviews = await prisma.review.findMany({ where: { productId, status: "APPROVED" }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ reviews });
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
  if (!parsed.success) return NextResponse.json({ error: "Review details are invalid." }, { status: 400 });
  const purchased = await prisma.orderItem.findFirst({ where: { productId: parsed.data.productId, order: { userId: user.id, status: "DELIVERED" }, fulfillment: { status: "DELIVERED" } } });
  if (!purchased) return NextResponse.json({ error: "Only customers who received this product can review it." }, { status: 403 });
  const review = await prisma.review.upsert({ where: { userId_productId: { userId: user.id, productId: parsed.data.productId } }, create: { ...parsed.data, userId: user.id }, update: { ...parsed.data, status: "PENDING" } });
  return NextResponse.json({ review, message: "Review submitted for moderation." }, { status: 201 });
}
