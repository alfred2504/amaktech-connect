"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const current =
    searchParams.get("sort") || "newest";

  function handleChange(
    value: string
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    params.delete("page");

    router.push(
      `/store?${params.toString()}`
    );
  }

  return (
    <select
      value={current}
      onChange={(event) =>
        handleChange(event.target.value)
      }
      className="rounded-lg border border-slate-300 bg-white px-4 py-2"
    >
      <option value="newest">
        Newest
      </option>

      <option value="price-asc">
        Price: Low to High
      </option>

      <option value="price-desc">
        Price: High to Low
      </option>

      <option value="name-asc">
        Name: A-Z
      </option>

      <option value="name-desc">
        Name: Z-A
      </option>
    </select>
  );
}