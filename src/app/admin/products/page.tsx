import { getProducts } from "@/features/products/actions/get-products";
import Image from "next/image";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">PRODUCTS</h1>
              <p className="text-slate-600 text-sm mt-1">Manage your product inventory</p>
            </div>
            <Link
              href="/admin/products/new"
              className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition-all transform hover:scale-105"
            >
              + Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-lg font-semibold">No products found</p>
            <Link href="/admin/products/new" className="text-green-700 font-bold mt-4 inline-block">
              Create your first product →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Product Name</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">SKU</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-900 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                          📦
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 line-clamp-1">{product.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 font-mono">{product.sku}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{product.category?.name || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">${product.price.toString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          product.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/products/${product.id}`}
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