'use client'

import Link from 'next/link'
import { useState } from 'react'

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState('5')
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    setBusy(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating: Number(rating), title, comment }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Review could not be submitted.')
      setMessage(result.message)
      setTitle('')
      setComment('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Review could not be submitted.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p>Reviews are available to signed-in customers who have received this product. <Link href="/login">Sign in</Link></p>
      <form className="seller-form-panel" onSubmit={submit}>
        <label>Rating
          <select value={rating} onChange={event => setRating(event.target.value)}>
            {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} / 5</option>)}
          </select>
        </label>
        <label>Title (optional)<input maxLength={120} value={title} onChange={event => setTitle(event.target.value)} /></label>
        <label>Review (optional)<textarea maxLength={3000} rows={4} value={comment} onChange={event => setComment(event.target.value)} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <button className="button primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit review'}</button>
      </form>
    </div>
  )
}
