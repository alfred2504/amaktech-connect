'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Payment = { id: string; method: string; status: string }

export function OrderActions({ orderId, orderStatus, payments }: { orderId: string; orderStatus: string; payments: Payment[] }) {
  const router = useRouter()
  const payment = payments[0]
  const [reference, setReference] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submitReference(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const response = await fetch('/api/payments/reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reference, proofUrl: proofUrl || undefined }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Payment reference could not be submitted.')
      setMessage(result.message)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Payment reference could not be submitted.')
    } finally {
      setBusy(false)
    }
  }

  async function cancelOrder() {
    setError('')
    setBusy(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Order could not be cancelled.')
      setMessage(result.message)
      router.refresh()
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Order could not be cancelled.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="order-actions">
      <h2>Payment</h2>
      {payment ? <p>{payment.method.replace(/_/g, ' ')} · {payment.status}</p> : <p>No payment record found.</p>}
      {payment?.status === 'PENDING' && ['ECOCASH', 'INNBUCKS', 'BANK_TRANSFER'].includes(payment.method) && (
        <form className="seller-form-panel" onSubmit={submitReference}>
          <label>Payment reference<input required minLength={3} maxLength={100} value={reference} onChange={event => setReference(event.target.value)} /></label>
          <label>Payment proof URL (optional)<input type="url" value={proofUrl} onChange={event => setProofUrl(event.target.value)} /></label>
          <button className="button primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit payment reference'}</button>
        </form>
      )}
      {payment?.method === 'CASH_ON_DELIVERY' && <p>Cash on delivery is not prepaid; the order remains pending until it is confirmed for fulfillment.</p>}
      {payment?.method === 'CARD' && <p>Card payment is not available until a payment provider is configured.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {orderStatus === 'PENDING' && <button className="button secondary" type="button" disabled={busy} onClick={cancelOrder}>Cancel order</button>}
    </section>
  )
}
