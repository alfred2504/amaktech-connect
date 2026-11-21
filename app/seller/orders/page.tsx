'use client'

import { useEffect, useState } from 'react'
import { SellerShell } from '@/components/SellerShell'

type SellerOrderItem = {
  id: string
  productName: string
  quantity: number
  lineTotal: string | number
  order: { orderNumber: string; status: string; user: { name: string; email: string } }
  fulfillment: { status: string } | null
}

export default function SellerOrdersPage() {
  const [items, setItems] = useState<SellerOrderItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/seller/orders')
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to load seller orders.')
        setItems(result)
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load seller orders.'))
  }, [])

  return (
    <SellerShell title="Orders" description="Review purchases containing products from your store.">
      {error && <p className="form-error" role="alert">{error}</p>}
      <section className="admin-section">
        <h2>Order items</h2>
        {items.length === 0 && !error ? <p className="seller-empty">No orders yet.</p> : items.map(item => (
        <article className="admin-order-row" key={item.id}>
          <div>
            <strong>{item.productName} × {item.quantity}</strong>
            <small>Order {item.order.orderNumber} · {item.order.status}</small>
            <small>Buyer: {item.order.user.name} · {item.order.user.email}</small>
            <small>Fulfilment: {item.fulfillment?.status ?? 'Not assigned'}</small>
          </div>
          <strong>${Number(item.lineTotal).toFixed(2)}</strong>
        </article>
        ))}
      </section>
    </SellerShell>
  )
}
