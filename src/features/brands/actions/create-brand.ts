"use server";

import { prisma } from "@/lib/prisma";

import { requirePermission } from "@/lib/auth/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";

import {
  brandSchema,
  type BrandInput,
} from "../schemas/brand-schema";

export async function createBrand(input: BrandInput) {
  await requirePermission(
    PERMISSIONS.BRAND_CREATE
  );

  const parsed = brandSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid brand details.",
    };
  }

  const existing = await prisma.brand.findFirst({
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
      error:
        "A brand with this name or slug already exists.",
    };
  }

  const brand = await prisma.brand.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description:
        parsed.data.description || null,
      logo: parsed.data.logo || null,
      website:
        parsed.data.website || null,
      isActive: parsed.data.isActive,
    },
  });

  return {
    success: true,
    brand,
  };
}