# Production readiness checklist

- Review the replacement Prisma schema against the existing database, back up production, and prepare a reviewed migration plan before applying schema changes.
- Keep `DATABASE_URL` for pooled application traffic and `DIRECT_URL` for direct Prisma schema operations.
- Set a unique `BETTER_AUTH_SECRET` of at least 32 characters and keep all service credentials server-side.
- Configure and verify Supabase Storage bucket `products` before enabling image uploads.
- Configure Resend (`RESEND_API_KEY`, `EMAIL_FROM`, and `NEXT_PUBLIC_APP_URL`) before enabling password reset emails.
- Integrate and verify payment-provider callbacks before treating online payments as paid. Current checkout does not charge cards or initiate EcoCash/InnBucks.
- Configure actual shipping rates and carrier integrations; current shipment and seller-fulfillment statuses are operational records.
- Add rate limiting, security headers, monitoring, backups, and CI before production.
- Test role-based access, order cancellation/restocking, coupon limits, and payment verification against a non-production database.
