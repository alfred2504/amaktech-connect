import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { ProductImageManager } from "@/features/products/components/product-image-manager";

import { InventoryManager } from "@/features/products/components/inventory-manager";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductAdminPage({
  params,
}: Props) {
  const { id } = await params;

  const product =
    await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: {
            createdAt: "asc",
          },
        },
        inventory: true,
      },
    });

  if (!product) {
    notFound();
  }

  if (!product.inventory) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">
          {product.name}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          SKU: {product.sku}
        </p>
      </div>

      <ProductImageManager
        productId={product.id}
        initialImages={
          product.images
        }
      />

      <InventoryManager
        productId={product.id}
        initialInventory={
          product.inventory
        }
      />
    </div>
  );
}