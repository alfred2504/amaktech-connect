'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'

type Payment = {
  id: string
  method: string
  status: string
  amount: string | number
  reference: string | null
  proofUrl: string | null
  order: { orderNumber: string; status: string; user: { name: string; email: string } }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [error, setError] = useState('')

  async function load() {
    const response = await fetch('/api/admin/payments')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load payments.')
    setPayments(result)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load payments.'))
  }, [])

  async function action(paymentId: string, action: 'VERIFY' | 'REJECT' | 'CONFIRM_COD_ORDER') {
    const response = await fetch('/api/admin/payments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, action }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Payment update failed.')
      return
    }
    await load()
  }

  return (
    <AdminShell title="Payment verification" description="Manual references require verification; card processing requires a provider webhook.">
      {error && <p className="form-error" role="alert">{error}</p>}
      {payments.map(payment => <article className="admin-order-row" key={payment.id}>
        <span><strong>{payment.order.orderNumber} · {payment.method} · {payment.status}</strong><small>{payment.order.user.name} · {payment.order.user.email}</small><small>Reference: {payment.reference || 'Not supplied'}</small></span>
        <span><strong>${Number(payment.amount).toFixed(2)}</strong>{payment.proofUrl && <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer">View proof</a>}</span>
        {payment.method === 'CASH_ON_DELIVERY' && payment.status === 'PENDING' && payment.order.status === 'PENDING' && <button onClick={() => action(payment.id, 'CONFIRM_COD_ORDER')}>Confirm COD order</button>}
        {payment.status === 'PROCESSING' && <span className="admin-actions"><button onClick={() => action(payment.id, 'VERIFY')}>Verify</button><button onClick={() => action(payment.id, 'REJECT')}>Reject</button></span>}
      </article>)}
    </AdminShell>
  )
}
