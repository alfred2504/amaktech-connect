"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createProduct } from "../actions/create-product";

type Category = {
  id: string;
  name: string;
};

type Brand = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: Category[];
  brands: Brand[];
};

export function ProductForm({
  categories,
  brands,
}: ProductFormProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    sku: "",
    price: "",
    compareAtPrice: "",
    categoryId: "",
    brandId: "",
    isActive: true,
  });

  function updateField(
    field: string,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const result = await createProduct({
      name: form.name,
      slug: form.slug,
      description: form.description,
      sku: form.sku,
      price: Number(form.price),
      compareAtPrice:
        form.compareAtPrice.trim() === ""
          ? null
          : Number(form.compareAtPrice),
      categoryId: form.categoryId,
      brandId: form.brandId || null,
      isActive: form.isActive,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Invalid product details.");
      return;
    }

    setSuccess(
      "Product created successfully."
    );

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Product Name
          </label>

          <input
            required
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;

              updateField("name", name);

              if (!form.slug) {
                updateField(
                  "slug",
                  generateSlug(name)
                );
              }
            }}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Samsung Galaxy A56"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            SKU
          </label>

          <input
            required
            value={form.sku}
            onChange={(e) =>
              updateField(
                "sku",
                e.target.value
              )
            }
            className="w-full rounded-md border px-3 py-2"
            placeholder="SAM-A56-001"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Slug
        </label>

        <input
          required
          value={form.slug}
          onChange={(e) =>
            updateField(
              "slug",
              generateSlug(e.target.value)
            )
          }
          className="w-full rounded-md border px-3 py-2"
          placeholder="samsung-galaxy-a56"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Description
        </label>

        <textarea
          value={form.description}
          onChange={(e) =>
            updateField(
              "description",
              e.target.value
            )
          }
          rows={5}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Describe the product..."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Price
          </label>

          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) =>
              updateField(
                "price",
                e.target.value
              )
            }
            className="w-full rounded-md border px-3 py-2"
            placeholder="499.99"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Compare-at Price
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={form.compareAtPrice}
            onChange={(e) =>
              updateField(
                "compareAtPrice",
                e.target.value
              )
            }
            className="w-full rounded-md border px-3 py-2"
            placeholder="549.99"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Category
          </label>

          <select
            required
            value={form.categoryId}
            onChange={(e) =>
              updateField(
                "categoryId",
                e.target.value
              )
            }
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Brand
          </label>

          <select
            value={form.brandId}
            onChange={(e) =>
              updateField(
                "brandId",
                e.target.value
              )
            }
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="">
              No brand
            </option>

            {brands.map((brand) => (
              <option
                key={brand.id}
                value={brand.id}
              >
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) =>
            updateField(
              "isActive",
              e.target.checked
            )
          }
        />

        <span className="text-sm">
          Product is active
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading
          ? "Creating..."
          : "Create Product"}
      </button>
    </form>
  );
}