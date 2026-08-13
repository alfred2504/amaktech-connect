"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createCategory } from "../actions/create-category";

export default function CategoryForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const result = await createCategory({
      name,
      slug,
      description,
      image,
    });

    if (!result.success) {
      setError(result.error || "An error occurred");
      setLoading(false);
      return;
    }

    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block font-medium">
          Category name
        </label>

        <input
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Electronics"
          required
          className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Slug
        </label>

        <input
          type="text"
          value={slug}
          onChange={(event) =>
            setSlug(event.target.value)
          }
          placeholder="electronics"
          required
          className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
        />

        <p className="mt-1 text-sm text-slate-500">
          Example: electronics, mobile-phones,
          home-appliances
        </p>
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Description
        </label>

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Browse electronics and technology products."
          rows={4}
          className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Image URL
        </label>

        <input
          type="url"
          value={image}
          onChange={(event) =>
            setImage(event.target.value)
          }
          placeholder="https://..."
          className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Category"}
      </button>
    </form>
  );
}