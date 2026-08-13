"use server";

import { prisma } from "@/lib/prisma";

export async function verifyEmail(token: string) {
  if (!token) {
    return {
      success: false,
      error: "Verification token is required.",
    };
  }

  const verificationToken =
    await prisma.verificationToken.findUnique({
      where: {
        token,
      },
      include: {
        user: true,
      },
    });

  if (!verificationToken) {
    return {
      success: false,
      error: "Invalid verification link.",
    };
  }

  if (
    verificationToken.expiresAt.getTime() <
    Date.now()
  ) {
    await prisma.verificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });

    return {
      success: false,
      error: "This verification link has expired.",
    };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        emailVerified: new Date(),
      },
    }),

    prisma.verificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    }),
  ]);

  return {
    success: true,
  };
}