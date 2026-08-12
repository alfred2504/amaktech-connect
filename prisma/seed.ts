import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'inforamaiv.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Alfred2504';

  const roles = await prisma.$transaction(async (tx) => {
    const superAdmin = await tx.role.upsert({
      where: { name: 'Super Administrator' },
      update: { description: 'Full access to the platform' },
      create: { name: 'Super Administrator', description: 'Full access to the platform' },
    });

    const admin = await tx.role.upsert({
      where: { name: 'Administrator' },
      update: { description: 'Administrative access to manage the platform' },
      create: { name: 'Administrator', description: 'Administrative access to manage the platform' },
    });

    const customer = await tx.role.upsert({
      where: { name: 'Customer' },
      update: { description: 'Standard customer access' },
      create: { name: 'Customer', description: 'Standard customer access' },
    });

    return { superAdmin, admin, customer };
  });

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'System Administrator',
      password: hashedPassword,
      roleId: roles.superAdmin.id,
      isActive: true,
    },
    create: {
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      roleId: roles.superAdmin.id,
      isActive: true,
    },
  });

  const defaultSettings = [
    { key: 'site_name', value: 'Amaktech Connect', description: 'Application display name' },
    { key: 'currency', value: 'USD', description: 'Default currency' },
    { key: 'tax_rate', value: '0.15', description: 'Default tax rate' },
    { key: 'shipping_rate', value: '5.99', description: 'Default shipping rate' },
    { key: 'maintenance_mode', value: 'false', description: 'Whether the storefront is in maintenance mode' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
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

  console.log('Seed completed successfully.');
  console.log(`Admin user created: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });