import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
const schema = z.object({ storeName: z.string().min(2).max(100), slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/), description: z.string().max(2000).optional() });
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to apply as a seller." }, { status: 401 });
  if (session.role === "ADMIN") return NextResponse.json({ error: "Administrator accounts cannot register as sellers." }, { status: 400 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid store name and URL slug." }, { status: 400 });
  const existing = await prisma.seller.findFirst({ where: { OR: [{ userId: session.id }, { storeName: parsed.data.storeName }, { slug: parsed.data.slug }] } });
  if (existing) return NextResponse.json({ error: "A seller profile or store with these details already exists." }, { status: 409 });
  const seller = await prisma.seller.create({ data: { ...parsed.data, userId: session.id } });
  return NextResponse.json({ seller }, { status: 201 });
}
