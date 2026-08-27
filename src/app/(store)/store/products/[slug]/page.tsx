import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/products/product-gallery";
import { AddToCart } from "@/components/products/add-to-cart";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: Props) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      deletedAt: null,
    },
    include: {
      images: {
        orderBy: {
          isPrimary: "desc",
        },
      },
      brand: true,
      category: true,
      inventory: true,
    },
  });

  if (!product) {
    notFound();
  }

  const availableStock =
    (product.inventory?.stock ?? 0) -
    (product.inventory?.reserved ?? 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery
            images={product.images}
            productName={product.name}
          />

          <div>
            <div className="mb-3 flex gap-2 text-sm">
              <span className="text-blue-600">
                {product.category.name}
              </span>

              {product.brand && (
                <>
                  <span className="text-slate-400">
                    /
                  </span>

                  <span className="text-slate-600">
                    {product.brand.name}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              {product.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              SKU: {product.sku}
            </p>

            <div className="mt-6">
              <span className="text-3xl font-bold text-blue-600">
                ${product.price.toString()}
              </span>

              {product.compareAtPrice && (
                <span className="ml-3 text-lg text-slate-400 line-through">
                  $
                  {product.compareAtPrice.toString()}
                </span>
              )}
            </div>

            <div className="mt-6">
              {availableStock > 0 ? (
                <p className="font-medium text-emerald-600">
                  {availableStock} in stock
                </p>
              ) : (
                <p className="font-medium text-red-600">
                  Out of stock
                </p>
              )}
            </div>

            {product.description && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold">
                  Description
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-8">
              <AddToCart
                productId={product.id}
                productName={product.name}
                availableStock={availableStock}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}