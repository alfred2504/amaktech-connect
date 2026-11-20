'use client'

import { useEffect, useState } from 'react'

const emptyStore = {
  storeName: '',
  description: '',
  logoUrl: '',
  bannerUrl: '',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
}

export default function SellerStorePage() {
  const [form, setForm] = useState(emptyStore)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seller/store')
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to load store profile.')
        setForm({
          storeName: result.storeName ?? '',
          description: result.description ?? '',
          logoUrl: result.logoUrl ?? '',
          bannerUrl: result.bannerUrl ?? '',
          businessAddress: result.businessAddress ?? '',
          businessPhone: result.businessPhone ?? '',
          businessEmail: result.businessEmail ?? '',
        })
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load store profile.'))
      .finally(() => setLoading(false))
  }, [])

  function update(key: keyof typeof emptyStore, value: string) {
    setForm(previous => ({ ...previous, [key]: value }))
  }

  async function uploadImage(field: 'logoUrl' | 'bannerUrl', file: File) {
    setError('')
    setMessage('')
    try {
      const data = new FormData()
      data.set('file', file)
      const response = await fetch('/api/uploads', { method: 'POST', body: data })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Image upload failed.')
      update(field, result.url)
      setMessage(field === 'logoUrl' ? 'Logo uploaded. Save to publish the change.' : 'Banner uploaded. Save to publish the change.')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.')
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    const response = await fetch('/api/seller/store', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Store update failed.')
      return
    }
    setMessage('Store profile updated.')
  }

  return (
    <main className="container section">
      <h1>Store settings</h1>
      {loading ? <p>Loading store profile…</p> : <form className="seller-form-panel" onSubmit={save}>
        <label>Store name<input required value={form.storeName} onChange={event => update('storeName', event.target.value)} /></label>
        <label>Description<textarea value={form.description} onChange={event => update('description', event.target.value)} /></label>
        <label>Logo URL<input type="url" value={form.logoUrl} onChange={event => update('logoUrl', event.target.value)} /></label>
        <label>Upload logo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
          const file = event.target.files?.[0]
          if (file) void uploadImage('logoUrl', file)
          event.target.value = ''
        }} /></label>
        <label>Banner URL<input type="url" value={form.bannerUrl} onChange={event => update('bannerUrl', event.target.value)} /></label>
        <label>Upload banner<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
          const file = event.target.files?.[0]
          if (file) void uploadImage('bannerUrl', file)
          event.target.value = ''
        }} /></label>
        <label>Business address<input value={form.businessAddress} onChange={event => update('businessAddress', event.target.value)} /></label>
        <label>Business phone<input value={form.businessPhone} onChange={event => update('businessPhone', event.target.value)} /></label>
        <label>Business email<input type="email" value={form.businessEmail} onChange={event => update('businessEmail', event.target.value)} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <button className="button primary">Save store profile</button>
      </form>}
    </main>
  )
}
