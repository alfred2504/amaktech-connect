"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (search.trim()) {
      params.set(
        "search",
        search.trim()
      );
    } else {
      params.delete("search");
    }

    params.delete("page");

    router.push(
      `/store?${params.toString()}`
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full"
    >
      <div className="relative flex-1">
        <Search
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search products..."
          className="h-11 w-full rounded-l-lg border border-slate-300 bg-white pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <button
        type="submit"
        className="rounded-r-lg bg-blue-600 px-6 font-medium text-white hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}