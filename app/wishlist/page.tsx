'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type WishlistItem = {
  id: string
  product: { id: string; name: string; slug: string; price: string | number; images: Array<{ url: string; alt: string | null }> }
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [error, setError] = useState('')

  async function load() {
    const response = await fetch('/api/wishlist')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load wishlist.')
    setItems(result.items)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load wishlist.'))
  }, [])

  async function remove(productId: string) {
    const response = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Unable to remove product.')
      return
    }
    setItems(previous => previous.filter(item => item.product.id !== productId))
  }

  return (
    <main className="container section">
      <h1>My wishlist</h1>
      {error && <p className="form-error" role="alert">{error}</p>}
      {!items.length && !error ? <p>Your wishlist is empty.</p> : (
        <div className="product-grid">
          {items.map(({ product }) => (
            <article className="product-card" key={product.id}>
              {product.images[0] && <img src={product.images[0].url} alt={product.images[0].alt || product.name} />}
              <h2>{product.name}</h2>
              <p>${Number(product.price).toFixed(2)}</p>
              <Link href={`/products/${product.slug}`}>View product</Link>
              <button type="button" onClick={() => remove(product.id)}>Remove</button>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
