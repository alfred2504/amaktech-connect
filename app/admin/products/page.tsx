'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'

type Product = {
  id: string
  name: string
  price: string | number
  stock: number
  status: string
  category: { name: string }
  seller: { storeName: string; status: string }
  images: Array<{ url: string; alt: string | null }>
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')

  async function load() {
    const response = await fetch('/api/admin/products')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load products.')
    setProducts(result)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load products.'))
  }, [])

  async function moderate(productId: string, action: 'APPROVE' | 'REJECT' | 'ARCHIVE') {
    setError('')
    const response = await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, action }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Product moderation failed.')
      return
    }
    await load()
  }

  return (
    <AdminShell title="Product moderation" description="Review seller products before they appear in the marketplace.">
      {error && <p className="form-error" role="alert">{error}</p>}
      {products.map(product => <article className="admin-order-row" key={product.id}>
        {product.images[0] && <img src={product.images[0].url} alt={product.images[0].alt || product.name} width={72} height={72} />}
        <span><strong>{product.name}</strong><small>{product.seller.storeName} · {product.category.name}</small><small>${Number(product.price).toFixed(2)} · Stock {product.stock} · {product.status}</small></span>
        {product.status === 'DRAFT' && <span className="admin-actions">
          <button onClick={() => moderate(product.id, 'APPROVE')}>Approve</button>
          <button onClick={() => moderate(product.id, 'REJECT')}>Reject</button>
        </span>}
        {product.status === 'ACTIVE' && <button onClick={() => moderate(product.id, 'ARCHIVE')}>Archive</button>}
      </article>)}
    </AdminShell>
  )
}
