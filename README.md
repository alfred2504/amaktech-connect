# AmakTech Connect

AmakTech Connect is a multi-seller marketplace built with Next.js, Prisma, and PostgreSQL.

## Local setup

Requirements: Node.js 20+ and PostgreSQL.

1. Copy `.env.example` to `.env` and set the database URLs and a random `BETTER_AUTH_SECRET` of at least 32 characters.
2. Install dependencies with `npm install`.
3. Generate the Prisma client with `npm run db:generate`.
4. Apply the schema only after reviewing its diff and backing up the database. For a new development database, `npx prisma db push` can create the tables.
5. Seed categories with `npm run db:seed`.
6. Start the app with `npm run dev`.

Use the pooled `DATABASE_URL` for runtime traffic and the direct `DIRECT_URL` for Prisma schema operations. Do not push this replacement schema to a production database without reviewing destructive changes and the migration plan.

## Included workflows

- Database-backed customer accounts and signed HTTP-only sessions
- Product catalog, cart, checkout, address management, order history, and wishlist
- Idempotent checkout with server-side price, discount, stock, and commission calculations
- Seller onboarding, product editing/moderation, store profile, order fulfillment, and payout requests
- Account-protected administration for categories, customers, sellers, products, orders, reviews, coupons, payments, shipments, and payouts
- Customer reviews, notifications, and payment-reference submission
- Optional Supabase Storage uploads and Resend password-reset emails

## Integration limits

Checkout records orders but does not charge a card or call EcoCash/InnBucks. Manual payment references require administrator verification; cash-on-delivery orders have a separate confirmation action. Payout records track manual operations and do not transfer money. Configure payment providers, shipping rates, email delivery, storage, and operational safeguards before production use.

Supabase uploads require a `products` bucket and a server-only `SUPABASE_SERVICE_ROLE_KEY`; never expose that key to the browser. Password reset email requires `RESEND_API_KEY`, `EMAIL_FROM`, and `NEXT_PUBLIC_APP_URL`.

## Useful commands

- `npm run db:generate` — generate the Prisma client
- `npx prisma validate` — validate the schema
- `npm run db:seed` — upsert marketplace categories
- `npm run lint` — lint the configured project paths
- `npm run build` — generate Prisma client and create a production build
