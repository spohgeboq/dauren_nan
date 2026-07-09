const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding client (B2B) data...');

  const clientEmail = 'client@gmail.com';
  const plainPassword = 'client12';

  // Создаем тестовый магазин в таблице Client
  let store = await prisma.client.findFirst({ where: { email: clientEmail } });
  
  if (!store) {
    store = await prisma.client.create({
      data: {
        name: 'Продуктовый магазин "Жания"',
        phone: '+77051234567',
        email: clientEmail,
        route: 'Улица Абая 10, угол Сейфуллина',
        type: 'Магазин у дома',
        balance: -5000, // Пример долга
      }
    });
  }

  // Создаем пользователя и привязываем к магазину
  let user = await prisma.user.findUnique({ where: { email: clientEmail } });
  
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    user = await prisma.user.create({
      data: {
        email: clientEmail,
        name: 'Владелец Жания',
        role: 'CLIENT',
        passwordHash,
        clientId: store.id, // Связываем с созданным магазином!
      }
    });
  }

  console.log('Пользователь-клиент успешно создан:');
  console.log('Логин (Email):', user.email);
  console.log('Пароль:', plainPassword);
  console.log('Client seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
