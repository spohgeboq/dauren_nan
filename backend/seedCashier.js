const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding cashier data (prices)...');

  const prices = {
    'Таба нан': 200,
    'Патыр нан': 250,
    'Үй наны': 150,
    'Ромашка нан': 180,
    'Лепешка нан': 220,
    'Серый лепешка': 190,
    'Булка нан': 160
  };

  for (const [name, price] of Object.entries(prices)) {
    await prisma.product.updateMany({
      where: { name },
      data: { price }
    });
  }

  // Создадим пользователя Кассира, если нет
  const bcrypt = require('bcryptjs');
  const cashierEmail = 'cashier@gmail.com';
  const existing = await prisma.user.findUnique({ where: { email: cashierEmail } });
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('cashier12', salt);
    await prisma.user.create({
      data: {
        email: cashierEmail,
        passwordHash: hash,
        name: 'Главный Кассир',
        role: 'CASHIER'
      }
    });
  }

  console.log('Cashier seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
