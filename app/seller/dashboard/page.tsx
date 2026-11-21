'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SellerShell } from '@/components/SellerShell'

type Dashboard = {
  store: { storeName: string; status: string }
  stats: {
    productCount: number
    pendingProducts: number
    pendingOrders: number
    totalSales: number
    sellerEarnings: number
    paidPayouts: number
    availableBalance: number
  }
}

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function SellerDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/seller/dashboard')
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to load seller dashboard.')
        setData(result)
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load seller dashboard.'))
  }, [])

  if (error) {
    return (
      <SellerShell title="Seller dashboard">
        <p className="form-error" role="alert">{error}</p>
        <Link className="seller-action-link" href="/seller/apply">Apply to sell</Link>
      </SellerShell>
    )
  }
  if (!data) return <SellerShell title="Seller dashboard"><p>Loading seller dashboard…</p></SellerShell>

  const cards = [
    ['Products', String(data.stats.productCount)],
    ['Awaiting review', String(data.stats.pendingProducts)],
    ['Orders to fulfill', String(data.stats.pendingOrders)],
    ['Sales', money(data.stats.totalSales)],
    ['Seller earnings', money(data.stats.sellerEarnings)],
    ['Available payout balance', money(data.stats.availableBalance)],
  ]

  return (
    <SellerShell
      eyebrow="Seller dashboard"
      title={data.store.storeName}
      description="Your store performance and the tasks that need your attention."
    >
      <div className="dashboard-grid">{cards.map(([label, value]) => <section className="dashboard-card" key={label}><p>{label}</p><strong>{value}</strong></section>)}</div>
      <section className="seller-status-panel">
        <span>Store status</span>
        <strong className={`seller-status seller-status-${data.store.status.toLowerCase()}`}>{data.store.status}</strong>
        <p>Your store status determines whether your products can be published.</p>
      </section>
      <section className="admin-section">
        <h2>Quick links</h2>
        <nav className="seller-dashboard-links" aria-label="Seller dashboard shortcuts">
          <Link className="seller-action-link" href="/seller/products">Manage products</Link>
          <Link className="seller-action-link" href="/seller/orders">View orders</Link>
          <Link className="seller-action-link" href="/seller/fulfillments">Update fulfillment</Link>
          <Link className="seller-action-link" href="/seller/store">Edit store profile</Link>
          <Link className="seller-action-link" href="/seller/payouts">Manage payouts</Link>
        </nav>
      </section>
    </SellerShell>
  )
}
