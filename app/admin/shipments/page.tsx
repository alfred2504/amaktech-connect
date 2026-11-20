'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'

type Order = {
  id: string
  orderNumber: string
  status: string
  user: { name: string; email: string }
  shipment: null | { status: string; carrier: string | null; trackingNumber: string | null; trackingUrl: string | null }
}

type ShipmentForm = { status: string; carrier: string; trackingNumber: string; trackingUrl: string }

export default function AdminShipmentsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [forms, setForms] = useState<Record<string, ShipmentForm>>({})
  const [error, setError] = useState('')
  const statuses = ['PENDING', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED']

  async function load() {
    const response = await fetch('/api/admin/orders')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load orders.')
    setOrders(result)
    setForms(current => Object.fromEntries(result.map((order: Order) => [
      order.id,
      current[order.id] ?? {
        status: order.shipment?.status ?? 'PENDING',
        carrier: order.shipment?.carrier ?? '',
        trackingNumber: order.shipment?.trackingNumber ?? '',
        trackingUrl: order.shipment?.trackingUrl ?? '',
      },
    ])))
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load shipments.'))
  }, [])

  function update(orderId: string, key: keyof ShipmentForm, value: string) {
    setForms(current => ({ ...current, [orderId]: { ...current[orderId], [key]: value } }))
  }

  async function save(orderId: string) {
    const response = await fetch('/api/admin/shipments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, ...forms[orderId] }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Shipment update failed.')
      return
    }
    setError('')
    await load()
  }

  return (
    <AdminShell title="Shipment tracking" description="Update carrier and tracking details for each customer order.">
      {error && <p className="form-error" role="alert">{error}</p>}
      {orders.map(order => <form className="admin-form" key={order.id} onSubmit={event => { event.preventDefault(); void save(order.id) }}>
        <h2>{order.orderNumber} · {order.user.name} · {order.status}</h2>
        <label>Status<select value={forms[order.id]?.status ?? 'PENDING'} onChange={event => update(order.id, 'status', event.target.value)}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
        <label>Carrier<input value={forms[order.id]?.carrier ?? ''} onChange={event => update(order.id, 'carrier', event.target.value)} /></label>
        <label>Tracking number<input value={forms[order.id]?.trackingNumber ?? ''} onChange={event => update(order.id, 'trackingNumber', event.target.value)} /></label>
        <label>Tracking URL<input type="url" value={forms[order.id]?.trackingUrl ?? ''} onChange={event => update(order.id, 'trackingUrl', event.target.value)} /></label>
        <button className="button primary">Save shipment</button>
      </form>)}
    </AdminShell>
  )
}
