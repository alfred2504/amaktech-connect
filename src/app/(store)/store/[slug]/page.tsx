import { notFound } from "next/navigation";
import Image from "next/image";

import { prisma } from "@/lib/prisma";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product =
    await prisma.product.findFirst({
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
    <main className="min-h-screen bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={
                  product.images[0].altText ||
                  product.name
                }
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                No image available
              </div>
            )}
          </div>
        </div>

        <div className="py-4">
          <p className="text-sm text-slate-500">
            {product.brand?.name}
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            ${Number(product.price).toFixed(2)}
          </p>

          <div className="mt-6">
            {availableStock > 0 ? (
              <p className="font-medium text-emerald-600">
                {availableStock} available
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

          <button
            type="button"
            disabled={availableStock <= 0}
            className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </main>
  );
}