"use server";

import { prisma } from "@/lib/prisma";

export async function getProducts() {
  return prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    include: {
      category: true,
      brand: true,
      images: true,
      inventory: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}