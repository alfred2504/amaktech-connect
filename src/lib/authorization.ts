import { auth } from "@/auth";

export { requireAuth } from "./auth/require-auth";
export { requireRole } from "./auth/require-role";
export { requirePermission } from "./auth/require-permission";

export async function getCurrentSession() {
  return await auth();
}

export async function requireAuthenticatedUser() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}