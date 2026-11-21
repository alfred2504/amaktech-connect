'use client'

import { useEffect, useState } from 'react'
import '../account.css'

type Notification = { id: string; title: string; message: string; type: string; readAt: string | null; createdAt: string }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [error, setError] = useState('')

  async function load() {
    const response = await fetch('/api/notifications')
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Unable to load notifications.')
    setNotifications(result)
  }

  useEffect(() => {
    load().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Unable to load notifications.'))
  }, [])

  async function markRead(id: string) {
    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Unable to update notification.')
      return
    }
    setNotifications(current => current.map(item => item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
  }

  return (
    <main className="account-subpage">
      <div className="container notifications-page">
      <h1>Notifications</h1>
      {error && <p className="form-error" role="alert">{error}</p>}
      {!notifications.length && !error && <p>You have no notifications.</p>}
      <div className="notifications-list">
      {notifications.map(item => (
        <article className="seller-product-row" key={item.id}>
          <div><strong>{item.title}</strong><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>
          {!item.readAt && <button onClick={() => markRead(item.id)}>Mark as read</button>}
        </article>
      ))}
      </div>
      </div>
    </main>
  )
}
