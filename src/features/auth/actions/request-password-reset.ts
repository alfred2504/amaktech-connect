"use server";

import { prisma } from "@/lib/prisma";

import {
  generateSecureToken,
  getPasswordResetExpiry,
} from "@/features/auth/utils/tokens";

import { sendPasswordResetEmail } from "@/features/auth/utils/email";

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    return {
      success: true,
      message:
        "If an account exists with that email, a password reset link has been sent.",
    };
  }

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  const token = generateSecureToken();

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: getPasswordResetExpiry(),
    },
  });

  await sendPasswordResetEmail(user.email, user.name, token);

  return {
    success: true,
    message:
      "If an account exists with that email, a password reset link has been sent.",
  };
}
