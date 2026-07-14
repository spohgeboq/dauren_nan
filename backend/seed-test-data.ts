const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Generating test data for Routes...');

  // 1. Get some products
  const products = await prisma.product.findMany({ take: 3 });
  if (products.length === 0) {
    console.log('No products found, skipping.');
    return;
  }

  // 2. Create 3 test clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Супермаркет "Анвар"',
      type: 'Магазин',
      ownerName: 'Айдос',
      phone: '+7 701 111 2233',
      route: 'Левый берег, ул. Достык 1',
    }
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Магазин "Самал"',
      type: 'Магазин',
      ownerName: 'Гульназ',
      phone: '+7 702 333 4455',
      route: 'Левый берег, ул. Кунаева 14',
    }
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Кофейня "Зерно"',
      type: 'Кафе',
      ownerName: 'Тимур',
      phone: '+7 705 555 6677',
      route: 'Мангилик Ел 50',
    }
  });

  // 3. Create orders for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);

  const createOrder = async (client) => {
    return prisma.deliveryOrder.create({
      data: {
        clientName: client.name,
        clientPhone: client.phone,
        address: client.route,
        status: 'PENDING',
        totalAmount: 15000,
        isPaid: false,
        clientId: client.id,
        createdAt: tomorrow,
        items: {
          create: products.map((p: any) => ({
            productId: p.id,
            quantity: Math.floor(Math.random() * 50) + 10,
            price: p.price
          }))
        }
      }
    });
  };

  await createOrder(client1);
  await createOrder(client2);
  await createOrder(client3);

  console.log('Successfully created test clients and orders for tomorrow!');
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
