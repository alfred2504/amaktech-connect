# AmakTech Connect

Production-oriented e-commerce MVP for AmakTech Solutions: customer accounts, catalog, cart, checkout, orders, inventory, addresses, reviews, admin dashboard, RBAC-ready data model and Supabase-ready storage.

## Setup
1. Copy `.env.example` to `.env` and fill values. Never commit secrets.
2. `npm install`
3. `npx prisma generate`
4. For a new database: `npx prisma migrate dev --name init` then `npm run db:seed`.
5. For an existing database, inspect migration state first; do **not** run `prisma migrate reset`.
6. `npm run dev`

Default seeded admin: `admin@amaktech.co.zw` / `ChangeMe123!` — change immediately.

## Included
- Responsive storefront
- Search/filter/sort catalog
- Product details and reviews
- Registration/login/logout with signed HTTP-only cookie
- Customer account and order history
- Address management
- Server-side cart and checkout
- Transactional stock reservation and inventory transactions
- Admin product/category/brand/order management
- Role/permission schema and authorization helper
- Supabase Storage upload helper
- Seed data

Payment is deliberately implemented as a safe COD/manual-payment flow. Connect a real Zimbabwe payment provider only after obtaining merchant credentials and implementing its verified webhook/signature flow.
