import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/features/auth/actions/request-password-reset";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    const result = await requestPasswordReset(email);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
