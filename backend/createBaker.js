const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('baker12', salt);
  await prisma.user.upsert({
    where: { email: 'baker@gmail.com' },
    update: { role: 'BAKER', passwordHash },
    create: { email: 'baker@gmail.com', name: 'Пекарь Тест', passwordHash, role: 'BAKER' }
  });
  console.log('Baker created');
}

main().finally(() => prisma.$disconnect());
