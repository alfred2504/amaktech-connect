"use server";

import { prisma } from "@/lib/prisma";

export async function getCategories(
  filters?: {
    search?: string;
  }
) {
  const categories = await prisma.category.findMany({
    where: {
      deletedAt: null,
      ...(filters?.search && {
        OR: [
          {
            name: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            slug: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        ],
      }),
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories;
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
        },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  return category;
}
