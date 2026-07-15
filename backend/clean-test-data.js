const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Cleaning up all test data...');

  // Purchases
  await prisma.purchaseItem.deleteMany({});
  await prisma.purchase.deleteMany({});
  
  // Suppliers
  await prisma.supplierPayment.deleteMany({});
  await prisma.supplier.deleteMany({});

  // Expenses
  await prisma.expense.deleteMany({});

  // Inventory
  await prisma.rawMaterial.deleteMany({});
  await prisma.inventoryAdjustment.deleteMany({});
  
  console.log('Successfully cleaned all test data!');
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
