import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validators/auth";
import {
  generateSecureToken,
  getVerificationExpiry,
} from "@/features/auth/utils/tokens";
import { sendVerificationEmail } from "@/features/auth/utils/email";

export async function registerUser(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid registration details." };

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return { success: false, error: "Unable to create this account." };

  const role = await prisma.role.findUnique({ where: { name: "Customer" } });
  if (!role) return { success: false, error: "Customer role is not configured." };

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      roleId: role.id,
      isActive: true,
    },
  });

  const token = generateSecureToken();
  await prisma.verificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: getVerificationExpiry(),
    },
  });

  await sendVerificationEmail(user.email, user.name, token);

  return {
    success: true,
    message:
      "Account created successfully. Please check your email to verify your account.",
  };
}