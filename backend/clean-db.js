const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Cleaning up random test data...');

  // Delete all Delivery Order Items & Orders
  await prisma.deliveryOrderItem.deleteMany({});
  await prisma.deliveryOrder.deleteMany({});
  
  // Delete all Production Tasks to reset the plan completely
  await prisma.batchLog.deleteMany({});
  await prisma.productionTask.deleteMany({});

  console.log('Successfully cleaned random orders and tasks!');
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
