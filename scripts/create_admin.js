require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const name = 'Alfred Makura';
  const email = 'inforamaiv@gmail.com';
  const password = 'Alfred2504';

  const hashed = await bcrypt.hash(password, 12);

  // Ensure roles exist
  const superAdmin = await prisma.role.upsert({
    where: { name: 'Super Administrator' },
    update: { description: 'Full access to the platform' },
    create: { name: 'Super Administrator', description: 'Full access to the platform' },
  });

  const admin = await prisma.role.upsert({
    where: { name: 'Administrator' },
    update: { description: 'Administrative access to manage the platform' },
    create: { name: 'Administrator', description: 'Administrative access to manage the platform' },
  });

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashed,
      roleId: superAdmin.id,
      isActive: true,
    },
    create: {
      name,
      email,
      password: hashed,
      roleId: superAdmin.id,
      isActive: true,
    },
  });

  console.log('Admin upserted:', user.email, user.id);
}

main()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
