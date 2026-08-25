import { NextResponse } from "next/server";
import { registerUser } from "@/features/auth/actions/register";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await registerUser(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
