import { NextResponse } from "next/server";
import { resendVerificationEmail } from "@/features/auth/actions/resend-verification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(await resendVerificationEmail(body?.email));
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to resend the verification email." },
      { status: 500 },
    );
  }
}
