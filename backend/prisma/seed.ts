import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

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

  // ─── 2. Employees ─────────────────────────────────────
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

  // ─── 3. Categories ────────────────────────────────────
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

  // ─── 4. Products ──────────────────────────────────────
  const products = [
    { sku: 'TBN-001', name: 'Таба нан', categoryId: createdCategories[0].id, weight: 350, cost: 70, price: 150 },
    { sku: 'UYN-002', name: 'Уй наны', categoryId: createdCategories[0].id, weight: 400, cost: 80, price: 170 },
    { sku: 'PTR-003', name: 'Патыр нан', categoryId: createdCategories[0].id, weight: 300, cost: 65, price: 140 },
    { sku: 'BTN-004', name: 'Батон нарезной', categoryId: createdCategories[1].id, weight: 450, cost: 90, price: 200 },
    { sku: 'HLB-005', name: 'Хлеб Пшеничный', categoryId: createdCategories[1].id, weight: 500, cost: 60, price: 150 },
    { sku: 'HLB-006', name: 'Хлеб Бородинский', categoryId: createdCategories[1].id, weight: 400, cost: 75, price: 180 },
    { sku: 'KRS-007', name: 'Круассан классический', categoryId: createdCategories[2].id, weight: 80, cost: 120, price: 350 },
    { sku: 'SNB-008', name: 'Синнабон', categoryId: createdCategories[2].id, weight: 120, cost: 180, price: 550 },
    { sku: 'BLM-009', name: 'Булочка с маком', categoryId: createdCategories[2].id, weight: 100, cost: 45, price: 120 },
    { sku: 'SMS-010', name: 'Самса с говядиной', categoryId: createdCategories[3].id, weight: 150, cost: 100, price: 350 },
  ];

  const createdProducts: any[] = [];
  for (const p of products) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }
  console.log('✅ Products created');

  // ─── 5. Clients ───────────────────────────────────────
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

  // ─── 6. Inventory (Raw Materials Stock) ───────────────
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

  // ─── 7. Raw Materials for Recipes ─────────────────────
  const rawMaterials = [
    { name: 'Мука пшеничная 1 сорт', unit: 'г', costPerUnit: 0.18 },
    { name: 'Вода очищенная', unit: 'мл', costPerUnit: 0.01 },
    { name: 'Соль пищевая', unit: 'г', costPerUnit: 0.05 },
    { name: 'Дрожжи прессованные', unit: 'г', costPerUnit: 0.6 },
    { name: 'Кунжут белый', unit: 'г', costPerUnit: 1.5 },
    { name: 'Масло подсолнечное', unit: 'мл', costPerUnit: 0.45 },
    { name: 'Пакет брендированный', unit: 'шт', costPerUnit: 15 },
    { name: 'Сахар', unit: 'г', costPerUnit: 0.35 },
  ];

  const createdRM: any[] = [];
  for (const rm of rawMaterials) {
    const r = await prisma.rawMaterial.create({ data: rm });
    createdRM.push(r);
  }
  console.log('✅ Raw materials created');

  // ─── 8. Recipes ───────────────────────────────────────
  // Таба нан recipe
  await prisma.recipe.create({
    data: {
      productId: createdProducts[0].id,
      ingredients: {
        create: [
          { rawMaterialId: createdRM[0].id, amount: 350 },
          { rawMaterialId: createdRM[1].id, amount: 180 },
          { rawMaterialId: createdRM[2].id, amount: 6 },
          { rawMaterialId: createdRM[3].id, amount: 4 },
          { rawMaterialId: createdRM[5].id, amount: 15 },
        ],
      },
    },
  });

  // Батон нарезной recipe
  await prisma.recipe.create({
    data: {
      productId: createdProducts[3].id,
      ingredients: {
        create: [
          { rawMaterialId: createdRM[0].id, amount: 400 },
          { rawMaterialId: createdRM[1].id, amount: 200 },
          { rawMaterialId: createdRM[2].id, amount: 7 },
          { rawMaterialId: createdRM[3].id, amount: 5 },
          { rawMaterialId: createdRM[7].id, amount: 15 },
          { rawMaterialId: createdRM[6].id, amount: 1 },
        ],
      },
    },
  });
  console.log('✅ Recipes created');

  // ─── 9. Vehicles ──────────────────────────────────────
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

  // ─── 10. Expenses ─────────────────────────────────────
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

  // ─── 11. Custom Roles ─────────────────────────────────
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
