'use client'

import { useEffect, useState } from 'react'
import '../account.css'

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

const emptyAddress = {
  label: '',
  fullName: '',
  phone: '',
  street: '',
  city: '',
  province: '',
  country: 'Zimbabwe',
  postalCode: '',
  isDefault: false,
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState(emptyAddress)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const response = await fetch('/api/account/addresses')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load addresses.')
    setAddresses(result)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load addresses.'))
  }, [])

  function update(key: keyof typeof emptyAddress, value: string | boolean) {
    setForm(previous => ({ ...previous, [key]: value }))
  }

  function edit(address: Address) {
    setEditingId(address.id)
    setForm({
      label: address.label ?? '',
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      province: address.province ?? '',
      country: address.country,
      postalCode: address.postalCode ?? '',
      isDefault: address.isDefault,
    })
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    const response = await fetch(editingId ? `/api/account/addresses/${editingId}` : '/api/account/addresses', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Unable to save address.')
      return
    }
    setForm(emptyAddress)
    setEditingId('')
    setMessage(editingId ? 'Address updated.' : 'Address saved.')
    await load()
  }

  async function remove(addressId: string) {
    setError('')
    const response = await fetch(`/api/account/addresses/${addressId}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Unable to delete address.')
      return
    }
    setMessage('Address deleted.')
    await load()
  }

  return (
    <main className="account-subpage">
      <div className="container">
      <h1>Delivery addresses</h1>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <div className="address-grid">
        {addresses.map(address => (
          <article className="address-card" key={address.id}>
            {address.isDefault && <strong>Default address</strong>}
            <p>{address.label || address.fullName}</p>
            <p>{address.fullName} · {address.phone}</p>
            <p>{address.street}, {address.city}{address.province ? `, ${address.province}` : ''}, {address.country}</p>
            <div className="address-actions">
              <button type="button" onClick={() => edit(address)}>Edit</button>
              <button type="button" onClick={() => remove(address.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
      <form className="seller-form-panel" onSubmit={save}>
        <h2>{editingId ? 'Edit address' : 'Add address'}</h2>
        <label>Label<input value={form.label} onChange={event => update('label', event.target.value)} placeholder="Home, work…" /></label>
        <label>Full name<input required minLength={2} value={form.fullName} onChange={event => update('fullName', event.target.value)} /></label>
        <label>Phone<input required minLength={7} value={form.phone} onChange={event => update('phone', event.target.value)} /></label>
        <label>Street address<input required minLength={3} value={form.street} onChange={event => update('street', event.target.value)} /></label>
        <label>City<input required minLength={2} value={form.city} onChange={event => update('city', event.target.value)} /></label>
        <label>Province<input value={form.province} onChange={event => update('province', event.target.value)} /></label>
        <label>Country<input required value={form.country} onChange={event => update('country', event.target.value)} /></label>
        <label>Postal code<input value={form.postalCode} onChange={event => update('postalCode', event.target.value)} /></label>
        <label><input type="checkbox" checked={form.isDefault} onChange={event => update('isDefault', event.target.checked)} /> Set as default address</label>
        <div className="address-actions"><button className="button primary">{editingId ? 'Update address' : 'Save address'}</button>{editingId && <button type="button" onClick={() => { setEditingId(''); setForm(emptyAddress) }}>Cancel edit</button>}</div>
      </form>
      </div>
    </main>
  )
}
