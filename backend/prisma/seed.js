const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── PERMISSIONS ───
  const permissionNames = [
    'users.view', 'users.create', 'users.update', 'users.delete',
    'products.view', 'products.create', 'products.update', 'products.delete',
    'recipes.view', 'recipes.create', 'recipes.update', 'recipes.delete',
    'raw-materials.view', 'raw-materials.create', 'raw-materials.update', 'raw-materials.delete',
    'production.view', 'production.create', 'production.update', 'production.delete',
    'sales.view', 'sales.create',
    'clients.view', 'clients.create', 'clients.update', 'clients.delete',
    'deliveries.view', 'deliveries.create',
    'drivers.manage',
    'expenses.view', 'expenses.create', 'expenses.update', 'expenses.delete',
    'purchases.view', 'purchases.create',
    'reports.view',
    'settings.manage',
  ];

  for (const name of permissionNames) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name, label: name },
    });
  }
  console.log(`✅ ${permissionNames.length} permissions created`);

  // ─── ROLES ───
  const rolesData = [
    {
      name: 'admin',
      label: 'Администратор',
      permissions: permissionNames, // admin gets all permissions
    },
    {
      name: 'baker',
      label: 'Пекарь',
      permissions: ['production.view', 'production.create', 'production.update', 'production.delete', 'products.view', 'recipes.view'],
    },
    {
      name: 'seller',
      label: 'Продавец',
      permissions: ['sales.view', 'sales.create', 'products.view'],
    },
    {
      name: 'driver',
      label: 'Водитель',
      permissions: ['deliveries.view', 'deliveries.create', 'clients.view'],
    },
    {
      name: 'client',
      label: 'Клиент',
      permissions: [],
    },
  ];

  for (const roleData of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { label: roleData.label },
      create: { name: roleData.name, label: roleData.label },
    });

    // Clear existing permissions and reassign
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    for (const permName of roleData.permissions) {
      const perm = await prisma.permission.findUnique({ where: { name: permName } });
      if (perm) {
        await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: perm.id } });
      }
    }
  }
  console.log(`✅ ${rolesData.length} roles created`);

  // ─── UNITS ───
  const units = [
    { name: 'Штука', shortName: 'шт' },
    { name: 'Килограмм', shortName: 'кг' },
    { name: 'Литр', shortName: 'л' },
    { name: 'Упаковка', shortName: 'уп' },
  ];
  for (const unit of units) {
    await prisma.unit.upsert({
      where: { id: units.indexOf(unit) + 1 },
      update: {},
      create: unit,
    });
  }
  console.log(`✅ ${units.length} units created`);

  // ─── USERS ───
  const passwordHash = await bcrypt.hash('danet1092', 10);
  const passwordHashRoot = await bcrypt.hash('root123', 10);

  const usersData = [
    { email: 'admin@daurennan.kz', name: 'Администратор', password: passwordHash, roleName: 'admin' },
    { email: 'seller@daurennan.kz', name: 'Продавец', password: passwordHashRoot, roleName: 'seller' },
    { email: 'client@daurennan.kz', name: 'Клиент', password: passwordHashRoot, roleName: 'client' },
    { email: 'baker@daurennan.kz', name: 'Пекарь', password: passwordHashRoot, roleName: 'baker' },
    { email: 'driver@daurennan.kz', name: 'Водитель', password: passwordHashRoot, roleName: 'driver' },
  ];

  for (const userData of usersData) {
    let user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { name: userData.name },
      create: {
        email: userData.email,
        passwordHash: userData.password,
        name: userData.name,
      },
    });

    const role = await prisma.role.findUnique({ where: { name: userData.roleName } });
    if (role) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      });
    }
  }
  console.log(`✅ ${usersData.length} users created`);

  // ─── PRODUCT CATEGORIES ───
  const categories = [
    { name: 'Хлеб', sortOrder: 1 },
    { name: 'Булочки', sortOrder: 2 },
    { name: 'Батоны', sortOrder: 3 },
    { name: 'Лепёшки', sortOrder: 4 },
    { name: 'Кондитерские изделия', sortOrder: 5 },
  ];
  const createdCategories = [];
  for (const cat of categories) {
    const c = await prisma.productCategory.upsert({
      where: { id: categories.indexOf(cat) + 1 },
      update: { name: cat.name, sortOrder: cat.sortOrder },
      create: { name: cat.name, sortOrder: cat.sortOrder },
    });
    createdCategories.push(c);
  }
  console.log(`✅ ${categories.length} product categories created`);

  // ─── PRODUCTS ───
  const products = [
    { name: 'Хлеб белый', categoryId: createdCategories[0].id, retailPrice: 250, wholesalePrice: 200 },
    { name: 'Хлеб ржаной', categoryId: createdCategories[0].id, retailPrice: 300, wholesalePrice: 250 },
    { name: 'Батон нарезной', categoryId: createdCategories[2].id, retailPrice: 280, wholesalePrice: 230 },
    { name: 'Булочка с маком', categoryId: createdCategories[1].id, retailPrice: 150, wholesalePrice: 120 },
    { name: 'Лепёшка традиционная', categoryId: createdCategories[3].id, retailPrice: 350, wholesalePrice: 300 },
    { name: 'Круассан', categoryId: createdCategories[4].id, retailPrice: 400, wholesalePrice: 350 },
  ];
  for (const prod of products) {
    await prisma.product.upsert({
      where: { id: products.indexOf(prod) + 1 },
      update: {},
      create: {
        name: prod.name,
        categoryId: prod.categoryId,
        unitId: 1,
        retailPrice: prod.retailPrice,
        wholesalePrice: prod.wholesalePrice,
      },
    });
  }
  console.log(`✅ ${products.length} products created`);

  // ─── RAW MATERIALS ───
  const rawMaterials = [
    { name: 'Мука пшеничная', unit: 'кг', currentStock: 500, minStock: 100, pricePerUnit: 350 },
    { name: 'Дрожжи', unit: 'кг', currentStock: 10, minStock: 2, pricePerUnit: 2500 },
    { name: 'Сахар', unit: 'кг', currentStock: 50, minStock: 10, pricePerUnit: 450 },
    { name: 'Соль', unit: 'кг', currentStock: 30, minStock: 5, pricePerUnit: 150 },
    { name: 'Масло сливочное', unit: 'кг', currentStock: 20, minStock: 5, pricePerUnit: 3000 },
    { name: 'Молоко', unit: 'л', currentStock: 40, minStock: 10, pricePerUnit: 600 },
  ];
  for (const rm of rawMaterials) {
    await prisma.rawMaterial.upsert({
      where: { id: rawMaterials.indexOf(rm) + 1 },
      update: {},
      create: rm,
    });
  }
  console.log(`✅ ${rawMaterials.length} raw materials created`);

  // ─── EXPENSE TYPES ───
  const expenseTypes = ['Аренда', 'Зарплата', 'Коммунальные услуги', 'Топливо', 'Прочее'];
  for (const name of expenseTypes) {
    await prisma.expenseType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ ${expenseTypes.length} expense types created`);

  // ─── CLIENT ───
  const clientUser = await prisma.user.findUnique({ where: { email: 'client@daurennan.kz' } });
  if (clientUser) {
    await prisma.client.upsert({
      where: { userId: clientUser.id },
      update: {},
      create: {
        userId: clientUser.id,
        name: 'Магазин "Алма"',
        type: 'store',
        phone: '+7 777 123 45 67',
        address: 'г. Алматы, ул. Абая 123',
        debtLimit: 100000,
      },
    });
    console.log('✅ 1 demo client created');
  }

  // ─── LOYALTY SETTINGS ───
  await prisma.loyaltySetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      isEnabled: true,
      bonusPercent: 5,
      redeemRate: 1,
      manualBonusEnabled: true,
    },
  });
  console.log('✅ Loyalty settings created');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
