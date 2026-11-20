'use client'

import { useEffect, useState } from 'react'

type Payout = { id: string; amount: string | number; method: string | null; status: string; createdAt: string }

export default function SellerPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [availableBalance, setAvailableBalance] = useState('0.00')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const response = await fetch('/api/seller/payouts')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load payouts.')
    setPayouts(result.payouts)
    setAvailableBalance(result.availableBalance)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load payouts.'))
  }, [])

  async function requestPayout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    const response = await fetch('/api/seller/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), method }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Payout request failed.')
      return
    }
    setMessage('Payout request submitted for review.')
    setAmount('')
    await load()
  }

  return (
    <main className="container section">
      <h1>Seller payouts</h1>
      <p>Available balance: <strong>${availableBalance}</strong></p>
      <form className="seller-form-panel" onSubmit={requestPayout}>
        <label>Amount<input type="number" min="0.01" step="0.01" required value={amount} onChange={event => setAmount(event.target.value)} /></label>
        <label>Payment method<input required maxLength={50} value={method} onChange={event => setMethod(event.target.value)} placeholder="Bank transfer, mobile wallet, etc." /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <button className="button primary">Request payout</button>
      </form>
      <section><h2>History</h2>{payouts.map(payout => <article className="seller-product-row" key={payout.id}>
        <span>${Number(payout.amount).toFixed(2)} · {payout.method || '—'}</span><span>{payout.status}</span><small>{new Date(payout.createdAt).toLocaleDateString()}</small>
      </article>)}</section>
    </main>
  )
}
