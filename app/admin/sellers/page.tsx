'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'

type Seller = {
  id: string
  storeName: string
  status: string
  businessPhone: string | null
  businessAddress: string | null
  user: { name: string; email: string; phone: string | null }
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [error, setError] = useState('')

  async function load() {
    const response = await fetch('/api/admin/sellers')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load sellers.')
    setSellers(result)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load sellers.'))
  }, [])

  async function update(sellerId: string, action: 'APPROVE' | 'REJECT' | 'SUSPEND') {
    const response = await fetch('/api/admin/sellers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId, action }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Seller update failed.')
      return
    }
    setError('')
    await load()
  }

  return (
    <AdminShell title="Seller applications" description="Approve, reject, or suspend marketplace sellers.">
      {error && <p className="form-error" role="alert">{error}</p>}
      {sellers.map(seller => <article className="admin-order-row" key={seller.id}>
        <span><strong>{seller.storeName} · {seller.status}</strong><small>{seller.user.name} · {seller.user.email}</small><small>{seller.businessPhone || seller.user.phone || 'No phone'} · {seller.businessAddress || 'No address'}</small></span>
        <span className="admin-actions">
          {seller.status === 'PENDING' && <><button onClick={() => update(seller.id, 'APPROVE')}>Approve</button><button onClick={() => update(seller.id, 'REJECT')}>Reject</button></>}
          {seller.status === 'APPROVED' && <button onClick={() => update(seller.id, 'SUSPEND')}>Suspend</button>}
        </span>
      </article>)}
    </AdminShell>
  )
}
