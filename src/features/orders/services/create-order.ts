import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CreateOrderInput = {
  userId: string;
  addressId: string;
};

const TAX_RATE = new Prisma.Decimal("0.00");
const SHIPPING_FEE = new Prisma.Decimal("0.00");

function generateOrderNumber() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `ATC-${date}-${random}`;
}

export async function createOrder({
  userId,
  addressId,
}: CreateOrderInput) {
  return prisma.$transaction(
    async (tx) => {
      /*
       * 1. Verify address belongs to customer
       */
      const address =
        await tx.address.findFirst({
          where: {
            id: addressId,
            userId,
            deletedAt: null,
          },
        });

      if (!address) {
        throw new Error(
          "DELIVERY_ADDRESS_NOT_FOUND"
        );
      }

      /*
       * 2. Load customer's cart
       */
      const cart =
        await tx.cart.findUnique({
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

      if (!cart) {
        throw new Error("CART_NOT_FOUND");
      }

      if (cart.items.length === 0) {
        throw new Error("CART_EMPTY");
      }

      /*
       * 3. Validate products and inventory
       */
      for (const item of cart.items) {
        const product = item.product;

        if (!product.isActive || product.deletedAt) {
          throw new Error(
            `PRODUCT_UNAVAILABLE:${product.name}`
          );
        }

        if (!product.inventory) {
          throw new Error(
            `INVENTORY_NOT_CONFIGURED:${product.name}`
          );
        }

        const available =
          product.inventory.stock -
          product.inventory.reserved;

        if (available < item.quantity) {
          throw new Error(
            `INSUFFICIENT_STOCK:${product.name}`
          );
        }
      }

      /*
       * 4. Calculate totals from DATABASE prices.
       *
       * Never trust prices supplied by the browser.
       */
      let subtotal =
        new Prisma.Decimal("0.00");

      for (const item of cart.items) {
        const lineTotal =
          item.product.price.mul(
            item.quantity
          );

        subtotal =
          subtotal.add(lineTotal);
      }

      const tax =
        subtotal.mul(TAX_RATE);

      const shipping =
        SHIPPING_FEE;

      const total =
        subtotal
          .add(tax)
          .add(shipping);

      /*
       * 5. Create order
       */
      const result = await tx.order.create({
        data: {
          orderNumber:
            generateOrderNumber(),

          userId,

          addressId,

          status: "PENDING",

          paymentStatus:
            "PENDING",

          subtotal,

          tax,

          shipping,

          total,

          items: {
            create: cart.items.map(
              (item) => ({
                productId:
                  item.productId,

                quantity:
                  item.quantity,

                unitPrice:
                  item.product.price,

                totalPrice:
                  item.product.price.mul(
                    item.quantity
                  ),
              })
            ),
          },
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },

          address: true,
        },
      });

      const order = result as typeof result & {
        orderNumber: string;
      };

      /*
       * 6. Reserve inventory
       */
      for (const item of cart.items) {
        const inventory =
          item.product.inventory!;

        const available =
          inventory.stock -
          inventory.reserved;

        /*
         * Re-check inside transaction.
         */
        if (available < item.quantity) {
          throw new Error(
            `INSUFFICIENT_STOCK:${item.product.name}`
          );
        }

        await tx.inventory.update({
          where: {
            productId:
              item.productId,
          },

          data: {
            reserved: {
              increment:
                item.quantity,
            },
          },
        });
      }

      /*
       * 7. Clear cart
       */
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return order;
    },
    {
      /*
       * Longer transaction timeout is useful
       * for production database environments.
       */
      maxWait: 5000,
      timeout: 10000,
    }
  );
}