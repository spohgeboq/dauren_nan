require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_daurennan';

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ─── AUTH MIDDLEWARE ──────────────────────────────────────

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Helper to serialize user with roles and permissions
async function serializeUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      },
    },
  });
  if (!user) return null;

  const roles = user.roles.map((ur) => ur.role.name);
  const permissions = [
    ...new Set(
      user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name))
    ),
  ];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    roles,
    permissions,
    has_pin_code: !!user.pinCode,
    is_active: user.isActive,
  };
}

// ─── AUTH ROUTES ──────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Неверный email или пароль' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Неверный email или пароль' });

    const serialized = await serializeUser(user.id);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: serialized });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/auth/pin-login', async (req, res) => {
  const { pin_code } = req.body;
  try {
    const users = await prisma.user.findMany({ where: { pinCode: pin_code, isActive: true } });
    if (!users.length) return res.status(401).json({ errors: { pin_code: ['Неверный ПИН-код'] } });

    const user = users[0];
    const serialized = await serializeUser(user.id);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: serialized });
  } catch (error) {
    console.error('PIN login error:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out' });
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const serialized = await serializeUser(req.user.id);
  if (!serialized) return res.status(404).json({ message: 'User not found' });
  res.json({ data: serialized });
});

app.post('/api/auth/set-pin', authMiddleware, async (req, res) => {
  const { pin_code } = req.body;
  if (!pin_code || pin_code.length !== 4) {
    return res.status(422).json({ message: 'PIN must be 4 digits' });
  }
  await prisma.user.update({ where: { id: req.user.id }, data: { pinCode: pin_code } });
  res.json({ message: 'PIN set successfully', has_pin_code: true });
});

app.post('/api/me/pin', authMiddleware, async (req, res) => {
  const { pin_code } = req.body;
  if (!pin_code || pin_code.length !== 4) {
    return res.status(422).json({ message: 'PIN must be 4 digits' });
  }
  await prisma.user.update({ where: { id: req.user.id }, data: { pinCode: pin_code } });
  res.json({ message: 'PIN set successfully', has_pin_code: true });
});


// ─── PRODUCTS ─────────────────────────────────────────────

app.get('/api/products', authMiddleware, async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true, unit: true },
    orderBy: { name: 'asc' },
  });
  res.json({
    data: products.map((p) => ({
      id: p.id,
      name: p.name,
      category_id: p.categoryId,
      unit_id: p.unitId,
      retail_price: Number(p.retailPrice),
      wholesale_price: Number(p.wholesalePrice),
      image_url: p.imageUrl,
      freshness_days: p.freshnessDays,
      description: p.description,
      is_active: p.isActive,
      category: p.category ? { id: p.category.id, name: p.category.name } : null,
      unit: p.unit ? { id: p.unit.id, name: p.unit.name, short_name: p.unit.shortName } : null,
    })),
  });
});

app.get('/api/catalog/products', async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, imageUrl: true },
    orderBy: { name: 'asc' },
  });
  res.json({ data: products.map((p) => ({ id: p.id, name: p.name, image_url: p.imageUrl })) });
});

app.post('/api/products', authMiddleware, upload.single('image'), async (req, res) => {
  const { name, category_id, unit_id, retail_price, wholesale_price, freshness_days, description, is_active } = req.body;
  const product = await prisma.product.create({
    data: {
      name,
      categoryId: parseInt(category_id),
      unitId: parseInt(unit_id || 1),
      retailPrice: parseFloat(retail_price || 0),
      wholesalePrice: parseFloat(wholesale_price || 0),
      freshnessDays: parseInt(freshness_days || 1),
      description: description || null,
      isActive: is_active !== 'false',
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    },
    include: { category: true, unit: true },
  });
  res.status(201).json({ data: product });
});

app.post('/api/products/:id', authMiddleware, upload.single('image'), async (req, res) => {
  const { name, category_id, unit_id, retail_price, wholesale_price, freshness_days, description, is_active } = req.body;
  const data = {
    name,
    categoryId: parseInt(category_id),
    unitId: parseInt(unit_id || 1),
    retailPrice: parseFloat(retail_price || 0),
    wholesalePrice: parseFloat(wholesale_price || 0),
    freshnessDays: parseInt(freshness_days || 1),
    description: description || null,
    isActive: is_active !== 'false',
  };
  if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
  const product = await prisma.product.update({
    where: { id: parseInt(req.params.id) },
    data,
    include: { category: true, unit: true },
  });
  res.json({ data: product });
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// ─── PRODUCT CATEGORIES ──────────────────────────────────

app.get('/api/product-categories', authMiddleware, async (req, res) => {
  const categories = await prisma.productCategory.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json({ data: categories.map((c) => ({ id: c.id, name: c.name, sort_order: c.sortOrder })) });
});

app.post('/api/product-categories', authMiddleware, async (req, res) => {
  const cat = await prisma.productCategory.create({ data: { name: req.body.name, sortOrder: req.body.sort_order || 0 } });
  res.status(201).json({ data: cat });
});

app.put('/api/product-categories/:id', authMiddleware, async (req, res) => {
  const cat = await prisma.productCategory.update({
    where: { id: parseInt(req.params.id) },
    data: { name: req.body.name, sortOrder: req.body.sort_order || 0 },
  });
  res.json({ data: cat });
});

app.delete('/api/product-categories/:id', authMiddleware, async (req, res) => {
  await prisma.productCategory.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// ─── UNITS ────────────────────────────────────────────────

app.get('/api/units', authMiddleware, async (req, res) => {
  const units = await prisma.unit.findMany();
  res.json({ data: units.map((u) => ({ id: u.id, name: u.name, short_name: u.shortName })) });
});

// ─── RAW MATERIALS ────────────────────────────────────────

app.get('/api/raw-materials', authMiddleware, async (req, res) => {
  const materials = await prisma.rawMaterial.findMany({ orderBy: { name: 'asc' } });
  res.json({
    data: materials.map((m) => ({
      id: m.id,
      name: m.name,
      unit: m.unit,
      current_stock: Number(m.currentStock),
      min_stock: Number(m.minStock),
      price_per_unit: Number(m.pricePerUnit),
    })),
  });
});

app.post('/api/raw-materials', authMiddleware, async (req, res) => {
  const m = await prisma.rawMaterial.create({
    data: {
      name: req.body.name,
      unit: req.body.unit || 'кг',
      currentStock: req.body.current_stock || 0,
      minStock: req.body.min_stock || 0,
      pricePerUnit: req.body.price_per_unit || 0,
    },
  });
  res.status(201).json({ data: m });
});

app.put('/api/raw-materials/:id', authMiddleware, async (req, res) => {
  const m = await prisma.rawMaterial.update({
    where: { id: parseInt(req.params.id) },
    data: {
      name: req.body.name,
      unit: req.body.unit,
      currentStock: req.body.current_stock,
      minStock: req.body.min_stock,
      pricePerUnit: req.body.price_per_unit,
    },
  });
  res.json({ data: m });
});

app.delete('/api/raw-materials/:id', authMiddleware, async (req, res) => {
  await prisma.rawMaterial.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// ─── RECIPES ──────────────────────────────────────────────

app.get('/api/recipes', authMiddleware, async (req, res) => {
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: {
        include: { rawMaterial: true, product: true },
      },
    },
    orderBy: { name: 'asc' },
  });
  res.json({
    data: recipes.map((r) => ({
      id: r.id,
      name: r.name,
      output_qty: Number(r.outputQty),
      notes: r.notes,
      ingredients: r.ingredients.map((ing) => ({
        id: ing.id,
        raw_material_id: ing.rawMaterialId,
        product_id: ing.productId,
        quantity: Number(ing.quantity),
        raw_material: ing.rawMaterial
          ? { id: ing.rawMaterial.id, name: ing.rawMaterial.name, unit: ing.rawMaterial.unit }
          : null,
        product: ing.product ? { id: ing.product.id, name: ing.product.name } : null,
      })),
    })),
  });
});

app.post('/api/recipes', authMiddleware, async (req, res) => {
  const { name, output_qty, notes, ingredients } = req.body;
  const recipe = await prisma.recipe.create({
    data: {
      name,
      outputQty: output_qty || 1,
      notes,
      ingredients: {
        create: (ingredients || []).map((i) => ({
          rawMaterialId: i.raw_material_id || null,
          productId: i.product_id || null,
          quantity: i.quantity,
        })),
      },
    },
    include: { ingredients: { include: { rawMaterial: true, product: true } } },
  });
  res.status(201).json({ data: recipe });
});

app.put('/api/recipes/:id', authMiddleware, async (req, res) => {
  const { name, output_qty, notes, ingredients } = req.body;
  const id = parseInt(req.params.id);
  await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      name,
      outputQty: output_qty || 1,
      notes,
      ingredients: {
        create: (ingredients || []).map((i) => ({
          rawMaterialId: i.raw_material_id || null,
          productId: i.product_id || null,
          quantity: i.quantity,
        })),
      },
    },
    include: { ingredients: { include: { rawMaterial: true, product: true } } },
  });
  res.json({ data: recipe });
});

app.delete('/api/recipes/:id', authMiddleware, async (req, res) => {
  await prisma.recipe.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// ─── PRODUCTION ───────────────────────────────────────────

app.get('/api/productions', authMiddleware, async (req, res) => {
  const { date, status } = req.query;
  const where = {};
  if (date) where.date = new Date(date);
  if (status) where.status = status;

  const productions = await prisma.production.findMany({
    where,
    include: {
      baker: { select: { id: true, name: true } },
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({
    data: productions.map((p) => ({
      id: p.id,
      baker_id: p.bakerId,
      baker: p.baker,
      date: p.date,
      status: p.status,
      notes: p.notes,
      items: p.items.map((i) => ({
        id: i.id,
        product_id: i.productId,
        product: i.product ? { id: i.product.id, name: i.product.name } : null,
        quantity: Number(i.quantity),
      })),
    })),
  });
});

app.post('/api/productions', authMiddleware, async (req, res) => {
  const { date, notes, items } = req.body;
  const production = await prisma.production.create({
    data: {
      bakerId: req.user.id,
      date: date ? new Date(date) : new Date(),
      notes,
      items: {
        create: (items || []).map((i) => ({
          productId: i.product_id,
          quantity: i.quantity,
        })),
      },
    },
    include: { baker: { select: { id: true, name: true } }, items: { include: { product: true } } },
  });
  res.status(201).json({ data: production });
});

app.put('/api/productions/:id', authMiddleware, async (req, res) => {
  const { status, notes, items } = req.body;
  const id = parseInt(req.params.id);
  const data = {};
  if (status) data.status = status;
  if (notes !== undefined) data.notes = notes;

  if (items) {
    await prisma.productionItem.deleteMany({ where: { productionId: id } });
    data.items = { create: items.map((i) => ({ productId: i.product_id, quantity: i.quantity })) };
  }

  const production = await prisma.production.update({
    where: { id },
    data,
    include: { baker: { select: { id: true, name: true } }, items: { include: { product: true } } },
  });
  res.json({ data: production });
});

app.delete('/api/productions/:id', authMiddleware, async (req, res) => {
  await prisma.production.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// ─── CLIENTS ──────────────────────────────────────────────

app.get('/api/clients', authMiddleware, async (req, res) => {
  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });
  res.json({
    data: clients.map((c) => ({
      id: c.id,
      user_id: c.userId,
      name: c.name,
      type: c.type,
      type_label: { store: 'Магазин', organization: 'Организация', regular: 'Обычный', retail: 'Розница' }[c.type] || c.type,
      phone: c.phone,
      address: c.address,
      contact_person: c.contactPerson,
      assigned_driver_id: c.assignedDriverId,
      debt_limit: Number(c.debtLimit),
      current_debt: Number(c.currentDebt),
      loyalty_bonus_balance: Number(c.loyaltyBonusBalance),
      is_active: c.isActive,
    })),
  });
});

app.post('/api/clients', authMiddleware, async (req, res) => {
  const client = await prisma.client.create({
    data: {
      name: req.body.name,
      type: req.body.type || 'store',
      phone: req.body.phone,
      address: req.body.address,
      contactPerson: req.body.contact_person,
      assignedDriverId: req.body.assigned_driver_id || null,
      debtLimit: req.body.debt_limit || 0,
      isActive: req.body.is_active !== false,
    },
  });
  res.status(201).json({ data: client });
});

app.put('/api/clients/:id', authMiddleware, async (req, res) => {
  const client = await prisma.client.update({
    where: { id: parseInt(req.params.id) },
    data: {
      name: req.body.name,
      type: req.body.type,
      phone: req.body.phone,
      address: req.body.address,
      contactPerson: req.body.contact_person,
      assignedDriverId: req.body.assigned_driver_id,
      debtLimit: req.body.debt_limit,
      isActive: req.body.is_active,
    },
  });
  res.json({ data: client });
});

app.delete('/api/clients/:id', authMiddleware, async (req, res) => {
  await prisma.client.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

app.post('/api/clients/:id/pay-debt', authMiddleware, async (req, res) => {
  const clientId = parseInt(req.params.id);
  const { amount, payment_method, comment } = req.body;

  const payment = await prisma.clientPayment.create({
    data: {
      clientId,
      receivedById: req.user.id,
      amount: parseFloat(amount),
      paymentMethod: payment_method,
      comment,
    },
  });

  const client = await prisma.client.update({
    where: { id: clientId },
    data: { currentDebt: { decrement: parseFloat(amount) } },
  });

  res.json({ message: 'Payment recorded', client, payment });
});

// ─── CLIENT REGISTRATION REQUESTS ─────────────────────────

app.post('/api/client-registration-requests', async (req, res) => {
  const request = await prisma.clientRegistrationRequest.create({
    data: {
      name: req.body.name,
      type: req.body.type || 'store',
      phone: req.body.phone,
      email: req.body.email || null,
      address: req.body.address,
      contactPerson: req.body.contact_person || null,
      preferredDeliveryTime: req.body.preferred_delivery_time || null,
      comment: req.body.comment || null,
    },
  });
  res.status(201).json({ data: request });
});

app.get('/api/client-registration-requests', authMiddleware, async (req, res) => {
  const requests = await prisma.clientRegistrationRequest.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ data: requests });
});

// ─── CLIENT PORTAL ────────────────────────────────────────

app.get('/api/client-portal/profile', authMiddleware, async (req, res) => {
  const client = await prisma.client.findUnique({ where: { userId: req.user.id } });
  if (!client) return res.status(404).json({ message: 'Client profile not found' });
  res.json({ data: { id: client.id, name: client.name, phone: client.phone, address: client.address } });
});

app.get('/api/client-portal/orders', authMiddleware, async (req, res) => {
  const client = await prisma.client.findUnique({ where: { userId: req.user.id } });
  if (!client) return res.status(404).json({ message: 'Not a client' });

  const orders = await prisma.clientOrder.findMany({
    where: { clientId: client.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: orders });
});

// ─── USERS (ADMIN) ────────────────────────────────────────

app.get('/api/users', authMiddleware, async (req, res) => {
  const users = await prisma.user.findMany({
    include: { roles: { include: { role: true } } },
    orderBy: { name: 'asc' },
  });
  res.json({
    data: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      is_active: u.isActive,
      roles: u.roles.map((ur) => ur.role.name),
      has_pin_code: !!u.pinCode,
    })),
  });
});

app.post('/api/users', authMiddleware, async (req, res) => {
  const { email, password, name, phone, roles } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      name,
      phone,
      roles: {
        create: (roles || []).map((roleName) => ({
          role: { connect: { name: roleName } },
        })),
      },
    },
    include: { roles: { include: { role: true } } },
  });
  res.status(201).json({ data: { ...user, roles: user.roles.map((ur) => ur.role.name) } });
});

app.put('/api/users/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  const { email, password, name, phone, roles, is_active } = req.body;
  const data = { email, name, phone };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  if (is_active !== undefined) data.isActive = is_active;

  if (roles) {
    await prisma.userRole.deleteMany({ where: { userId: id } });
    for (const roleName of roles) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (role) await prisma.userRole.create({ data: { userId: id, roleId: role.id } });
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    include: { roles: { include: { role: true } } },
  });
  res.json({ data: { ...user, roles: user.roles.map((ur) => ur.role.name) } });
});

app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// ─── ROLES (ADMIN) ────────────────────────────────────────

app.get('/api/roles', authMiddleware, async (req, res) => {
  const roles = await prisma.role.findMany({
    include: { permissions: { include: { permission: true } } },
    orderBy: { name: 'asc' },
  });
  res.json({
    data: roles.map((r) => ({
      id: r.id,
      name: r.name,
      label: r.label,
      permissions: r.permissions.map((rp) => rp.permission.name),
    })),
  });
});

app.post('/api/roles', authMiddleware, async (req, res) => {
  const { name, label, permissions } = req.body;
  const role = await prisma.role.create({
    data: {
      name,
      label,
      permissions: {
        create: (permissions || []).map((permName) => ({
          permission: { connect: { name: permName } },
        })),
      },
    },
    include: { permissions: { include: { permission: true } } },
  });
  res.status(201).json({ data: role });
});

app.put('/api/roles/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, label, permissions } = req.body;
  await prisma.rolePermission.deleteMany({ where: { roleId: id } });
  const role = await prisma.role.update({
    where: { id },
    data: {
      name,
      label,
      permissions: {
        create: (permissions || []).map((permName) => ({
          permission: { connect: { name: permName } },
        })),
      },
    },
    include: { permissions: { include: { permission: true } } },
  });
  res.json({ data: role });
});

app.get('/api/permissions', authMiddleware, async (req, res) => {
  const perms = await prisma.permission.findMany({ orderBy: { name: 'asc' } });
  res.json({ data: perms });
});

// ─── EXPENSES ─────────────────────────────────────────────

app.get('/api/expenses', authMiddleware, async (req, res) => {
  const { date_from, date_to, expense_type_id } = req.query;
  const where = {};
  if (date_from) where.date = { ...(where.date || {}), gte: new Date(date_from) };
  if (date_to) where.date = { ...(where.date || {}), lte: new Date(date_to) };
  if (expense_type_id) where.expenseTypeId = parseInt(expense_type_id);

  const expenses = await prisma.expense.findMany({
    where,
    include: { expenseType: true, vehicle: true, createdBy: { select: { id: true, name: true } } },
    orderBy: { date: 'desc' },
  });
  res.json({
    data: expenses.map((e) => ({
      id: e.id,
      expense_type_id: e.expenseTypeId,
      expense_type: e.expenseType,
      amount: Number(e.amount),
      description: e.description,
      date: e.date,
      vehicle_id: e.vehicleId,
      vehicle: e.vehicle,
      created_by: e.createdBy,
    })),
  });
});

app.post('/api/expenses', authMiddleware, async (req, res) => {
  const expense = await prisma.expense.create({
    data: {
      expenseTypeId: req.body.expense_type_id,
      amount: req.body.amount,
      description: req.body.description,
      date: new Date(req.body.date),
      vehicleId: req.body.vehicle_id || null,
      createdById: req.user.id,
    },
  });
  res.status(201).json({ data: expense });
});

app.put('/api/expenses/:id', authMiddleware, async (req, res) => {
  const expense = await prisma.expense.update({
    where: { id: parseInt(req.params.id) },
    data: {
      expenseTypeId: req.body.expense_type_id,
      amount: req.body.amount,
      description: req.body.description,
      date: req.body.date ? new Date(req.body.date) : undefined,
      vehicleId: req.body.vehicle_id,
    },
  });
  res.json({ data: expense });
});

app.delete('/api/expenses/:id', authMiddleware, async (req, res) => {
  await prisma.expense.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// ─── EXPENSE TYPES ────────────────────────────────────────

app.get('/api/expense-types', authMiddleware, async (req, res) => {
  const types = await prisma.expenseType.findMany({ orderBy: { name: 'asc' } });
  res.json({ data: types });
});

app.post('/api/expense-types', authMiddleware, async (req, res) => {
  const type = await prisma.expenseType.create({ data: { name: req.body.name } });
  res.status(201).json({ data: type });
});

app.put('/api/expense-types/:id', authMiddleware, async (req, res) => {
  const type = await prisma.expenseType.update({ where: { id: parseInt(req.params.id) }, data: { name: req.body.name } });
  res.json({ data: type });
});

app.delete('/api/expense-types/:id', authMiddleware, async (req, res) => {
  await prisma.expenseType.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// ─── VEHICLES ─────────────────────────────────────────────

app.get('/api/vehicles', authMiddleware, async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { name: 'asc' } });
  res.json({ data: vehicles.map((v) => ({ id: v.id, name: v.name, license_plate: v.licensePlate })) });
});

app.post('/api/vehicles', authMiddleware, async (req, res) => {
  const v = await prisma.vehicle.create({ data: { name: req.body.name, licensePlate: req.body.license_plate } });
  res.status(201).json({ data: v });
});

app.put('/api/vehicles/:id', authMiddleware, async (req, res) => {
  const v = await prisma.vehicle.update({
    where: { id: parseInt(req.params.id) },
    data: { name: req.body.name, licensePlate: req.body.license_plate },
  });
  res.json({ data: v });
});

app.delete('/api/vehicles/:id', authMiddleware, async (req, res) => {
  await prisma.vehicle.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// ─── PURCHASES ────────────────────────────────────────────

app.get('/api/purchases', authMiddleware, async (req, res) => {
  const purchases = await prisma.purchase.findMany({
    include: {
      createdBy: { select: { id: true, name: true } },
      items: { include: { rawMaterial: true } },
    },
    orderBy: { date: 'desc' },
  });
  res.json({
    data: purchases.map((p) => ({
      id: p.id,
      supplier: p.supplier,
      date: p.date,
      total_amount: Number(p.totalAmount),
      notes: p.notes,
      created_by: p.createdBy,
      items: p.items.map((i) => ({
        id: i.id,
        raw_material_id: i.rawMaterialId,
        raw_material: i.rawMaterial ? { id: i.rawMaterial.id, name: i.rawMaterial.name, unit: i.rawMaterial.unit } : null,
        quantity: Number(i.quantity),
        price_per_unit: Number(i.pricePerUnit),
        total: Number(i.total),
      })),
    })),
  });
});

app.post('/api/purchases', authMiddleware, async (req, res) => {
  const { supplier, date, notes, items } = req.body;
  const totalAmount = (items || []).reduce((s, i) => s + (i.quantity * i.price_per_unit), 0);

  const purchase = await prisma.purchase.create({
    data: {
      supplier,
      date: new Date(date),
      totalAmount,
      notes,
      createdById: req.user.id,
      items: {
        create: (items || []).map((i) => ({
          rawMaterialId: i.raw_material_id,
          quantity: i.quantity,
          pricePerUnit: i.price_per_unit,
          total: i.quantity * i.price_per_unit,
        })),
      },
    },
    include: { items: { include: { rawMaterial: true } } },
  });

  // Update raw material stock
  for (const item of items || []) {
    await prisma.rawMaterial.update({
      where: { id: item.raw_material_id },
      data: { currentStock: { increment: item.quantity } },
    });
  }

  res.status(201).json({ data: purchase });
});

// ─── RETAIL SALES (POS) ──────────────────────────────────

app.get('/api/retail-sales', authMiddleware, async (req, res) => {
  const { date_from, date_to } = req.query;
  const where = {};
  if (date_from) where.createdAt = { ...(where.createdAt || {}), gte: new Date(date_from) };
  if (date_to) where.createdAt = { ...(where.createdAt || {}), lte: new Date(date_to + 'T23:59:59') };

  const sales = await prisma.retailSale.findMany({
    where,
    include: {
      items: { include: { product: true } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({
    data: sales.map((s) => ({
      id: s.id,
      seller_id: s.sellerId,
      seller_shift_id: s.sellerShiftId,
      total_amount: Number(s.totalAmount),
      status: s.status,
      created_at: s.createdAt,
      items: s.items.map((i) => ({
        id: i.id,
        product_id: i.productId,
        product: i.product ? { id: i.product.id, name: i.product.name, retail_price: Number(i.product.retailPrice) } : null,
        quantity: Number(i.quantity),
        price: Number(i.price),
        subtotal: Number(i.subtotal),
      })),
      payments: s.payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        payment_method: p.paymentMethod,
        status: p.status,
      })),
    })),
  });
});

app.post('/api/retail-sales', authMiddleware, async (req, res) => {
  const { items, payment_method, payment_details } = req.body;

  // Calculate totals
  let totalAmount = 0;
  const itemsData = [];
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.product_id } });
    if (!product) continue;
    const price = Number(product.retailPrice);
    const subtotal = price * item.quantity;
    totalAmount += subtotal;
    itemsData.push({
      productId: item.product_id,
      quantity: item.quantity,
      price,
      subtotal,
    });
  }

  const sale = await prisma.retailSale.create({
    data: {
      sellerId: req.user.id,
      totalAmount,
      items: { create: itemsData },
      payments: {
        create: [{
          amount: totalAmount,
          paymentMethod: payment_method,
        }],
      },
    },
    include: { items: true, payments: true },
  });

  res.status(201).json({ data: sale });
});

// ─── SELLER SHIFTS ────────────────────────────────────────

app.get('/api/seller-shifts/current', authMiddleware, async (req, res) => {
  const shift = await prisma.sellerShift.findFirst({
    where: { sellerId: req.user.id, status: 'open' },
    include: { stocks: { include: { product: true } } },
    orderBy: { startedAt: 'desc' },
  });
  res.json({ data: shift });
});

app.post('/api/seller-shifts/open', authMiddleware, async (req, res) => {
  const shift = await prisma.sellerShift.create({
    data: { sellerId: req.user.id },
  });
  res.status(201).json({ data: shift });
});

app.post('/api/seller-shifts/close', authMiddleware, async (req, res) => {
  const shift = await prisma.sellerShift.findFirst({
    where: { sellerId: req.user.id, status: 'open' },
    orderBy: { startedAt: 'desc' },
  });
  if (!shift) return res.status(404).json({ message: 'No open shift' });

  const updated = await prisma.sellerShift.update({
    where: { id: shift.id },
    data: { status: 'closed', endedAt: new Date() },
  });
  res.json({ data: updated });
});

// ─── SELLER SHIFT STOCKS ─────────────────────────────────

app.get('/api/seller-shift-stocks/current', authMiddleware, async (req, res) => {
  const shift = await prisma.sellerShift.findFirst({
    where: { sellerId: req.user.id, status: 'open' },
    orderBy: { startedAt: 'desc' },
  });
  if (!shift) return res.json({ data: [] });

  const stocks = await prisma.sellerShiftStock.findMany({
    where: { sellerShiftId: shift.id },
    include: { product: true },
  });
  res.json({
    data: stocks.map((s) => ({
      id: s.id,
      seller_shift_id: s.sellerShiftId,
      product_id: s.productId,
      product: s.product ? { id: s.product.id, name: s.product.name } : null,
      quantity: Number(s.quantity),
    })),
  });
});

// ─── DELIVERY ROUTES ──────────────────────────────────────

app.get('/api/delivery-routes', authMiddleware, async (req, res) => {
  const { date } = req.query;
  const where = {};
  if (date) where.date = new Date(date);

  const routes = await prisma.deliveryRoute.findMany({
    where,
    include: {
      driver: { select: { id: true, name: true } },
      deliveries: {
        include: { client: true },
      },
    },
    orderBy: { date: 'desc' },
  });
  res.json({ data: routes });
});

app.post('/api/delivery-routes', authMiddleware, async (req, res) => {
  const route = await prisma.deliveryRoute.create({
    data: {
      driverId: req.body.driver_id,
      date: new Date(req.body.date),
    },
    include: { driver: { select: { id: true, name: true } } },
  });
  res.status(201).json({ data: route });
});

// ─── DELIVERIES ───────────────────────────────────────────

app.get('/api/deliveries', authMiddleware, async (req, res) => {
  const deliveries = await prisma.delivery.findMany({
    include: {
      client: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: deliveries });
});

app.post('/api/deliveries', authMiddleware, async (req, res) => {
  const { route_id, client_id, items, notes } = req.body;
  let totalAmount = 0;

  const itemsData = [];
  for (const item of items || []) {
    const product = await prisma.product.findUnique({ where: { id: item.product_id } });
    const price = product ? Number(product.wholesalePrice) : 0;
    totalAmount += price * item.quantity;
    itemsData.push({
      productId: item.product_id,
      quantity: item.quantity,
      price,
    });
  }

  const delivery = await prisma.delivery.create({
    data: {
      routeId: route_id,
      clientId: client_id,
      driverId: req.user.id,
      totalAmount,
      notes,
      items: { create: itemsData },
    },
    include: { items: { include: { product: true } }, client: true },
  });
  res.status(201).json({ data: delivery });
});

// ─── CLIENT ORDERS (ADMIN) ───────────────────────────────

app.get('/api/client-orders', authMiddleware, async (req, res) => {
  const orders = await prisma.clientOrder.findMany({
    include: {
      client: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: orders });
});

// ─── CLIENT DRIVER TRANSFERS ──────────────────────────────

app.get('/api/client-driver-transfers', authMiddleware, async (req, res) => {
  const where = {};
  if (req.query.client_id) where.clientId = parseInt(req.query.client_id);

  const transfers = await prisma.clientDriverTransfer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: transfers });
});

app.post('/api/client-driver-transfers', authMiddleware, async (req, res) => {
  const { client_id, new_driver_id, date_from, date_to, reason } = req.body;
  const client = await prisma.client.findUnique({ where: { id: client_id } });

  const transfer = await prisma.clientDriverTransfer.create({
    data: {
      clientId: client_id,
      oldDriverId: client?.assignedDriverId || null,
      newDriverId: new_driver_id,
      dateFrom: new Date(date_from),
      dateTo: date_to ? new Date(date_to) : null,
      reason,
      approvedBy: req.user.id,
    },
  });

  const updatedClient = await prisma.client.update({
    where: { id: client_id },
    data: { assignedDriverId: new_driver_id },
  });

  res.status(201).json({ data: transfer, client: updatedClient, message: 'Transfer completed' });
});

// ─── LOYALTY ──────────────────────────────────────────────

app.get('/api/loyalty/settings', authMiddleware, async (req, res) => {
  let settings = await prisma.loyaltySetting.findFirst();
  if (!settings) {
    settings = await prisma.loyaltySetting.create({ data: {} });
  }
  res.json({
    data: {
      id: settings.id,
      is_enabled: settings.isEnabled,
      bonus_percent: Number(settings.bonusPercent),
      redeem_rate: Number(settings.redeemRate),
      max_bonus_per_order: settings.maxBonusPerOrder ? Number(settings.maxBonusPerOrder) : null,
      manual_bonus_enabled: settings.manualBonusEnabled,
    },
  });
});

app.put('/api/loyalty/settings', authMiddleware, async (req, res) => {
  let settings = await prisma.loyaltySetting.findFirst();
  if (!settings) settings = await prisma.loyaltySetting.create({ data: {} });

  const updated = await prisma.loyaltySetting.update({
    where: { id: settings.id },
    data: {
      isEnabled: req.body.is_enabled,
      bonusPercent: req.body.bonus_percent,
      redeemRate: req.body.redeem_rate,
      maxBonusPerOrder: req.body.max_bonus_per_order,
      manualBonusEnabled: req.body.manual_bonus_enabled,
    },
  });
  res.json({ data: updated });
});

// ─── REPORTS ──────────────────────────────────────────────

app.get('/api/reports/summary', authMiddleware, async (req, res) => {
  const { date_from, date_to } = req.query;
  // Simplified summary report
  const salesWhere = {};
  if (date_from) salesWhere.createdAt = { gte: new Date(date_from) };
  if (date_to) salesWhere.createdAt = { ...(salesWhere.createdAt || {}), lte: new Date(date_to + 'T23:59:59') };

  const sales = await prisma.retailSale.aggregate({ where: salesWhere, _sum: { totalAmount: true }, _count: true });
  const expenses = await prisma.expense.aggregate({
    where: {
      date: {
        ...(date_from ? { gte: new Date(date_from) } : {}),
        ...(date_to ? { lte: new Date(date_to) } : {}),
      },
    },
    _sum: { amount: true },
  });

  res.json({
    data: {
      total_sales: Number(sales._sum.totalAmount || 0),
      sales_count: sales._count,
      total_expenses: Number(expenses._sum.amount || 0),
      profit: Number(sales._sum.totalAmount || 0) - Number(expenses._sum.amount || 0),
    },
  });
});

app.get('/api/reports/employees', authMiddleware, async (req, res) => {
  const users = await prisma.user.findMany({
    include: { roles: { include: { role: true } } },
  });
  res.json({
    data: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roles: u.roles.map((ur) => ur.role.name),
    })),
  });
});

app.get('/api/reports/clients', authMiddleware, async (req, res) => {
  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });
  res.json({
    data: clients.map((c) => ({
      id: c.id,
      name: c.name,
      current_debt: Number(c.currentDebt),
      type: c.type,
    })),
  });
});

// ─── DRIVER ROUTES ────────────────────────────────────────

app.get('/api/driver/route', authMiddleware, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const route = await prisma.deliveryRoute.findFirst({
    where: {
      driverId: req.user.id,
      date: today,
    },
    include: {
      deliveries: {
        include: { client: true, items: { include: { product: true } } },
      },
    },
  });

  res.json({ data: route });
});

app.get('/api/driver/returns', authMiddleware, async (req, res) => {
  const deliveries = await prisma.delivery.findMany({
    where: {
      driverId: req.user.id,
      returnAmount: { gt: 0 },
    },
    include: {
      client: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: deliveries });
});

// ─── START SERVER ─────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
