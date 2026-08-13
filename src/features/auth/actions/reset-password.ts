"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function resetPassword(token: string, password: string) {
  const parsed = resetSchema.safeParse({
    token,
    password,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid password reset request.",
    };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      token,
    },
  });

  if (!resetToken) {
    return {
      success: false,
      error: "Invalid or expired reset link.",
    };
  }

  if (resetToken.usedAt) {
    return {
      success: false,
      error: "This reset link has already been used.",
    };
  }

  if (resetToken.expiresAt.getTime() < Date.now()) {
    await prisma.passwordResetToken.delete({
      where: {
        id: resetToken.id,
      },
    });

    return {
      success: false,
      error: "This reset link has expired.",
    };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        password: hashedPassword,
      },
    }),

    prisma.passwordResetToken.update({
      where: {
        id: resetToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),

    prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetToken.userId,
        id: {
          not: resetToken.id,
        },
      },
    }),
  ]);

  return {
    success: true,
  };
}
