import { prisma } from "@/lib/prisma";

export async function getCheckoutData(
  userId: string
) {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              inventory: true,
              images: {
                where: {
                  isPrimary: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    throw new Error("Cart not found.");
  }

  if (cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const addresses = await prisma.address.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return {
    cart,
    addresses,
  };
}

export async function calculateOrderTotals(
  userId: string
) {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              inventory: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (
      !product.isActive ||
      product.deletedAt
    ) {
      throw new Error(
        `${product.name} is no longer available.`
      );
    }

    const availableStock =
      (product.inventory?.stock ?? 0) -
      (product.inventory?.reserved ?? 0);

    if (item.quantity > availableStock) {
      throw new Error(
        `${product.name} only has ${availableStock} available.`
      );
    }

    subtotal +=
      Number(product.price) * item.quantity;
  }

  const taxRate = 0;
  const tax = subtotal * taxRate;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  return {
    subtotal,
    tax,
    shipping,
    total,
  };
}