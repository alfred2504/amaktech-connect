import { prisma } from "@/lib/prisma";

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  return cart;
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);

  return prisma.cart.findUnique({
    where: {
      id: cart.id,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: {
                  isPrimary: true,
                },
                take: 1,
              },
              brand: true,
              category: true,
              inventory: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number
) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(
      "Quantity must be a positive integer."
    );
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
      deletedAt: null,
    },
    include: {
      inventory: true,
    },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  const availableStock =
    (product.inventory?.stock ?? 0) -
    (product.inventory?.reserved ?? 0);

  if (availableStock <= 0) {
    throw new Error(
      "This product is currently out of stock."
    );
  }

  const cart = await getOrCreateCart(userId);

  const existingItem =
    await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

  const newQuantity =
    (existingItem?.quantity ?? 0) + quantity;

  if (newQuantity > availableStock) {
    throw new Error(
      `Only ${availableStock} item${
        availableStock === 1 ? "" : "s"
      } available.`
    );
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: newQuantity,

        // Always use the database price.
        unitPrice: product.price,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity,
        unitPrice: product.price,
      },
    });
  }

  return getCart(userId);
}

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number
) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(
      "Quantity must be a positive integer."
    );
  }

  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new Error("Cart not found.");
  }

  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    include: {
      product: {
        include: {
          inventory: true,
        },
      },
    },
  });

  if (!item) {
    throw new Error(
      "Product is not in your cart."
    );
  }

  if (
    !item.product.isActive ||
    item.product.deletedAt
  ) {
    throw new Error(
      "This product is no longer available."
    );
  }

  const availableStock =
    (item.product.inventory?.stock ?? 0) -
    (item.product.inventory?.reserved ?? 0);

  if (quantity > availableStock) {
    throw new Error(
      `Only ${availableStock} item${
        availableStock === 1 ? "" : "s"
      } available.`
    );
  }

  await prisma.cartItem.update({
    where: {
      id: item.id,
    },
    data: {
      quantity,

      // Refresh the price from the database.
      unitPrice: item.product.price,
    },
  });

  return getCart(userId);
}

export async function removeCartItem(
  userId: string,
  productId: string
) {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new Error("Cart not found.");
  }

  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (!item) {
    throw new Error(
      "Product is not in your cart."
    );
  }

  await prisma.cartItem.delete({
    where: {
      id: item.id,
    },
  });

  return getCart(userId);
}

export async function clearCart(
  userId: string
) {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    return null;
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return getCart(userId);
}