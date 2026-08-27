import { prisma } from "@/lib/prisma";

import { getProducts } from "@/features/products/services/product-service";
import { ProductCard } from "@/components/products/product-card";
import { ProductSearch } from "@/components/products/product-search";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductSort } from "@/components/products/product-sort";

type StorePageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
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

  const minPrice = params.minPrice
    ? Number(params.minPrice)
    : undefined;

  const maxPrice = params.maxPrice
    ? Number(params.maxPrice)
    : undefined;

  const [
    result,
    categories,
    brands,
  ] = await Promise.all([
    getProducts({
      search: params.search,
      category: params.category,
      brand: params.brand,
      minPrice,
      maxPrice,
      sort: params.sort,
      page,
      limit: 12,
    }),

    prisma.category.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        name: true,
        slug: true,
      },
    }),

    prisma.brand.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        name: true,
        slug: true,
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Shop
          </h1>

          <p className="mt-2 text-slate-600">
            Discover products from AmakTech
            Connect.
          </p>
        </div>

        <div className="mb-8">
          <ProductSearch />
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <ProductFilters
            categories={categories}
            brands={brands}
          />

          <section>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-sm text-slate-600">
                {result.total}{" "}
                {result.total === 1
                  ? "product"
                  : "products"}{" "}
                found
              </p>

              <ProductSort />
            </div>

            {result.products.length === 0 ? (
              <div className="rounded-xl border bg-white p-12 text-center">
                <h2 className="text-xl font-semibold">
                  No products found
                </h2>

                <p className="mt-2 text-slate-500">
                  Try changing your search
                  or filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {result.products.map(
                    (product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    )
                  )}
                </div>

                <div className="mt-10 flex items-center justify-center gap-4">
                  {result.page > 1 && (
                    <a
                      href={buildPageUrl(
                        params,
                        result.page - 1
                      )}
                      className="rounded-lg border bg-white px-4 py-2 hover:bg-slate-50"
                    >
                      Previous
                    </a>
                  )}

                  <span className="text-sm text-slate-600">
                    Page {result.page} of{" "}
                    {Math.max(
                      result.totalPages,
                      1
                    )}
                  </span>

                  {result.page <
                    result.totalPages && (
                    <a
                      href={buildPageUrl(
                        params,
                        result.page + 1
                      )}
                      className="rounded-lg border bg-white px-4 py-2 hover:bg-slate-50"
                    >
                      Next
                    </a>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function buildPageUrl(
  params: StorePageProps["searchParams"] extends Promise<
    infer T
  >
    ? T
    : never,
  page: number
) {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.category) {
    query.set(
      "category",
      params.category
    );
  }

  if (params.brand) {
    query.set(
      "brand",
      params.brand
    );
  }

  if (params.minPrice) {
    query.set(
      "minPrice",
      params.minPrice
    );
  }

  if (params.maxPrice) {
    query.set(
      "maxPrice",
      params.maxPrice
    );
  }

  if (params.sort) {
    query.set("sort", params.sort);
  }

  query.set("page", String(page));

  return `/store?${query.toString()}`;
}