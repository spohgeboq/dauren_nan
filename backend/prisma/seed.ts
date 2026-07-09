import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up database tables in order
  console.log('🧹 Cleaning up database tables...');
  await prisma.rolePermission.deleteMany({});
  await prisma.customRole.deleteMany({});
  await prisma.defectLog.deleteMany({});
  await prisma.productionBatch.deleteMany({});
  await prisma.deliveryOrderItem.deleteMany({});
  await prisma.deliveryOrder.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.batchLog.deleteMany({});
  await prisma.productionTask.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.recipeIngredient.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.rawMaterial.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('🧹 Cleaned up all tables.');

  // ─── 1. Admin User ────────────────────────────────────
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('admin12', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      passwordHash: adminHash,
      name: 'Главный Администратор',
      phone: '+7 701 000 0000',
      login: 'admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      isOnShift: true,
    },
  });
  console.log('✅ Admin:', admin.email);

  // ─── 2. Workspace Users ───────────────────────────────
  const workspacesUsers = [
    { email: 'baker@gmail.com', password: 'baker12', name: 'Тестовый Пекарь', login: 'baker', role: 'BAKER' as const },
    { email: 'cashier@gmail.com', password: 'cashier12', name: 'Главный Кассир', login: 'cashier', role: 'CASHIER' as const },
    { email: 'driver@gmail.com', password: 'driver12', name: 'Главный Курьер', login: 'driver', role: 'DRIVER' as const },
  ];

  const seededUsers: any[] = [];
  for (const wu of workspacesUsers) {
    const hash = await bcrypt.hash(wu.password, salt);
    const u = await prisma.user.upsert({
      where: { email: wu.email },
      update: {},
      create: {
        email: wu.email,
        passwordHash: hash,
        name: wu.name,
        login: wu.login,
        role: wu.role,
        status: 'ACTIVE',
        isOnShift: true,
      },
    });
    seededUsers.push(u);
  }
  console.log('✅ Workspace Users seeded');

  // ─── 3. Employees ─────────────────────────────────────
  const employees = [
    { email: 'madina@daurennan.kz', name: 'Мадина Саматова', phone: '+7 705 222 3344', login: 'madina_c', role: 'CASHIER' as const, isOnShift: true },
    { email: 'bauyrzhan@daurennan.kz', name: 'Бауыржан Оспанов', phone: '+7 707 333 4455', login: 'b_ospanov', role: 'BAKER' as const, isOnShift: true },
    { email: 'serik@daurennan.kz', name: 'Серик Ахметов', phone: '+7 777 444 5566', login: 'serik_drv', role: 'DRIVER' as const, isOnShift: false },
    { email: 'azamat@daurennan.kz', name: 'Азамат Ильясов', phone: '+7 701 555 6677', login: 'azamat_drv', role: 'DRIVER' as const, isOnShift: true },
  ];

  for (const emp of employees) {
    const hash = await bcrypt.hash('password123', salt);
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: { ...emp, passwordHash: hash, status: 'ACTIVE' },
    });
  }
  console.log('✅ Employees created');

  // ─── 4. Categories ────────────────────────────────────
  const categories = [
    { name: 'Тандырные лепешки', iconName: 'Flame', sortOrder: 1 },
    { name: 'Формовой хлеб', iconName: 'Wheat', sortOrder: 2 },
    { name: 'Сдоба и Булочки', iconName: 'Cookie', sortOrder: 3 },
    { name: 'Кондитерские изделия', iconName: 'Cake', sortOrder: 4 },
  ];

  const createdCategories: any[] = [];
  for (const cat of categories) {
    const c = await prisma.category.create({ data: cat });
    createdCategories.push(c);
  }
  console.log('✅ Categories created');

  // ─── 5. Products ──────────────────────────────────────
  const products = [
    { sku: 'TBN-001', name: 'Таба нан', categoryId: createdCategories[0].id, weight: 350, cost: 70, price: 200, stock: 15 },
    { sku: 'UYN-002', name: 'Уй наны', categoryId: createdCategories[0].id, weight: 400, cost: 80, price: 150, stock: 10 },
    { sku: 'PTR-003', name: 'Патыр нан', categoryId: createdCategories[0].id, weight: 300, cost: 65, price: 250, stock: 8 },
    { sku: 'BTN-004', name: 'Батон нарезной', categoryId: createdCategories[1].id, weight: 450, cost: 90, price: 180, stock: 20 },
    { sku: 'HLB-005', name: 'Хлеб Пшеничный', categoryId: createdCategories[1].id, weight: 500, cost: 60, price: 160, stock: 30 },
    { sku: 'KRS-007', name: 'Круассан классический', categoryId: createdCategories[2].id, weight: 80, cost: 120, price: 350, stock: 5 },
  ];

  // Additional products from remote cashier lists
  const additionalProducts = [
    { sku: 'ROM-008', name: 'Ромашка нан', categoryId: createdCategories[1].id, weight: 350, cost: 75, price: 180, stock: 12 },
    { sku: 'LEP-009', name: 'Лепешка нан', categoryId: createdCategories[0].id, weight: 300, cost: 80, price: 220, stock: 14 },
    { sku: 'SLP-010', name: 'Серый лепешка', categoryId: createdCategories[0].id, weight: 320, cost: 70, price: 190, stock: 10 },
    { sku: 'BLK-011', name: 'Булка нан', categoryId: createdCategories[1].id, weight: 400, cost: 65, price: 160, stock: 15 },
  ];

  const createdProducts: any[] = [];
  for (const p of [...products, ...additionalProducts]) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }
  console.log('✅ Products created');

  // ─── 6. Clients ───────────────────────────────────────
  const clients = [
    { name: 'Продуктовый "Айгерим"', type: 'Магазин у дома', ownerName: 'Айгерим', phone: '+7 (701) 123-45-67', email: 'aigerim@mail.ru', route: 'Маршрут #1 (Центр)', balance: -15500, deliveryTime: '08:00 - 10:00' },
    { name: 'Кофейня "Зерно"', type: 'Кафе', ownerName: 'Данияр', phone: '+7 (705) 987-65-43', email: 'zerno@cafe.kz', route: 'Маршрут #2 (Юг)', balance: 0, deliveryTime: '07:00 - 08:30' },
    { name: 'Супермаркет "Алма"', type: 'Супермаркет', ownerName: 'ТОО АлмаТрейд', phone: '+7 (777) 555-44-33', email: 'info@alma.kz', route: 'Маршрут #1 (Центр)', balance: -45000, deliveryTime: '06:00 - 08:00' },
    { name: 'Столовая "Вкусно"', type: 'Столовая', ownerName: 'Гульмира', phone: '+7 (707) 111-22-33', route: 'Маршрут #3 (Север)', balance: 12000, deliveryTime: '09:00 - 11:00' },
    { name: 'Минимаркет "24/7"', type: 'Магазин у дома', ownerName: 'Азамат', phone: '+7 (775) 333-22-11', email: 'aza24@yandex.ru', route: 'Маршрут #2 (Юг)', balance: -5000, deliveryTime: '09:00 - 12:00' },
  ];

  for (const client of clients) {
    await prisma.client.create({ data: client });
  }
  console.log('✅ Clients created');

  // ─── 7. Inventory (Warehouse Stock) ───────────────
  const inventoryItems = [
    { name: 'Мука высший сорт', currentStock: 450, minLimit: 500, costPerUnit: 250, baseUnit: 'кг', purchaseUnit: 'Мешок', conversionRatio: 50 },
    { name: 'Мука 1 сорт', currentStock: 1200, minLimit: 1000, costPerUnit: 220, baseUnit: 'кг', purchaseUnit: 'Мешок', conversionRatio: 50 },
    { name: 'Дрожжи прессованные', currentStock: 15, minLimit: 20, costPerUnit: 1200, baseUnit: 'кг', purchaseUnit: 'Коробка', conversionRatio: 10 },
    { name: 'Соль йодированная', currentStock: 45, minLimit: 30, costPerUnit: 80, baseUnit: 'кг', purchaseUnit: 'Мешок', conversionRatio: 25 },
    { name: 'Масло подсолнечное', currentStock: 25, minLimit: 15, costPerUnit: 750, baseUnit: 'л', purchaseUnit: 'Канистра', conversionRatio: 5 },
    { name: 'Маргарин', currentStock: 40, minLimit: 40, costPerUnit: 900, baseUnit: 'кг', purchaseUnit: 'Коробка', conversionRatio: 20 },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({ data: item });
  }
  console.log('✅ Inventory items created');

  // ─── 8. Raw Materials for Recipes (With Stock) ────────
  const rawMaterials = [
    { name: 'Мука пшеничная', unit: 'кг', costPerUnit: 250, stock: 1000 },
    { name: 'Вода', unit: 'л', costPerUnit: 0, stock: 500 },
    { name: 'Дрожжи', unit: 'кг', costPerUnit: 1200, stock: 10 },
    { name: 'Соль', unit: 'кг', costPerUnit: 80, stock: 50 },
    { name: 'Масло подсолнечное', unit: 'л', costPerUnit: 750, stock: 25 },
    { name: 'Сахар', unit: 'кг', costPerUnit: 400, stock: 30 },
  ];

  const createdRM: any[] = [];
  for (const rm of rawMaterials) {
    const r = await prisma.rawMaterial.create({ data: rm });
    createdRM.push(r);
  }
  console.log('✅ Raw materials created');

  // ─── 9. Recipes ───────────────────────────────────────
  // Таба нан recipe
  const tabaProduct = createdProducts.find(p => p.name === 'Таба нан');
  if (tabaProduct) {
    await prisma.recipe.create({
      data: {
        productId: tabaProduct.id,
        ingredients: {
          create: [
            { rawMaterialId: createdRM[0].id, amount: 0.3, quantity: 0.3 }, // 300g flour
            { rawMaterialId: createdRM[1].id, amount: 0.15, quantity: 0.15 }, // 150ml water
            { rawMaterialId: createdRM[2].id, amount: 0.005, quantity: 0.005 }, // 5g yeast
            { rawMaterialId: createdRM[3].id, amount: 0.005, quantity: 0.005 }, // 5g salt
          ],
        },
      },
    });
  }

  // Батон нарезной recipe
  const batonProduct = createdProducts.find(p => p.name === 'Батон нарезной');
  if (batonProduct) {
    await prisma.recipe.create({
      data: {
        productId: batonProduct.id,
        ingredients: {
          create: [
            { rawMaterialId: createdRM[0].id, amount: 0.4, quantity: 0.4 },
            { rawMaterialId: createdRM[1].id, amount: 0.2, quantity: 0.2 },
            { rawMaterialId: createdRM[3].id, amount: 0.007, quantity: 0.007 },
            { rawMaterialId: createdRM[2].id, amount: 0.005, quantity: 0.005 },
          ],
        },
      },
    });
  }
  console.log('✅ Recipes created');

  // ─── 10. Vehicles ──────────────────────────────────────
  const vehicles = [
    { brandModel: 'ГАЗель Next', licensePlate: '512 ASD 02', capacityTrays: 120, fuelConsumption: 16, status: 'ACTIVE' as const },
    { brandModel: 'ГАЗель Бизнес', licensePlate: '777 VIP 02', capacityTrays: 100, fuelConsumption: 18.5, status: 'ACTIVE' as const },
    { brandModel: 'Lada Largus', licensePlate: '123 QWE 02', capacityTrays: 40, fuelConsumption: 9.5, status: 'REPAIR' as const },
    { brandModel: 'Ford Transit', licensePlate: '001 BBB 02', capacityTrays: 150, fuelConsumption: 14, status: 'ACTIVE' as const },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.create({ data: v });
  }
  console.log('✅ Vehicles created');

  // ─── 11. Expenses ─────────────────────────────────────
  const expenses = [
    { date: new Date('2026-07-04'), category: 'FUEL' as const, description: 'Заправка Газель (045 ABC)', paymentMethod: 'KASPI' as const, amount: 12000 },
    { date: new Date('2026-07-03'), category: 'SALARY' as const, description: 'Аванс пекарям за июль', paymentMethod: 'CASH' as const, amount: 450000 },
    { date: new Date('2026-07-02'), category: 'RENT' as const, description: 'Оплата аренды цеха (Июль)', paymentMethod: 'KASPI' as const, amount: 800000 },
    { date: new Date('2026-06-28'), category: 'REPAIR' as const, description: 'Ремонт тестомеса', paymentMethod: 'CASH' as const, amount: 45000 },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({ data: exp });
  }
  console.log('✅ Expenses created');

  // ─── 12. Courier Delivery Orders ──────────────────────
  const driverUser = seededUsers.find(u => u.role === 'DRIVER');
  if (driverUser && tabaProduct && batonProduct) {
    await prisma.deliveryOrder.create({
      data: {
        clientName: 'Магазин "Айгуль"',
        clientPhone: '+77010001122',
        address: 'Улица Абая 150',
        status: 'PENDING',
        totalAmount: tabaProduct.price * 10 + batonProduct.price * 5,
        isPaid: false,
        driverId: driverUser.id,
        items: {
          create: [
            { productId: tabaProduct.id, quantity: 10, price: tabaProduct.price },
            { productId: batonProduct.id, quantity: 5, price: batonProduct.price }
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
        totalAmount: tabaProduct.price * 20,
        isPaid: true,
        paymentMethod: 'CASH',
        driverId: driverUser.id,
        items: {
          create: [
            { productId: tabaProduct.id, quantity: 20, price: tabaProduct.price }
          ]
        }
      }
    });
    console.log('✅ Delivery orders created');
  }

  // ─── 13. Custom Roles ─────────────────────────────────
  await prisma.customRole.create({
    data: {
      name: 'Старший пекарь',
      description: 'Доступ к производству и рецептам',
      permissions: {
        create: [
          { module: 'production', canView: true, canCreate: true, canEdit: true, canDelete: false },
          { module: 'recipes', canView: true, canCreate: false, canEdit: true, canDelete: false },
          { module: 'inventory', canView: true, canCreate: false, canEdit: false, canDelete: false },
        ],
      },
    },
  });

  await prisma.customRole.create({
    data: {
      name: 'Менеджер по продажам',
      description: 'Доступ к клиентам, заказам и маршрутам',
      permissions: {
        create: [
          { module: 'clients', canView: true, canCreate: true, canEdit: true, canDelete: false },
          { module: 'orders', canView: true, canCreate: true, canEdit: true, canDelete: false },
          { module: 'routes', canView: true, canCreate: true, canEdit: true, canDelete: false },
          { module: 'products', canView: true, canCreate: false, canEdit: false, canDelete: false },
        ],
      },
    },
  });
  console.log('✅ Custom roles created');

  console.log('\n🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
