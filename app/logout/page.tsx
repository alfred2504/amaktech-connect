'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function logout() {
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) throw new Error('Unable to log out. Please try again.')
      router.replace('/')
      router.refresh()
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Unable to log out. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="container section">
      <h1>Log out</h1>
      <p>End your current AmakTech Connect session?</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button primary" onClick={logout} disabled={loading}>
        {loading ? 'Logging out…' : 'Log out'}
      </button>
    </main>
  )
}