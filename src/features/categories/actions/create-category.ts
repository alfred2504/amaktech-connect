"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";

import {
  categorySchema,
  type CategoryInput,
} from "../schemas/category-schema";

export async function createCategory(input: CategoryInput) {
  await requirePermission(PERMISSIONS.CATEGORY_CREATE);

  const parsed = categorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid category details.",
    };
  }

  const existing = await prisma.category.findFirst({
    where: {
      OR: [
        {
          name: parsed.data.name,
        },
        {
          slug: parsed.data.slug,
        },
      ],
    },
  });

  if (existing) {
    return {
      success: false,
      error: "A category with this name or slug already exists.",
    };
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      image: parsed.data.image || null,
    },
  });

  return {
    success: true,
    category,
  };
}