import { getProducts } from "@/features/products/services/product-service";
import { ProductCard } from "@/components/products/product-card";

type StorePageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function StorePage({
  searchParams,
}: StorePageProps) {
  const params = await searchParams;

  const page = Math.max(
    1,
    Number(params.page || 1)
  );

  const result = await getProducts({
    search: params.search,
    category: params.category,
    brand: params.brand,
    sort: params.sort,
    page,
    limit: 12,
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Shop
          </h1>

          <p className="mt-2 text-slate-600">
            Discover products from AmakTech Connect.
          </p>
        </div>

        {result.products.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <h2 className="text-xl font-semibold">
              No products found
            </h2>

            <p className="mt-2 text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.products.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}