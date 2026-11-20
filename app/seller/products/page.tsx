'use client'

import { useEffect, useState } from 'react'

type Category = { id: string; name: string }
type Product = {
  id: string
  name: string
  description: string
  price: string | number
  comparePrice: string | number | null
  sku: string | null
  stock: number
  status: string
  category: Category
  images: Array<{ url: string }>
}

const emptyForm = { name: '', description: '', categoryId: '', price: '', comparePrice: '', sku: '', stock: '0', imageUrl: '' }

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    setError('')
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/seller/products'),
        fetch('/api/categories'),
      ])
      if (!productsResponse.ok) throw new Error((await productsResponse.json()).error || 'Unable to load products.')
      if (!categoriesResponse.ok) throw new Error('Unable to load categories.')
      setProducts(await productsResponse.json())
      setCategories(await categoriesResponse.json())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  function update(key: keyof typeof emptyForm, value: string) {
    setForm(previous => ({ ...previous, [key]: value }))
  }

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const response = await fetch(editingId ? `/api/seller/products/${editingId}` : '/api/seller/products', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          comparePrice: form.comparePrice ? Number(form.comparePrice) : editingId ? null : undefined,
          stock: Number(form.stock),
          sku: form.sku || (editingId ? null : undefined),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Product could not be saved.')
      setMessage(editingId ? 'Product changes submitted for administrator review.' : 'Product submitted for administrator review.')
      setForm(emptyForm)
      setEditingId('')
      await load()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Product could not be saved.')
    } finally {
      setBusy(false)
    }
  }

  async function uploadImage(file: File) {
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const data = new FormData()
      data.set('file', file)
      const response = await fetch('/api/uploads', { method: 'POST', body: data })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Image upload failed.')
      update('imageUrl', result.url)
      setMessage('Image uploaded. Save the product to attach it.')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.')
    } finally {
      setBusy(false)
    }
  }

  function editProduct(product: Product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      categoryId: product.category.id,
      price: String(product.price),
      comparePrice: product.comparePrice === null ? '' : String(product.comparePrice),
      sku: product.sku ?? '',
      stock: String(product.stock),
      imageUrl: product.images[0]?.url ?? '',
    })
    setError('')
    setMessage('')
  }

  async function archive(productId: string) {
    const response = await fetch(`/api/seller/products/${productId}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Product could not be archived.')
      return
    }
    await load()
  }

  return (
    <main className="container section">
      <h1>My products</h1>
      <form className="seller-form-panel" onSubmit={createProduct}>
        <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
        <label>Name<input required minLength={3} value={form.name} onChange={event => update('name', event.target.value)} /></label>
        <label>Description<textarea required minLength={10} value={form.description} onChange={event => update('description', event.target.value)} /></label>
        <label>Category<select required value={form.categoryId} onChange={event => update('categoryId', event.target.value)}><option value="">Select category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label>Price (USD)<input type="number" step="0.01" min="0.01" required value={form.price} onChange={event => update('price', event.target.value)} /></label>
        <label>Compare price<input type="number" step="0.01" min="0.01" value={form.comparePrice} onChange={event => update('comparePrice', event.target.value)} /></label>
        <label>SKU<input value={form.sku} onChange={event => update('sku', event.target.value)} /></label>
        <label>Stock<input type="number" min="0" required value={form.stock} onChange={event => update('stock', event.target.value)} /></label>
        <label>Image URL<input type="url" value={form.imageUrl} onChange={event => update('imageUrl', event.target.value)} /></label>
        <label>Upload product image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => {
          const file = event.target.files?.[0]
          if (file) void uploadImage(file)
          event.target.value = ''
        }} /></label>
        <button className="button primary" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Submit product'}</button>
        {editingId && <button type="button" className="button secondary" onClick={() => { setEditingId(''); setForm(emptyForm) }}>Cancel edit</button>}
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <section><h2>Inventory</h2>{loading ? <p>Loading products…</p> : products.map(product => <article className="seller-product-row" key={product.id}>
        {product.images[0] && <img src={product.images[0].url} alt={product.name} width={72} height={72} />}
        <div><strong>{product.name}</strong><p>{product.category.name} · ${Number(product.price).toFixed(2)}</p><p>Stock: {product.stock} · {product.status}</p></div>
        {product.status !== 'ARCHIVED' && <button className="button secondary" onClick={() => editProduct(product)}>Edit</button>}
        {product.status !== 'ARCHIVED' && <button className="button secondary" onClick={() => archive(product.id)}>Archive</button>}
      </article>)}</section>
    </main>
  )
}
