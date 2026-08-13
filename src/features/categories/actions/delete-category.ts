"use server";

import { prisma } from "@/lib/prisma";

import { requirePermission } from "@/lib/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";

export async function deleteCategory(
  id: string
) {
  await requirePermission(
    PERMISSIONS.CATEGORY_DELETE
  );

  const category =
    await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

  if (!category) {
    return {
      success: false,
      error: "Category not found.",
    };
  }

  // Prevent deletion if category has products
  if (category._count.products > 0) {
    return {
      success: false,
      error:
        "Cannot delete category with products. Please reassign or delete products first.",
    };
  }

  await prisma.category.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return {
    success: true,
    message: "Category deleted successfully.",
  };
}
