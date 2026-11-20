'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'

type DashboardData = {
  metrics: Record<string, number>
  recentOrders: Array<{
    id: string
    orderNumber: string
    total: string | number
    status: string
    user: { name: string; email: string }
  }>
  recentSellers: Array<{
    id: string
    storeName: string
    user: { name: string; email: string }
  }>
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to load dashboard.')
        setData(result)
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard.'))
  }, [])

  if (error) return <AdminShell title="Marketplace overview"><p role="alert">{error}</p></AdminShell>
  if (!data) return <AdminShell title="Marketplace overview"><p>Loading dashboard…</p></AdminShell>

  const metrics = [
    ['Customers', data.metrics.customers],
    ['Approved sellers', data.metrics.sellers],
    ['Pending sellers', data.metrics.pendingSellers],
    ['Active products', data.metrics.products],
    ['Products awaiting review', data.metrics.pendingProducts],
    ['Orders', data.metrics.orders],
    ['Pending orders', data.metrics.pendingOrders],
    ['Revenue', `$${data.metrics.revenue.toFixed(2)}`],
    ['Commission revenue', `$${data.metrics.commissionRevenue.toFixed(2)}`],
    ['Outstanding payouts', `$${data.metrics.outstandingPayouts.toFixed(2)}`],
  ] as const

  return (
    <AdminShell title="Marketplace overview" description="Live marketplace activity and operational queues.">
      <div className="dashboard-grid">{metrics.map(([label, value]) => <section className="dashboard-card" key={label}><p>{label}</p><strong>{value}</strong></section>)}</div>
      <section className="admin-section"><h2>Recent orders</h2>{data.recentOrders.map(order => <Link className="admin-order-row" href={`/admin/orders/${order.id}`} key={order.id}>
        <span><strong>{order.orderNumber}</strong><small>{order.user.name} · {order.user.email}</small></span><span>{order.status}</span><strong>${Number(order.total).toFixed(2)}</strong>
      </Link>)}</section>
      <section className="admin-section"><h2>Pending seller applications</h2>{data.recentSellers.map(seller => <Link className="admin-order-row" href="/admin/sellers" key={seller.id}>
        <span><strong>{seller.storeName}</strong><small>{seller.user.name} · {seller.user.email}</small></span><span>Review</span>
      </Link>)}</section>
    </AdminShell>
  )
}
