# Database Design Overview

## Core entities
- User
- Role
- Permission
- Category
- Brand
- Product
- ProductImage
- Inventory
- Cart
- CartItem
- Order
- OrderItem
- Address
- Review
- Notification
- AuditLog
- Setting

## Conventions
- UUID primary keys are used.
- Standard audit fields are included where appropriate: `id`, `createdAt`, `updatedAt`, and optional `deletedAt` for soft deletes.
- Relationships are modeled for users, categories, carts, orders, reviews, and notifications.

## Notes
- Prisma schema was initialized as a starter foundation for the ecommerce database.
- The schema can be extended with enums, indexes, and stronger validation as development progresses.
