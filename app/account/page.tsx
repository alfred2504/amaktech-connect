import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { money } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await requireUser()
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <main className="container section account-page">
      <p className="eyebrow">CUSTOMER ACCOUNT</p>
      <h1>Welcome, {user.name}</h1>
      <p className="muted">{user.email}{user.phone ? ` · ${user.phone}` : ''}</p>
      <nav className="account-links">
        <Link className="button secondary" href="/account/orders">My orders</Link>
        <Link className="button secondary" href="/account/addresses">Delivery addresses</Link>
        <Link className="button secondary" href="/wishlist">Wishlist</Link>
        <Link className="button secondary" href="/account/notifications">Notifications</Link>
        {user.role === 'SELLER' || user.role === 'ADMIN'
          ? <Link className="button secondary" href="/seller/dashboard">Seller dashboard</Link>
          : <Link className="button secondary" href="/seller/apply">Become a seller</Link>}
        <Link className="button secondary" href="/logout">Sign out</Link>
      </nav>
      <section className="account-orders">
        <h2>Recent orders</h2>
        {orders.length ? orders.map(order => (
          <Link className="account-order" href={`/account/orders/${order.id}`} key={order.id}>
            <span><strong>{order.orderNumber}</strong><small>{order.createdAt.toLocaleDateString()}</small></span>
            <span>{order.status}</span>
            <strong>{money(Number(order.total))}</strong>
          </Link>
        )) : <p className="muted">You have not placed any orders yet.</p>}
      </section>
    </main>
  )
}
