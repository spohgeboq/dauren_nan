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

  // ─── 4. Custom Roles and Permissions ───────────────────
  console.log('🌱 Seeding Custom Roles and Permissions...');
  const modulesList = ['pos', 'clients', 'orders', 'routes', 'production', 'inventory', 'purchases', 'employees', 'roles'];

  await prisma.customRole.create({
    data: {
      name: 'ADMIN',
      description: 'Главный Администратор',
      permissions: {
        create: modulesList.map(m => ({
          module: m,
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true
        }))
      }
    }
  });

  await prisma.customRole.create({
    data: {
      name: 'BAKER',
      description: 'Пекарь',
      permissions: {
        create: modulesList.map(m => ({
          module: m,
          canView: m === 'production' || m === 'inventory',
          canCreate: m === 'production',
          canEdit: m === 'production',
          canDelete: false
        }))
      }
    }
  });

  await prisma.customRole.create({
    data: {
      name: 'DRIVER',
      description: 'Водитель / Курьер',
      permissions: {
        create: modulesList.map(m => ({
          module: m,
          canView: m === 'routes',
          canCreate: false,
          canEdit: false,
          canDelete: false
        }))
      }
    }
  });

  await prisma.customRole.create({
    data: {
      name: 'CASHIER',
      description: 'Кассир',
      permissions: {
        create: modulesList.map(m => ({
          module: m,
          canView: m === 'pos' || m === 'clients',
          canCreate: m === 'pos' || m === 'clients',
          canEdit: m === 'pos' || m === 'clients',
          canDelete: false
        }))
      }
    }
  });
  console.log('✅ Custom Roles and Permissions seeded');

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
