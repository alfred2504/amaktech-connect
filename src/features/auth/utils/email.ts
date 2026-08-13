import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Resend API key. Set RESEND_API_KEY in your environment.");
  }

  return new Resend(apiKey);
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  let resend;
  try {
    resend = getResendClient();
  } catch (err) {
    console.warn("Skipping verification email: ", (err as Error).message);
    return null;
  }
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const verificationUrl =
    `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;

  const { data, error } = await resend.emails.send({
    from:
      process.env.EMAIL_FROM ??
      "AmakTech Connect <onboarding@resend.dev>",
    to: email,
    subject: "Verify your AmakTech Connect account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1>Welcome to AmakTech Connect, ${name}!</h1>

        <p>
          Thank you for creating your account.
          Please verify your email address by clicking the button below.
        </p>

        <p>
          <a
            href="${verificationUrl}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#2563eb;
              color:white;
              text-decoration:none;
              border-radius:8px;
            "
          >
            Verify Email
          </a>
        </p>

        <p>
          This verification link expires in 24 hours.
        </p>

        <p>
          If you did not create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Verification email error:", error);
    // Log and continue; do not throw to avoid breaking user registration.
    return null;
  }

  return data;
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  let resend;
  try {
    resend = getResendClient();
  } catch (err) {
    console.warn("Skipping password reset email: ", (err as Error).message);
    return null;
  }
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const resetUrl =
    `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const { data, error } = await resend.emails.send({
    from:
      process.env.EMAIL_FROM ??
      "AmakTech Connect <onboarding@resend.dev>",
    to: email,
    subject: "Reset your AmakTech Connect password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1>Password Reset</h1>

        <p>Hello ${name},</p>

        <p>
          We received a request to reset your AmakTech Connect password.
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#2563eb;
              color:white;
              text-decoration:none;
              border-radius:8px;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link expires in 1 hour.
        </p>

        <p>
          If you did not request a password reset, ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Password reset email error:", error);
    // Log and continue; do not throw to avoid breaking the password reset request flow.
    return null;
  }

  return data;
}