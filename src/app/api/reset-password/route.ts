import { NextResponse } from "next/server";
import { resetPassword } from "@/features/auth/actions/reset-password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;
    const result = await resetPassword(token, password);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
