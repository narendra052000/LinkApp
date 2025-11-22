// Optional: Seed script for development
// Run with: npx ts-node prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.link.deleteMany({});

  // Create sample links
  const link1 = await prisma.link.create({
    data: {
      code: 'google',
      targetUrl: 'https://www.google.com',
      clicks: 5,
      lastClicked: new Date('2025-11-20T10:00:00Z'),
    },
  });

  const link2 = await prisma.link.create({
    data: {
      code: 'github',
      targetUrl: 'https://www.github.com',
      clicks: 12,
      lastClicked: new Date('2025-11-22T14:30:00Z'),
    },
  });

  console.log('Seeded links:', { link1, link2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
