'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { AuthFrame } from '@/components/AuthFrame'

export default function LoginPage() {
  return <Suspense fallback={<p>Loading sign-in…</p>}><LoginForm /></Suspense>
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Sign in failed.')

      const next = searchParams.get('next')
      const safeNext = next?.startsWith('/') && !next.startsWith('//') && !next.includes('\\')
        ? next
        : result.user.role === 'ADMIN'
          ? '/admin/dashboard'
          : result.user.role === 'SELLER'
            ? '/seller/dashboard'
            : '/account'
      router.replace(safeNext)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to continue to your AmakTech Connect account.">
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <div className="auth-links"><Link href="/forgot-password">Forgot password?</Link><span>New here? <Link href="/register">Create account</Link></span></div>
    </AuthFrame>
  )
}
