import { requirePermission } from "@/lib/authorization";
import { PERMISSIONS } from "@/features/authorization/permissions";

import CategoryForm from "@/features/categories/components/category-form";

export default async function NewCategoryPage() {
  await requirePermission(PERMISSIONS.CATEGORY_CREATE);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Add Category
        </h1>

        <p className="mt-2 text-slate-600">
          Create a new product category.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-8">
        <CategoryForm />
      </div>
    </main>
  );
}