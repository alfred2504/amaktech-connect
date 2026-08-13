import { getCategories } from "@/features/categories/actions/get-categories";
import Link from "next/link";

export default async function ShopPage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Shop
        </h1>

        <p className="mt-3 text-slate-600">
          Browse products by category.
        </p>
      </div>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">
          Categories
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className="rounded-xl border p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-xl font-semibold">
                {category.name}
              </h3>

              {category.description && (
                <p className="mt-2 text-sm text-slate-600">
                  {category.description}
                </p>
              )}

              <p className="mt-4 text-sm font-medium text-blue-600">
                {category._count.products} products
              </p>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <p className="text-slate-500">
            No categories are currently available.
          </p>
        )}
      </section>
    </main>
  );
}
