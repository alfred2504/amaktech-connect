import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
const schema = z.object({ name: z.string().min(2).max(100), email: z.string().email().max(200), password: z.string().min(8).max(128), phone: z.string().max(30).optional() });
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please provide valid registration details. Password must be at least 8 characters." }, { status: 400 });
  const { name, email, password, phone } = parsed.data;
  const normalized = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.user.create({
      data: { name, email: normalized, passwordHash, phone },
      select: { id: true, name: true, email: true, role: true },
    });
    await createSession(user);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email or phone already exists." }, { status: 409 });
    }
    throw error;
  }
}
