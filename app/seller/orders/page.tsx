'use client'

import { useEffect, useState } from 'react'

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
    <main className="container section">
      <h1>Seller orders</h1>
      {error && <p role="alert">{error}</p>}
      {items.map(item => (
        <article className="seller-product-row" key={item.id}>
          <div>
            <strong>{item.productName} × {item.quantity}</strong>
            <p>Order {item.order.orderNumber} · {item.order.status}</p>
            <p>Buyer: {item.order.user.name} · {item.order.user.email}</p>
            <p>Fulfilment: {item.fulfillment?.status ?? 'Not assigned'}</p>
          </div>
          <strong>${Number(item.lineTotal).toFixed(2)}</strong>
        </article>
      ))}
    </main>
  )
}
