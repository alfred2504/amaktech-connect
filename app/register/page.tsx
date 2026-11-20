'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthFrame } from '@/components/AuthFrame'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm(previous => ({ ...previous, [key]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Registration failed.')
      router.replace('/account')
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame title="Create your account" subtitle="Join AmakTech Connect and discover your next favorite products.">
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="name">Full name</label>
        <input id="name" autoComplete="name" required minLength={2} maxLength={100} value={form.name} onChange={event => update('name', event.target.value)} />
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="email" required maxLength={200} value={form.email} onChange={event => update('email', event.target.value)} />
        <label htmlFor="phone">Phone (optional)</label>
        <input id="phone" type="tel" autoComplete="tel" maxLength={30} value={form.phone} onChange={event => update('phone', event.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={form.password} onChange={event => update('password', event.target.value)} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
      </form>
      <div className="auth-links"><span>Already have an account?</span><Link href="/login">Sign in</Link></div>
    </AuthFrame>
  )
}
