import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { money } from '@/lib/utils';
import { AdminShell } from '@/components/AdminShell';

export default async function AdminOrders() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminShell title="Orders" description="Review every purchase and keep fulfilment on track.">
      <section className="admin-section admin-list">
        {orders.map(order => (
          <Link className="admin-order-row" href={`/admin/orders/${order.id}`} key={order.id}>
            <span>
              <strong>Order {order.id.slice(0, 8)}</strong>
              <small>{order.user.name}</small>
            </span>
            <span className="admin-order-status">{order.status}</span>
            <strong>{money(Number(order.total))}</strong>
          </Link>
        ))}
      </section>
    </AdminShell>
  );
}
