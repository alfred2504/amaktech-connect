"use server";

import { prisma } from "@/lib/prisma";

export async function getProductOptions() {
  const [categories, brands] =
    await Promise.all([
      prisma.category.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: "asc",
        },
      }),

      prisma.brand.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

  return {
    categories,
    brands,
  };
}