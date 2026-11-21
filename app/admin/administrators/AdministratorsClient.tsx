'use client'

import { type FormEvent, useEffect, useState } from 'react'

type Administrator = {
  id: string
  name: string
  email: string
  createdAt: string
  isSuperAdmin: boolean
}

export default function AdministratorsClient() {
  const [administrators, setAdministrators] = useState<Administrator[]>([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadAdministrators() {
    const response = await fetch('/api/admin/administrators')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load administrators.')
    setAdministrators(result)
  }

  useEffect(() => {
    loadAdministrators()
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load administrators.'))
      .finally(() => setLoading(false))
  }, [])

  async function updateAdministrator(action: 'ADD' | 'REMOVE', targetEmail: string) {
    setError('')
    try {
      const response = await fetch('/api/admin/administrators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email: targetEmail }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Administrator update failed.')

      setEmail('')
      await loadAdministrators()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Administrator update failed.')
    }
  }

  function addAdministrator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void updateAdministrator('ADD', email)
  }

  return (
    <>
      <form className="admin-form" onSubmit={addAdministrator}>
        <label htmlFor="administrator-email">Add an existing customer by email</label>
        <input
          id="administrator-email"
          type="email"
          required
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
        <button type="submit">Add administrator</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p>Loading administrators…</p> : administrators.map(administrator => (
        <article className="admin-order-row" key={administrator.id}>
          <span>
            <strong>{administrator.name}{administrator.isSuperAdmin ? ' · Super administrator' : ''}</strong>
            <small>{administrator.email}</small>
          </span>
          {!administrator.isSuperAdmin && (
            <button onClick={() => void updateAdministrator('REMOVE', administrator.email)}>
              Remove admin
            </button>
          )}
        </article>
      ))}
    </>
  )
}
