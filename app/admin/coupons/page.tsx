'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'

type Coupon = { id: string; code: string; discountType: string; discountValue: string | number; usedCount: number; usageLimit: number | null; isActive: boolean; expiresAt: string | null }

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState({ code: '', discountType: 'PERCENT', discountValue: '', minimumAmount: '', usageLimit: '', expiresAt: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const response = await fetch('/api/admin/coupons')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load coupons.')
    setCoupons(result)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load coupons.'))
  }, [])

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minimumAmount: form.minimumAmount ? Number(form.minimumAmount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Coupon creation failed.')
      return
    }
    setError('')
    setMessage('Coupon created.')
    setForm({ code: '', discountType: 'PERCENT', discountValue: '', minimumAmount: '', usageLimit: '', expiresAt: '' })
    await load()
  }

  async function toggle(coupon: Coupon) {
    const response = await fetch('/api/admin/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponId: coupon.id, isActive: !coupon.isActive }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Coupon update failed.')
      return
    }
    await load()
  }

  return (
    <AdminShell title="Coupons" description="Manage discount codes and usage limits.">
      <form className="admin-form" onSubmit={create}>
        <label>Code<input required maxLength={30} value={form.code} onChange={event => setForm({ ...form, code: event.target.value.toUpperCase() })} /></label>
        <label>Discount type<select value={form.discountType} onChange={event => setForm({ ...form, discountType: event.target.value })}><option value="PERCENT">Percentage</option><option value="FIXED">Fixed amount</option></select></label>
        <label>Discount value<input required type="number" min="0.01" step="0.01" value={form.discountValue} onChange={event => setForm({ ...form, discountValue: event.target.value })} /></label>
        <label>Minimum subtotal<input type="number" min="0" step="0.01" value={form.minimumAmount} onChange={event => setForm({ ...form, minimumAmount: event.target.value })} /></label>
        <label>Usage limit<input type="number" min="1" step="1" value={form.usageLimit} onChange={event => setForm({ ...form, usageLimit: event.target.value })} /></label>
        <label>Expires at<input type="datetime-local" value={form.expiresAt} onChange={event => setForm({ ...form, expiresAt: event.target.value })} /></label>
        <button className="button primary">Create coupon</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {coupons.map(coupon => <article className="admin-order-row" key={coupon.id}>
        <span><strong>{coupon.code} · {coupon.isActive ? 'Active' : 'Inactive'}</strong><small>{coupon.discountType} {Number(coupon.discountValue)} · Used {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</small></span>
        <button onClick={() => toggle(coupon)}>{coupon.isActive ? 'Deactivate' : 'Activate'}</button>
      </article>)}
    </AdminShell>
  )
}
