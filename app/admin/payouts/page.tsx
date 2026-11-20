'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'

type Payout = {
  id: string
  amount: string | number
  method: string | null
  reference: string | null
  status: string
  seller: { storeName: string; user: { name: string; email: string } }
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [references, setReferences] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  async function load() {
    const response = await fetch('/api/admin/payouts')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load payouts.')
    setPayouts(result)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load payouts.'))
  }, [])

  async function update(payoutId: string, action: 'PROCESS' | 'PAY' | 'FAIL') {
    const response = await fetch('/api/admin/payouts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payoutId, action, reference: references[payoutId] }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Payout update failed.')
      return
    }
    setError('')
    await load()
  }

  return (
    <AdminShell title="Seller payouts" description="Payout records are tracking workflows; verify transfers outside this app before marking them paid.">
      {error && <p className="form-error" role="alert">{error}</p>}
      {payouts.map(payout => <article className="admin-order-row" key={payout.id}>
        <span><strong>{payout.seller.storeName} · {payout.status}</strong><small>{payout.seller.user.name} · {payout.seller.user.email}</small><small>${Number(payout.amount).toFixed(2)} · {payout.method || 'No method'}</small></span>
        {payout.status === 'PENDING' && <span className="admin-actions"><button onClick={() => update(payout.id, 'PROCESS')}>Process</button><button onClick={() => update(payout.id, 'FAIL')}>Fail</button></span>}
        {payout.status === 'PROCESSING' && <span className="admin-actions">
          <input aria-label="Transfer reference" placeholder="Transfer reference" value={references[payout.id] || ''} onChange={event => setReferences(previous => ({ ...previous, [payout.id]: event.target.value }))} />
          <button onClick={() => update(payout.id, 'PAY')}>Mark paid</button><button onClick={() => update(payout.id, 'FAIL')}>Fail</button>
        </span>}
      </article>)}
    </AdminShell>
  )
}
