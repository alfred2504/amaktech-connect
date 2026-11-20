'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/AdminShell'

type Review = {
  id: string
  rating: number
  title: string | null
  comment: string | null
  status: string
  user: { name: string; email: string }
  product: { name: string; slug: string }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [error, setError] = useState('')

  async function load() {
    const response = await fetch('/api/admin/reviews')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load reviews.')
    setReviews(result)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load reviews.'))
  }, [])

  async function moderate(reviewId: string, action: 'APPROVE' | 'REJECT') {
    const response = await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, action }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Review moderation failed.')
      return
    }
    await load()
  }

  return (
    <AdminShell title="Review moderation" description="Only approved reviews appear publicly.">
      {error && <p className="form-error" role="alert">{error}</p>}
      {reviews.map(review => <article className="admin-order-row" key={review.id}>
        <span><strong>{review.product.name} · {review.rating}/5 · {review.status}</strong><small>{review.user.name} · {review.user.email}</small><small>{review.title || ''} {review.comment || ''}</small></span>
        {review.status === 'PENDING' && <span className="admin-actions"><button onClick={() => moderate(review.id, 'APPROVE')}>Approve</button><button onClick={() => moderate(review.id, 'REJECT')}>Reject</button></span>}
      </article>)}
    </AdminShell>
  )
}
