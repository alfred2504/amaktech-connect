'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'

type Category = { id: string; name: string; slug: string; isActive: boolean; sortOrder: number; _count: { products: number } }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const response = await fetch('/api/admin/categories')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load categories.')
    setCategories(result)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load categories.'))
  }, [])

  async function createCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Category creation failed.')
      return
    }
    setError('')
    setMessage('Category created.')
    setName('')
    setSlug('')
    await load()
  }

  async function toggle(category: Category) {
    const response = await fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: category.id, isActive: !category.isActive }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Category update failed.')
      return
    }
    await load()
  }

  return (
    <AdminShell title="Categories" description="Create marketplace categories and control storefront visibility.">
      <form className="admin-form" onSubmit={createCategory}>
        <label>Name<input required value={name} onChange={event => {
          setName(event.target.value)
          if (!slug) setSlug(event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
        }} /></label>
        <label>Slug<input required value={slug} onChange={event => setSlug(event.target.value)} /></label>
        <button className="button primary">Create category</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {categories.map(category => <article className="admin-order-row" key={category.id}>
        <span><strong>{category.name}</strong><small>{category.slug} · {category._count.products} products</small></span>
        <span>{category.isActive ? 'Active' : 'Inactive'}</span>
        <button onClick={() => toggle(category)}>{category.isActive ? 'Deactivate' : 'Activate'}</button>
      </article>)}
    </AdminShell>
  )
}
