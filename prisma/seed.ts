import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const permissions = [
  "product.view",
  "product.create",
  "product.update",
  "product.delete",

  "category.view",
  "category.create",
  "category.update",
  "category.delete",

  "inventory.view",
  "inventory.manage",

  "order.view",
  "order.view_own",
  "order.create",
  "order.manage",

  "customer.view",
  "customer.manage",

  "user.manage",

  "role.manage",
  "permission.manage",

  "settings.manage",

  "audit.view",
];

async function main() {
  const adminEmail =
    process.env.ADMIN_EMAIL ?? "inforamaiv.com";

  const adminPassword =
    process.env.ADMIN_PASSWORD ?? "Alfred2504";

  /*
   * --------------------------------------------------
   * 1. CREATE / UPDATE ROLES
   * --------------------------------------------------
   */

  const superAdmin = await prisma.role.upsert({
    where: {
      name: "Super Administrator",
    },
    update: {
      description: "Full access to the platform",
    },
    create: {
      name: "Super Administrator",
      description: "Full access to the platform",
    },
  });

  const admin = await prisma.role.upsert({
    where: {
      name: "Administrator",
    },
    update: {
      description:
        "Administrative access to manage the platform",
    },
    create: {
      name: "Administrator",
      description:
        "Administrative access to manage the platform",
    },
  });

  const customer = await prisma.role.upsert({
    where: {
      name: "Customer",
    },
    update: {
      description: "Standard customer access",
    },
    create: {
      name: "Customer",
      description: "Standard customer access",
    },
  });

  /*
   * --------------------------------------------------
   * 2. CREATE / UPDATE PERMISSIONS
   * --------------------------------------------------
   */

  const permissionRecords = [];

  for (const permissionName of permissions) {
    const permission = await prisma.permission.upsert({
      where: {
        name: permissionName,
      },
      update: {},
      create: {
        name: permissionName,
        description: permissionName,
      },
    });

    permissionRecords.push(permission);
  }

  /*
   * --------------------------------------------------
   * 3. SUPER ADMINISTRATOR
   *
   * Super Administrator receives ALL permissions.
   * --------------------------------------------------
   */

  await prisma.role.update({
    where: {
      id: superAdmin.id,
    },
    data: {
      permissions: {
        set: permissionRecords.map(
          (permission) => ({
            id: permission.id,
          }),
        ),
      },
    },
  });

  /*
   * --------------------------------------------------
   * 4. ADMINISTRATOR
   * --------------------------------------------------
   */

  const adminPermissionNames = [
    "product.view",
    "product.create",
    "product.update",
    "product.delete",

    "category.view",
    "category.create",
    "category.update",
    "category.delete",

    "inventory.view",
    "inventory.manage",

    "order.view",
    "order.manage",

    "customer.view",
    "customer.manage",
  ];

  const adminPermissionRecords =
    permissionRecords.filter((permission) =>
      adminPermissionNames.includes(permission.name),
    );

  await prisma.role.update({
    where: {
      id: admin.id,
    },
    data: {
      permissions: {
        set: adminPermissionRecords.map(
          (permission) => ({
            id: permission.id,
          }),
        ),
      },
    },
  });

  /*
   * --------------------------------------------------
   * 5. CUSTOMER
   * --------------------------------------------------
   */

  const customerPermissionNames = [
    "product.view",
    "category.view",

    "cart.manage",

    "order.view_own",
    "order.create",

    "profile.manage",
  ];

  /*
   * Create permissions that are referenced by the
   * customer role but may not yet exist in the
   * original permissions.ts.
   */

  for (const permissionName of customerPermissionNames) {
    const permission = await prisma.permission.upsert({
      where: {
        name: permissionName,
      },
      update: {},
      create: {
        name: permissionName,
        description: permissionName,
      },
    });

    permissionRecords.push(permission);
  }

  const customerPermissions =
    permissionRecords.filter((permission) =>
      customerPermissionNames.includes(permission.name),
    );

  await prisma.role.update({
    where: {
      id: customer.id,
    },
    data: {
      permissions: {
        set: customerPermissions.map(
          (permission) => ({
            id: permission.id,
          }),
        ),
      },
    },
  });

  /*
   * --------------------------------------------------
   * 6. CREATE / UPDATE ADMIN USER
   * --------------------------------------------------
   */

  const hashedPassword = await bcrypt.hash(
    adminPassword,
    12,
  );

  await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      name: "System Administrator",
      password: hashedPassword,
      roleId: superAdmin.id,
      isActive: true,
    },
    create: {
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      roleId: superAdmin.id,
      isActive: true,
    },
  });

  /*
   * --------------------------------------------------
   * 7. DEFAULT SETTINGS
   * --------------------------------------------------
   */

  const defaultSettings = [
    {
      key: "site_name",
      value: "Amaktech Connect",
      description: "Application display name",
    },
    {
      key: "currency",
      value: "USD",
      description: "Default currency",
    },
    {
      key: "tax_rate",
      value: "0.15",
      description: "Default tax rate",
    },
    {
      key: "shipping_rate",
      value: "5.99",
      description: "Default shipping rate",
    },
    {
      key: "maintenance_mode",
      value: "false",
      description:
        "Whether the storefront is in maintenance mode",
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: {
        key: setting.key,
      },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
      },
    });
  }

  console.log("");
  console.log("========================================");
  console.log("AmakTech Connect seed completed");
  console.log("========================================");
  console.log("");
  console.log("Roles:");
  console.log("✔ Super Administrator");
  console.log("✔ Administrator");
  console.log("✔ Customer");
  console.log("");
  console.log(
    `Permissions created: ${permissionRecords.length}`,
  );
  console.log("");
  console.log(`Admin user: ${adminEmail}`);
  console.log("");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });