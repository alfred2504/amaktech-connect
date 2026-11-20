'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type CartItem = {
  id: string
  name: string
  price: number
  currency: string
  imageUrl?: string
  slug: string
  quantity: number
}

type Address = {
  id: string
  label: string | null
  fullName: string
  phone: string
  street: string
  city: string
  province: string | null
  country: string
  postalCode: string | null
  isDefault: boolean
}

const paymentMethods = [
  ['CASH_ON_DELIVERY', 'Cash on delivery'],
  ['ECOCASH', 'EcoCash'],
  ['INNBUCKS', 'InnBucks'],
  ['BANK_TRANSFER', 'Bank transfer'],
  ['CARD', 'Card'],
] as const

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressId, setAddressId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number][0]>('CASH_ON_DELIVERY')
  const [notes, setNotes] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [checkoutKey, setCheckoutKey] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  useEffect(() => {
    let active = true
    async function loadCheckout() {
      try {
        const sessionResponse = await fetch('/api/auth/me')
        const sessionData = await sessionResponse.json()
        if (!sessionResponse.ok || !sessionData.user) {
          router.replace('/login?next=%2Fcheckout')
          return
        }

        const storedCart: unknown = JSON.parse(localStorage.getItem('amaktech-cart') || '[]')
        const cart = Array.isArray(storedCart)
          ? storedCart.filter((item): item is CartItem =>
            item && typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            Number.isFinite(item.price) &&
            typeof item.quantity === 'number' &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0,
          )
          : []

        const addressResponse = await fetch('/api/account/addresses')
        if (!addressResponse.ok) throw new Error('Unable to load your delivery addresses.')
        const savedAddresses = await addressResponse.json() as Address[]

        if (!active) return
        setItems(cart)
        setAddresses(savedAddresses)
        setAddressId(savedAddresses.find(address => address.isDefault)?.id ?? savedAddresses[0]?.id ?? '')

        const savedKey = sessionStorage.getItem('amaktech_checkout_key')
        const key = savedKey || crypto.randomUUID()
        if (!savedKey) sessionStorage.setItem('amaktech_checkout_key', key)
        setCheckoutKey(key)
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load checkout.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadCheckout()
    return () => { active = false }
  }, [router])

  async function applyCoupon() {
    setError('')
    setMessage('')
    setAppliedCoupon(null)
    if (!couponCode.trim()) return

    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode.trim(), subtotal }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Coupon could not be applied.')
      return
    }
    setAppliedCoupon({ code: result.code, discount: Number(result.discount) })
    setCouponCode(result.code)
    setMessage('Coupon applied. The final discount will be verified when the order is placed.')
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!items.length) {
      setError('Your cart is empty.')
      return
    }
    if (!addressId) {
      setError('Add a delivery address before placing your order.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutKey,
          addressId,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          notes: notes.trim() || undefined,
          items: items.map(item => ({ productId: item.id, quantity: item.quantity })),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to place your order.')

      localStorage.removeItem('amaktech-cart')
      sessionStorage.removeItem('amaktech_checkout_key')
      router.push(`/account/orders/${result.order.id}`)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to place your order.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <main className="container section"><p>Loading checkout…</p></main>
  if (error && !items.length) {
    return <main className="container section"><h1>Checkout</h1><p role="alert">{error}</p><Link className="button primary" href="/cart">Return to cart</Link></main>
  }
  if (!items.length) {
    return <main className="container section"><h1>Your cart is empty</h1><Link className="button primary" href="/shop">Browse products</Link></main>
  }

  return (
    <main className="container section checkout-page">
      <Link href="/cart" className="checkout-back">← Back to cart</Link>
      <h1>Complete your order</h1>
      <p className="muted">Choose delivery and payment preferences. Payment remains pending until verified.</p>
      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={placeOrder}>
          <section className="checkout-panel">
            <h2>Delivery address</h2>
            {addresses.length ? (
              <div className="checkout-addresses">
                {addresses.map(address => (
                  <label className="checkout-address" key={address.id}>
                    <input
                      type="radio"
                      name="addressId"
                      value={address.id}
                      checked={addressId === address.id}
                      onChange={() => setAddressId(address.id)}
                    />
                    <span>
                      <strong>{address.label || address.fullName}</strong>
                      <small>{address.fullName} · {address.phone}</small>
                      <small>{address.street}, {address.city}, {address.country}</small>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p>Add a delivery address to continue. <Link href="/account/addresses">Manage addresses</Link></p>
            )}
            {addresses.length > 0 && <Link href="/account/addresses">Add or edit addresses</Link>}
          </section>

          <section className="checkout-panel">
            <h2>Payment method</h2>
            <label className="checkout-field">
              <span>Select payment method</span>
              <select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value as typeof paymentMethod)}>
                {paymentMethods.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </label>
            <p className="checkout-note">Submitting an order does not confirm payment. Prepaid methods remain pending until verified; cash on delivery is also confirmed separately.</p>
            <label className="checkout-field">
              <span>Order notes (optional)</span>
              <textarea value={notes} onChange={event => setNotes(event.target.value)} maxLength={500} rows={3} />
            </label>
          </section>

          <section className="checkout-panel">
            <h2>Promotion code</h2>
            <div className="checkout-coupon">
              <input value={couponCode} onChange={event => setCouponCode(event.target.value.toUpperCase())} maxLength={30} aria-label="Coupon code" />
              <button type="button" className="button secondary" onClick={applyCoupon}>Apply</button>
            </div>
          </section>

          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p role="status">{message}</p>}
          <button className="button primary" type="submit" disabled={submitting || !addressId || !checkoutKey}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </form>

        <aside className="checkout-panel checkout-summary">
          <h2>Order summary</h2>
          {items.map(item => (
            <div className="checkout-summary-item" key={item.id}>
              <span>{item.name} × {item.quantity}</span>
              <strong>{formatMoney(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="checkout-summary-total"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
          {appliedCoupon && <div className="checkout-summary-total"><span>Coupon ({appliedCoupon.code})</span><strong>−{formatMoney(appliedCoupon.discount)}</strong></div>}
          <p className="checkout-note">Shipping is calculated by the marketplace and verified when your order is created.</p>
        </aside>
      </div>
      <style>{`
        .checkout-back{display:inline-block;margin-bottom:18px;color:#319b19;font-weight:700}
        .checkout-grid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,.7fr);gap:24px;align-items:start}
        .checkout-form{display:grid;gap:18px}
        .checkout-panel{background:#fff;border:1px solid #e6e1e2;border-radius:14px;padding:24px}
        .checkout-panel h2{margin:0 0 18px;font-size:21px}
        .checkout-addresses{display:grid;gap:12px;margin-bottom:14px}
        .checkout-address{display:flex;gap:12px;padding:14px;border:1px solid #e4dfe0;border-radius:10px;cursor:pointer}
        .checkout-address span,.checkout-address small{display:block}
        .checkout-address small{margin-top:5px;color:#706b6d}
        .checkout-field{display:grid;gap:8px;margin:12px 0}
        .checkout-field input,.checkout-field select,.checkout-field textarea,.checkout-coupon input{width:100%;padding:12px;border:1px solid #d8d2d3;border-radius:8px;font:inherit}
        .checkout-note{color:#706b6d;font-size:13px;line-height:1.5}
        .checkout-coupon{display:flex;gap:10px}
        .checkout-summary{position:sticky;top:20px}
        .checkout-summary-item,.checkout-summary-total{display:flex;justify-content:space-between;gap:14px;padding:12px 0;border-bottom:1px solid #eee}
        .checkout-summary-total{font-weight:700}
        @media(max-width:760px){.checkout-grid{grid-template-columns:1fr}.checkout-summary{position:static;order:-1}}
      `}</style>
    </main>
  )
}
