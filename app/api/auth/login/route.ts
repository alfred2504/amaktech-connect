import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() } });
  if (!user || !user.active || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  await createSession({ id: user.id, role: user.role, email: user.email, name: user.name });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
