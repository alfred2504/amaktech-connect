'use client'

import { useEffect, useState } from 'react'
import { SellerShell } from '@/components/SellerShell'

type Fulfillment = {
  id: string
  status: string
  order: { orderNumber: string; status: string; recipientName: string; recipientPhone: string; shippingAddress: string; shippingCity: string; shippingCountry: string }
  items: Array<{ id: string; productName: string; quantity: number }>
}
type Tracking = { carrier: string; trackingNumber: string; trackingUrl: string }

export default function SellerFulfillmentsPage() {
  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [tracking, setTracking] = useState<Record<string, Tracking>>({})

  async function load() {
    const response = await fetch('/api/seller/fulfillments')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load fulfillment records.')
    setFulfillments(result)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load fulfillment records.'))
  }, [])

  async function advance(fulfillment: Fulfillment) {
    setError('')
    setMessage('')
    const status = fulfillment.status === 'PENDING'
      ? 'READY_FOR_PICKUP'
      : fulfillment.status === 'READY_FOR_PICKUP'
        ? 'IN_TRANSIT'
        : 'DELIVERED'
    const response = await fetch('/api/seller/fulfillments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fulfillmentId: fulfillment.id, status, ...tracking[fulfillment.id] }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Fulfillment update failed.')
      return
    }
    setMessage(`Fulfillment updated to ${status.toLowerCase().replace(/_/g, ' ')}.`)
    await load()
  }

  return (
    <SellerShell title="Fulfillment" description="Update the shipping progress for your part of each customer order.">
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {fulfillments.length === 0 && !error ? <p className="seller-empty">No fulfillment tasks yet.</p> : fulfillments.map(fulfillment => (
        <article className="seller-product-row" key={fulfillment.id}>
          <div>
            <strong>Order {fulfillment.order.orderNumber} · {fulfillment.status}</strong>
            <p>{fulfillment.items.map(item => `${item.productName} × ${item.quantity}`).join(', ')}</p>
            <p>Ship to {fulfillment.order.recipientName}, {fulfillment.order.recipientPhone}</p>
            <p>{fulfillment.order.shippingAddress}, {fulfillment.order.shippingCity}, {fulfillment.order.shippingCountry}</p>
            <label>Carrier<input value={tracking[fulfillment.id]?.carrier ?? ''} onChange={event => setTracking(previous => ({ ...previous, [fulfillment.id]: { carrier: event.target.value, trackingNumber: previous[fulfillment.id]?.trackingNumber ?? '', trackingUrl: previous[fulfillment.id]?.trackingUrl ?? '' } }))} /></label>
            <label>Tracking number<input value={tracking[fulfillment.id]?.trackingNumber ?? ''} onChange={event => setTracking(previous => ({ ...previous, [fulfillment.id]: { carrier: previous[fulfillment.id]?.carrier ?? '', trackingNumber: event.target.value, trackingUrl: previous[fulfillment.id]?.trackingUrl ?? '' } }))} /></label>
            <label>Tracking URL<input type="url" value={tracking[fulfillment.id]?.trackingUrl ?? ''} onChange={event => setTracking(previous => ({ ...previous, [fulfillment.id]: { carrier: previous[fulfillment.id]?.carrier ?? '', trackingNumber: previous[fulfillment.id]?.trackingNumber ?? '', trackingUrl: event.target.value } }))} /></label>
          </div>
          {fulfillment.status !== 'DELIVERED' && <button className="button primary" onClick={() => advance(fulfillment)}>
            {fulfillment.status === 'PENDING' ? 'Ready for pickup' : fulfillment.status === 'READY_FOR_PICKUP' ? 'Mark in transit' : 'Mark delivered'}
          </button>}
        </article>
      ))}
    </SellerShell>
  )
}
