import { prisma } from "@/lib/prisma";

export async function getProducts({
  search,
  category,
  brand,
  minPrice,
  maxPrice,
  sort = "newest",
  page = 1,
  limit = 12,
}: {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const where: any = {
    isActive: true,
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        sku: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (category) {
    where.category = {
      slug: category,
    };
  }

  if (brand) {
    where.brand = {
      slug: brand,
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};

    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }

    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  let orderBy: any = {
    createdAt: "desc",
  };

  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;

    case "price-desc":
      orderBy = { price: "desc" };
      break;

    case "name-asc":
      orderBy = { name: "asc" };
      break;

    case "name-desc":
      orderBy = { name: "desc" };
      break;

    case "newest":
    default:
      orderBy = { createdAt: "desc" };
  }

  const skip = (page - 1) * limit;

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
        take: limit,
      }),

      prisma.product.count({
        where,
      }),
    ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}