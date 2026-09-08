import { requireAuth } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getDashboardStats() {
  try {
    const [totalOrders, totalProducts, totalCategories, totalBrands, totalCustomers, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count({ where: { deletedAt: null } }),
      prisma.brand.count({ where: { deletedAt: null } }),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
    ]);

    return { totalOrders, totalProducts, totalCategories, totalBrands, totalCustomers, recentOrders };
          } catch {
    return { totalOrders: 0, totalProducts: 0, totalCategories: 0, totalBrands: 0, totalCustomers: 0, recentOrders: [] };
  }
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const { totalOrders, totalProducts, totalCategories, totalBrands, totalCustomers, recentOrders } = await getDashboardStats();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900">
              Welcome back, {session.user.name ?? "Admin"}! 👋
            </h1>
            <p className="text-slate-600 mt-2">
              You&apos;re signed in as <span className="font-bold text-green-700">{session.user.role}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Total Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold uppercase">Total Orders</p>
                <p className="text-4xl font-black text-slate-900 mt-2">{totalOrders}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
            <p className="text-xs text-slate-500 mt-4">All time orders</p>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold uppercase">Total Products</p>
                <p className="text-4xl font-black text-green-700 mt-2">{totalProducts}</p>
              </div>
              <div className="text-4xl">🛍️</div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Active products</p>
          </div>

          {/* Total Categories */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold uppercase">Categories</p>
                <p className="text-4xl font-black text-yellow-500 mt-2">{totalCategories}</p>
              </div>
              <div className="text-4xl">📂</div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Product categories</p>
          </div>

          {/* Total Brands */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold uppercase">Brands</p>
                <p className="text-4xl font-black text-blue-700 mt-2">{totalBrands}</p>
              </div>
              <div className="text-4xl">🏷️</div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Available brands</p>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold uppercase">Customers</p>
                <p className="text-4xl font-black text-slate-900 mt-2">{totalCustomers}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Total users</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 mb-6">QUICK ACTIONS</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/products"
              className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <p className="text-4xl mb-2">📦</p>
              <p className="font-bold text-slate-900">Manage Products</p>
              <p className="text-xs text-slate-600 mt-1">Edit and add new products</p>
            </Link>

            <Link
              href="/admin/categories"
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <p className="text-4xl mb-2">📂</p>
              <p className="font-bold text-slate-900">Manage Categories</p>
              <p className="text-xs text-slate-600 mt-1">Organize product categories</p>
            </Link>

            <Link
              href="/admin"
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <p className="text-4xl mb-2">⚙️</p>
              <p className="font-bold text-slate-900">Admin Panel</p>
              <p className="text-xs text-slate-600 mt-1">Full admin settings</p>
            </Link>

            <Link
              href="/shop"
              className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <p className="text-4xl mb-2">🛒</p>
              <p className="font-bold text-slate-900">Visit Store</p>
              <p className="text-xs text-slate-600 mt-1">View your store</p>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-6">RECENT ORDERS</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-black text-slate-900 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm text-slate-900">{order.id.substring(0, 8)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{order.user?.name || "—"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/orders/${order.id}`} className="text-green-700 hover:text-green-800 font-bold text-sm transition">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}