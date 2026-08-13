"use server";

import { prisma } from "@/lib/prisma";
import {
  generateSecureToken,
  getVerificationExpiry,
} from "@/features/auth/utils/tokens";
import { sendVerificationEmail } from "@/features/auth/utils/email";

const response = {
  success: true,
  message:
    "If an unverified account exists with that email, a verification link has been sent.",
};

export async function resendVerificationEmail(email: unknown) {
  if (typeof email !== "string") return response;

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return response;

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Return the same response for missing and verified accounts to prevent
  // account discovery through this public endpoint.
  if (!user || user.emailVerified) return response;

  const token = generateSecureToken();
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
    prisma.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: getVerificationExpiry(),
      },
    }),
  ]);

  await sendVerificationEmail(user.email, user.name, token);

  return response;
}
