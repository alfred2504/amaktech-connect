import Link from 'next/link'
import { ArrowRight, Bell, Heart, LogOut, Mail, MapPin, Package, Phone, ShoppingBag, Store, UserRound } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { money } from '@/lib/utils'
import './account.css'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await requireUser()
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <main className="account-page">
      <div className="container account-shell">
        <section className="account-hero">
          <div className="account-hero-copy">
            <p className="eyebrow"><UserRound size={15} aria-hidden="true" /> CUSTOMER ACCOUNT</p>
            <h1>Welcome back,<br /><span>{user.name}</span></h1>
            <p className="account-hero-message">Your account is the home for your orders, delivery details and marketplace updates.</p>
            <div className="account-contact">
              <span><Mail size={15} aria-hidden="true" />{user.email}</span>
              {user.phone && <span><Phone size={15} aria-hidden="true" />{user.phone}</span>}
            </div>
          </div>
          <div className="account-hero-card">
            <span className="account-hero-icon"><ShoppingBag size={24} aria-hidden="true" /></span>
            <p className="account-hero-card-title">Looking for something?</p>
            <p className="account-hero-card-copy">Explore products from sellers across the marketplace.</p>
            <Link href="/products" className="button gold">Browse marketplace <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>

        <div className="account-dashboard-grid">
          <section className="account-panel account-orders">
            <header className="account-section-heading">
              <div>
                <p className="account-section-kicker">ORDER HISTORY</p>
                <h2>Recent orders</h2>
              </div>
              <Link className="account-view-all" href="/account/orders">View all <ArrowRight size={15} aria-hidden="true" /></Link>
            </header>
            {orders.length ? (
              <div className="account-order-list">
                {orders.map(order => (
                  <Link className="account-order" href={`/account/orders/${order.id}`} key={order.id}>
                    <span className="account-order-icon"><Package size={19} aria-hidden="true" /></span>
                    <span className="account-order-details">
                      <strong>{order.orderNumber}</strong>
                      <small>Placed {order.createdAt.toLocaleDateString()}</small>
                    </span>
                    <span className={`account-order-status account-status-${order.status.toLowerCase()}`}>{order.status}</span>
                    <strong className="account-order-total">{money(Number(order.total))}</strong>
                    <ArrowRight className="account-order-arrow" size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="account-empty">
                <span className="account-empty-icon"><ShoppingBag size={22} aria-hidden="true" /></span>
                <div>
                  <h3>No orders yet</h3>
                  <p>Your purchases will appear here after checkout.</p>
                </div>
                <Link href="/products" className="account-empty-link">Start shopping <ArrowRight size={15} aria-hidden="true" /></Link>
              </div>
            )}
          </section>

          <section className="account-panel account-shortcuts">
            <header className="account-section-heading">
              <div>
                <p className="account-section-kicker">QUICK LINKS</p>
                <h2>Manage your account</h2>
              </div>
            </header>
            <nav className="account-link-list" aria-label="Account shortcuts">
              <Link href="/account/orders"><span className="account-link-icon"><Package size={18} aria-hidden="true" /></span><span><strong>My orders</strong><small>Track your purchases</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="/account/addresses"><span className="account-link-icon"><MapPin size={18} aria-hidden="true" /></span><span><strong>Delivery addresses</strong><small>Manage saved locations</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="/wishlist"><span className="account-link-icon"><Heart size={18} aria-hidden="true" /></span><span><strong>Wishlist</strong><small>Items you have saved</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="/account/notifications"><span className="account-link-icon"><Bell size={18} aria-hidden="true" /></span><span><strong>Notifications</strong><small>Marketplace updates</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
              {user.role === 'SELLER' || user.role === 'ADMIN'
                ? <Link href="/seller/dashboard"><span className="account-link-icon"><Store size={18} aria-hidden="true" /></span><span><strong>Seller dashboard</strong><small>Manage your store</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
                : <Link href="/seller/apply"><span className="account-link-icon"><Store size={18} aria-hidden="true" /></span><span><strong>Become a seller</strong><small>Start selling with us</small></span><ArrowRight size={16} aria-hidden="true" /></Link>}
              <Link className="account-sign-out" href="/logout"><span className="account-link-icon"><LogOut size={18} aria-hidden="true" /></span><span><strong>Sign out</strong><small>Securely leave your account</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
            </nav>
          </section>
        </div>
      </div>
    </main>
  )
}
