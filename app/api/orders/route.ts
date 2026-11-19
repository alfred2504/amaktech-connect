import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
const schema = z.object({
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(50) })).min(1).max(100,
  ),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "ECOCASH", "INNBucks", "BANK_TRANSFER", "CARD"]),
  shippingAddress: z.object({ recipient: z.string().min(2), phone: z.string().min(5), line1: z.string().min(3), line2: z.string().optional(), city: z.string().min(2), province: z.string().optional(), country: z.string().default("Zimbabwe"), postalCode: z.string().optional() }),
  notes: z.string().max(1000).optional()
});
export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Please sign in before placing an order." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Checkout information is incomplete or invalid." }, { status: 400 });
  const productIds = [...new Set(parsed.data.items.map(i => i.productId))];
  try {
    const order = await prisma.$transaction(async tx => {
      const products = await tx.product.findMany({ where: { id: { in: productIds }, active: true } });
      if (products.length !== productIds.length) throw new Error("Some products are unavailable.");
      const productMap = new Map(products.map(p => [p.id, p]));
      const lines = parsed.data.items.map(item => {
        const p = productMap.get(item.productId)!;
        if (p.stock < item.quantity) throw new Error(`Insufficient stock for ${p.name}.`);
        return { product: p, quantity: item.quantity };
      });
      const subtotal = lines.reduce((sum, l) => sum + Number(l.product.price) * l.quantity, 0);
      const shipping = subtotal >= 100 ? 0 : 5;
      const orderNumber = `AC-${Date.now().toString().slice(-8)}`;
      for (const line of lines) await tx.product.update({ where: { id: line.product.id }, data: { stock: { decrement: line.quantity } } });
      return tx.order.create({ data: {
        orderNumber, userId: user.id, paymentMethod: parsed.data.paymentMethod, subtotal, shipping, discount: 0, total: subtotal + shipping,
        shippingAddress: parsed.data.shippingAddress, notes: parsed.data.notes,
        items: { create: lines.map(l => ({ productId: l.product.id, sellerId: l.product.sellerId, productName: l.product.name, unitPrice: l.product.price, quantity: l.quantity, lineTotal: Number(l.product.price) * l.quantity })) },
        payment: { create: { method: parsed.data.paymentMethod, amount: subtotal + shipping, status: "PENDING" } }
      }, include: { items: true } });
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const orders = await prisma.order.findMany({ where: { userId: user.id }, include: { items: true, payment: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ orders });
}
