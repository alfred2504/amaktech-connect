'use client'

import { useState } from 'react'

export default function SellerApplyPage() {
  const [form, setForm] = useState({
    storeName: '',
    description: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm(previous => ({ ...previous, [key]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/seller/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Application failed.')
      setMessage('Your application has been submitted and is awaiting review.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Application failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container section">
      <h1>Become an AmakTech Connect seller</h1>
      <p>Tell us about your store. Products can be added after administrator approval.</p>
      <form className="seller-form-panel" onSubmit={submit}>
        <label>Store name<input required minLength={3} maxLength={100} value={form.storeName} onChange={event => update('storeName', event.target.value)} /></label>
        <label>Description<textarea maxLength={2000} value={form.description} onChange={event => update('description', event.target.value)} /></label>
        <label>Business address<input required minLength={5} value={form.businessAddress} onChange={event => update('businessAddress', event.target.value)} /></label>
        <label>Business phone<input required type="tel" minLength={7} value={form.businessPhone} onChange={event => update('businessPhone', event.target.value)} /></label>
        <label>Business email<input required type="email" value={form.businessEmail} onChange={event => update('businessEmail', event.target.value)} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <button className="button primary" disabled={loading}>{loading ? 'Submitting…' : 'Submit application'}</button>
      </form>
    </main>
  )
}
