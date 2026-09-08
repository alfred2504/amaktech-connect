"use server";

import { prisma } from "@/lib/prisma";

import { requirePermission } from "@/lib/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";

import {
  categorySchema,
  type CategoryInput,
} from "../schemas/category-schema";

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>
) {
  await requirePermission(
    PERMISSIONS.CATEGORY_UPDATE
  );

  const parsed =
    categorySchema.partial().safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid category details.",
    };
  }

  // Check if category exists
  const category =
    await prisma.category.findUnique({
      where: { id },
    });

  if (!category) {
    return {
      success: false,
      error: "Category not found.",
    };
  }

  // Check for duplicate name/slug if they're being updated
  if (
    parsed.data.name ||
    parsed.data.slug
  ) {
    const orConditions: Array<
      | { name: string }
      | { slug: string }
    > = [];

    if (parsed.data.name) {
      orConditions.push({
        name: parsed.data.name,
      });
    }

    if (parsed.data.slug) {
      orConditions.push({
        slug: parsed.data.slug,
      });
    }

    const existing =
      await prisma.category.findFirst({
        where: {
          id: { not: id },
          deletedAt: null,
          OR: orConditions,
        },
      });

    if (existing) {
      return {
        success: false,
        error:
          "A category with this name or slug already exists.",
      };
    }
  }

  const updated =
    await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

  return {
    success: true,
    category: updated,
  };
}
