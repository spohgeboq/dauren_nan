const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding courier data...');
  const bcrypt = require('bcryptjs');

  // 1. Создаем пользователя-курьера
  const driverEmail = 'driver@gmail.com';
  let driver = await prisma.user.findUnique({ where: { email: driverEmail } });
  if (!driver) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('driver12', salt);
    driver = await prisma.user.create({
      data: {
        email: driverEmail,
        passwordHash: hash,
        name: 'Главный Курьер',
        role: 'DRIVER'
      }
    });
  }

  // 2. Получаем товары
  const taba = await prisma.product.findUnique({ where: { name: 'Таба нан' } });
  const patir = await prisma.product.findUnique({ where: { name: 'Патыр нан' } });

  // 3. Создаем тестовые заказы (только если их еще нет, чтобы не плодить)
  const existingOrders = await prisma.deliveryOrder.count();
  if (existingOrders === 0 && taba && patir) {
    await prisma.deliveryOrder.create({
      data: {
        clientName: 'Магазин "Айгуль"',
        clientPhone: '+77010001122',
        address: 'Улица Абая 150',
        status: 'PENDING',
        totalAmount: taba.price * 10 + patir.price * 5,
        isPaid: false,
        driverId: driver.id,
        items: {
          create: [
            { productId: taba.id, quantity: 10, price: taba.price },
            { productId: patir.id, quantity: 5, price: patir.price }
          ]
        }
      }
    });

    await prisma.deliveryOrder.create({
      data: {
        clientName: 'Мини-маркет "Радость"',
        clientPhone: '+77053334455',
        address: 'Улица Сейфуллина 45',
        status: 'IN_TRANSIT',
        totalAmount: taba.price * 20,
        isPaid: true,
        paymentMethod: 'CASH', // Уже оплатил налом ранее или перевел
        driverId: driver.id,
        items: {
          create: [
            { productId: taba.id, quantity: 20, price: taba.price }
          ]
        }
      }
    });
  }

  console.log('Courier seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
