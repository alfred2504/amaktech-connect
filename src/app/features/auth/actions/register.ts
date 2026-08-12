import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validators/auth";

export async function registerUser(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid registration details." };

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "Unable to create this account." };

  const role = await prisma.role.findUnique({ where: { name: "Customer" } });
  if (!role) return { success: false, error: "Customer role is not configured." };

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId: role.id,
      isActive: true,
    },
  });

  return { success: true, userId: user.id };
}
