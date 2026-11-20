'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

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

  if (error) return <main className="container section"><h1>Seller dashboard</h1><p role="alert">{error}</p><Link href="/seller/apply">Apply to sell</Link></main>
  if (!data) return <main className="container section"><p>Loading seller dashboard…</p></main>

  const cards = [
    ['Products', String(data.stats.productCount)],
    ['Awaiting review', String(data.stats.pendingProducts)],
    ['Orders to fulfill', String(data.stats.pendingOrders)],
    ['Sales', money(data.stats.totalSales)],
    ['Seller earnings', money(data.stats.sellerEarnings)],
    ['Available payout balance', money(data.stats.availableBalance)],
  ]

  return (
    <main className="container section">
      <header className="seller-header"><div><p className="eyebrow">SELLER DASHBOARD</p><h1>{data.store.storeName}</h1></div><span className={`status status-${data.store.status.toLowerCase()}`}>{data.store.status}</span></header>
      <div className="dashboard-grid">{cards.map(([label, value]) => <section className="dashboard-card" key={label}><p>{label}</p><strong>{value}</strong></section>)}</div>
      <nav className="seller-actions">
        <Link className="button secondary" href="/seller/products">Products</Link>
        <Link className="button secondary" href="/seller/orders">Orders</Link>
        <Link className="button secondary" href="/seller/fulfillments">Fulfillment</Link>
        <Link className="button secondary" href="/seller/store">Store profile</Link>
        <Link className="button secondary" href="/seller/payouts">Payouts</Link>
      </nav>
    </main>
  )
}
