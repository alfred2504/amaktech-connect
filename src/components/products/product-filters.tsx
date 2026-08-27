"use client";

import { useRouter, useSearchParams } from "next/navigation";

type FilterOption = {
  name: string;
  slug: string;
};

type ProductFiltersProps = {
  categories: FilterOption[];
  brands: FilterOption[];
};

export function ProductFilters({
  categories,
  brands,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(
    key: string,
    value: string
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");

    router.push(
      `/store?${params.toString()}`
    );
  }

  return (
    <aside className="space-y-6 rounded-xl border bg-white p-5">
      <div>
        <h2 className="font-semibold text-slate-900">
          Categories
        </h2>

        <select
          value={
            searchParams.get("category") || ""
          }
          onChange={(event) =>
            updateFilter(
              "category",
              event.target.value
            )
          }
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">
            All categories
          </option>

          {categories.map((category) => (
            <option
              key={category.slug}
              value={category.slug}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">
          Brands
        </h2>

        <select
          value={
            searchParams.get("brand") || ""
          }
          onChange={(event) =>
            updateFilter(
              "brand",
              event.target.value
            )
          }
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">
            All brands
          </option>

          {brands.map((brand) => (
            <option
              key={brand.slug}
              value={brand.slug}
            >
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">
          Price
        </h2>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            defaultValue={
              searchParams.get("minPrice") || ""
            }
            onBlur={(event) =>
              updateFilter(
                "minPrice",
                event.target.value
              )
            }
            className="rounded-lg border border-slate-300 px-3 py-2"
          />

          <input
            type="number"
            min="0"
            placeholder="Max"
            defaultValue={
              searchParams.get("maxPrice") || ""
            }
            onBlur={(event) =>
              updateFilter(
                "maxPrice",
                event.target.value
              )
            }
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      </div>
    </aside>
  );
}