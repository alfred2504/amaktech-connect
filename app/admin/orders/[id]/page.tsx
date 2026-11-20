import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { money } from '@/lib/utils';
import { AdminShell } from '@/components/AdminShell';

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
  });
  if (!order) notFound();

  return (
    <AdminShell
      title={`Order ${id.slice(0, 8)}`}
      description={`${order.user.name} · ${order.user.email}`}
    >
      <Link href="/admin/orders" className="admin-back">← All orders</Link>
      <div className="admin-order-summary">
        <span className="admin-order-status">{order.status}</span>
        <strong>{money(Number(order.total))}</strong>
        <small>{order.createdAt.toLocaleString()}</small>
      </div>
      <section className="admin-section admin-list">
        {order.items.map((item, index) => (
          <div className="admin-order-row" key={`${item.productName}-${index}`}>
            <span>
              <strong>{item.productName}</strong>
              <small>{item.quantity} item{item.quantity === 1 ? '' : 's'}</small>
            </span>
            <strong>{money(Number(item.unitPrice))}</strong>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
