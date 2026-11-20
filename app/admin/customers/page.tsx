'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'

type Customer = {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  createdAt: string
  _count: { orders: number }
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState('')

  async function load() {
    const response = await fetch('/api/admin/customers')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load customers.')
    setCustomers(result)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load customers.'))
  }, [])

  async function setStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
    const response = await fetch('/api/admin/customers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Customer update failed.')
      return
    }
    await load()
  }

  return (
    <AdminShell title="Customers" description="Review customer accounts and order activity.">
      {error && <p className="form-error" role="alert">{error}</p>}
      {customers.map(customer => <article className="admin-order-row" key={customer.id}>
        <span><strong>{customer.name} · {customer.status}</strong><small>{customer.email} · {customer.phone || 'No phone'}</small><small>{customer._count.orders} orders · Joined {new Date(customer.createdAt).toLocaleDateString()}</small></span>
        <button onClick={() => setStatus(customer.id, customer.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}>{customer.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}</button>
      </article>)}
    </AdminShell>
  )
}
