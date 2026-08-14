export const PERMISSIONS = {
  PRODUCT_VIEW: "product.view",
  PRODUCT_CREATE: "product.create",
  PRODUCT_UPDATE: "product.update",
  PRODUCT_DELETE: "product.delete",

  CATEGORY_VIEW: "category.view",
  CATEGORY_CREATE: "category.create",
  CATEGORY_UPDATE: "category.update",
  CATEGORY_DELETE: "category.delete",

  BRAND_VIEW: "brand.view",
  BRAND_CREATE: "brand.create",
  BRAND_UPDATE: "brand.update",
  BRAND_DELETE: "brand.delete",

  INVENTORY_VIEW: "inventory.view",
  INVENTORY_MANAGE: "inventory.manage",

  ORDER_VIEW: "order.view",
  ORDER_VIEW_OWN: "order.view_own",
  ORDER_CREATE: "order.create",
  ORDER_MANAGE: "order.manage",

  CUSTOMER_VIEW: "customer.view",
  CUSTOMER_MANAGE: "customer.manage",

  USER_MANAGE: "user.manage",

  ROLE_MANAGE: "role.manage",
  PERMISSION_MANAGE: "permission.manage",
  SETTINGS_MANAGE: "settings.manage",
  AUDIT_VIEW: "audit.view",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];