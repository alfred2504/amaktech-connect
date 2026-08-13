import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requirePermission(permissionName: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!user?.role) {
    redirect("/unauthorized");
  }

  const hasPermission = user.role.permissions.some(
    (permission) => permission.name === permissionName
  );

  if (!hasPermission) {
    redirect("/unauthorized");
  }

  return session;
}
