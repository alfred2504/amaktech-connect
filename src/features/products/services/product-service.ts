import { prisma } from "@/lib/prisma";

export type ProductCatalogParams = {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
};

export async function getProducts({
  search,
  category,
  brand,
  minPrice,
  maxPrice,
  sort = "newest",
  page = 1,
  limit = 12,
}: ProductCatalogParams = {}) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(
    Math.max(1, limit),
    48
  );

  const where: any = {
    isActive: true,
    deletedAt: null,
  };

  // Search
  if (search?.trim()) {
    const searchTerm = search.trim();

    where.OR = [
      {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        sku: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        brand: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
      {
        category: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  // Category
  if (category?.trim()) {
    where.category = {
      slug: category.trim(),
    };
  }

  // Brand
  if (brand?.trim()) {
    where.brand = {
      slug: brand.trim(),
    };
  }

  // Price range
  if (
    minPrice !== undefined ||
    maxPrice !== undefined
  ) {
    where.price = {};

    if (
      minPrice !== undefined &&
      Number.isFinite(minPrice)
    ) {
      where.price.gte = minPrice;
    }

    if (
      maxPrice !== undefined &&
      Number.isFinite(maxPrice)
    ) {
      where.price.lte = maxPrice;
    }
  }

  // Sorting
  let orderBy: any = {
    createdAt: "desc",
  };

  switch (sort) {
    case "price-asc":
      orderBy = {
        price: "asc",
      };
      break;

    case "price-desc":
      orderBy = {
        price: "desc",
      };
      break;

    case "name-asc":
      orderBy = {
        name: "asc",
      };
      break;

    case "name-desc":
      orderBy = {
        name: "desc",
      };
      break;

    case "newest":
    default:
      orderBy = {
        createdAt: "desc",
      };
      break;
  }

  const skip =
    (safePage - 1) * safeLimit;

  const [products, total] =
    await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: {
              isPrimary: "desc",
            },
            take: 1,
          },
          brand: true,
          category: true,
          inventory: true,
        },
        orderBy,
        skip,
        take: safeLimit,
      }),

      prisma.product.count({
        where,
      }),
    ]);

  return {
    products,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(
      total / safeLimit
    ),
  };
}