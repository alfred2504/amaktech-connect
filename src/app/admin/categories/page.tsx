import { requireRole } from "@/lib/authorization";
import { getCategories } from "@/features/categories/actions/get-categories";
import Link from "next/link";

export default async function AdminCategoriesPage() {
  await requireRole(["Administrator", "Super Administrator"]);

  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">CATEGORIES</h1>
              <p className="text-slate-600 text-sm mt-1">Manage product categories</p>
            </div>
            <Link
              href="/admin/categories/new"
              className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition-all transform hover:scale-105"
            >
              + Add Category
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-lg font-semibold">No categories found</p>
            <Link href="/admin/categories/new" className="text-green-700 font-bold mt-4 inline-block">
              Create your first category →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Category Name</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Slug</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Products</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-900 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{category.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 font-mono">{category.slug}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 line-clamp-2">{category.description || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          View
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="text-green-700 hover:text-green-800 font-bold text-sm transition"
                        >
                          Edit →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}