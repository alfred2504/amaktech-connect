import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(expected: string | string[]) {
  const session = await requireAuth();
  const roleName = session.user.role;
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!roleName || !allowed.includes(roleName)) {
    redirect("/dashboard");
  }
  return session;
}

export async function requirePermission(permissionName: string) {
  const session = await requireAuth();
  const roleName = session.user.role;
  if (!roleName) redirect("/dashboard");

  const role = await prisma.role.findUnique({
    where: { name: roleName },
    include: { permissions: true },
  });

  if (!role) redirect("/dashboard");

  const permissionAliases: Record<string, string[]> = {
    "inventory:read": ["inventory.view"],
    "inventory:update": ["inventory.manage"],
  };
  const acceptedNames = [
    permissionName,
    ...(permissionAliases[permissionName] ?? []),
  ];
  const has = role.permissions.some((p) =>
    acceptedNames.includes(p.name)
  );
  if (!has) redirect("/dashboard");

  return session;
}
