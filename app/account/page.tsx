import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { money } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function Account() {
  const user = await requireUser()
  const [orders, cart] = await Promise.all([
    prisma.$queryRawUnsafe<Array<{ id: string; status: string; total: number; createdAt: Date }>>(
      'SELECT id, status, total, "createdAt" FROM public."Order" WHERE "userId" = $1::uuid AND "deletedAt" IS NULL ORDER BY "createdAt" DESC LIMIT 5',
      user.id,
    ),
    prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      'SELECT COALESCE(SUM(ci.quantity), 0)::bigint AS count FROM public."CartItem" ci JOIN public."Cart" c ON c.id = ci."cartId" WHERE c."userId" = $1::uuid AND c."deletedAt" IS NULL',
      user.id,
    ),
  ])

  return (
    <main className="account-page">
      <header className="account-header">
        <div className="account-container account-nav">
          <Link className="account-logo" href="/"><span>AmakTech</span> <b>Connect</b></Link>
          <nav><Link href="/products">Shop</Link><Link href="/account/orders">My orders</Link><Link href="/cart">Cart ({Number(cart[0]?.count || 0)})</Link><Link className="logout-link" href="/logout">Log out</Link></nav>
        </div>
      </header>
      <div className="account-container account-content">
        <div className="account-intro"><div><p className="account-kicker">Customer account</p><h1>Welcome, {user.name}</h1><p>Manage your orders, continue shopping, and keep your account details close at hand.</p></div><Link className="account-button" href="/products">Continue shopping</Link></div>
        <div className="account-actions"><Link className="account-action" href="/products"><strong>Shop products</strong><span>Browse the latest collection →</span></Link><Link className="account-action" href="/account/orders"><strong>Order history</strong><span>Track your purchases →</span></Link><Link className="account-action" href="/cart"><strong>Your cart</strong><span>{Number(cart[0]?.count || 0)} items ready to checkout →</span></Link></div>
        <section className="recent-orders"><div className="section-title"><h2>Recent orders</h2><Link href="/account/orders">View all</Link></div>{orders.length ? <div className="order-list">{orders.map(order => <Link className="order-row" href={`/account/orders/${order.id}`} key={order.id}><span><strong>Order {order.id.slice(0, 8)}</strong><small>{order.createdAt.toLocaleDateString()}</small></span><span className="order-status">{order.status}</span><strong>{money(order.total)}</strong></Link>)}</div> : <div className="empty-orders"><p>You have not placed an order yet.</p><Link href="/products">Find something you love →</Link></div>}</section>
      </div>
      <style>{`
        .account-page{min-height:100vh;background:#f7f5f5;color:#080808}.account-container{width:min(1180px,calc(100% - 40px));margin:0 auto}.account-header{background:#fff;border-top:6px solid #080808;border-bottom:1px solid #e7e2e3}.account-nav{min-height:88px;display:flex;align-items:center;justify-content:space-between;gap:24px}.account-logo{font-size:27px;font-weight:950;letter-spacing:-1.5px}.account-logo span{color:#319b19}.account-logo b{color:#d8a900}.account-nav nav{display:flex;align-items:center;gap:25px;font-size:14px;font-weight:700}.account-nav nav a:hover{color:#319b19}.logout-link{color:#319b19}.account-content{padding:62px 0}.account-intro{display:flex;justify-content:space-between;align-items:end;gap:30px}.account-kicker{color:#319b19;text-transform:uppercase;letter-spacing:2px;font-size:12px;font-weight:800;margin:0 0 14px}.account-intro h1{font-size:clamp(38px,5vw,64px);line-height:1;letter-spacing:-3px;margin:0 0 15px}.account-intro p:not(.account-kicker){color:#6f696b;max-width:560px;margin:0;line-height:1.5}.account-button{background:#080808;color:#fff;padding:15px 24px;border-radius:999px;font-weight:700;white-space:nowrap}.account-button:hover{background:#319b19}.account-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:48px 0}.account-action{background:#fff;border:1px solid #e8e2e3;border-radius:14px;padding:23px;display:grid;gap:9px}.account-action:hover{border-color:#d8a900;transform:translateY(-2px)}.account-action strong{font-size:19px}.account-action span{color:#716c6e;font-size:14px}.recent-orders{background:#fff;border:1px solid #e8e2e3;border-radius:14px;padding:26px}.section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.section-title h2{margin:0;font-size:24px}.section-title a,.empty-orders a{color:#319b19;font-weight:700}.order-list{display:grid}.order-row{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:22px;padding:18px 0;border-top:1px solid #eee9ea}.order-row span:first-child{display:grid;gap:5px}.order-row small{color:#777;font-size:13px}.order-status{text-transform:capitalize;color:#319b19;font-size:13px;font-weight:700}.empty-orders{border-top:1px solid #eee9ea;padding-top:22px;color:#716c6e}.empty-orders p{margin-top:0}@media(max-width:700px){.account-nav{align-items:flex-start;flex-direction:column;padding:22px 0}.account-nav nav{width:100%;justify-content:space-between;gap:10px;flex-wrap:wrap}.account-content{padding:38px 0}.account-intro{display:block}.account-button{display:inline-block;margin-top:22px}.account-actions{grid-template-columns:1fr;margin:32px 0}.order-row{grid-template-columns:1fr auto}.order-row>strong{grid-column:2;grid-row:1}.order-status{grid-column:1;grid-row:2}}
      `}</style>
    </main>
  )
}
