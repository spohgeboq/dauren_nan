require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_daurennan';

// Middleware
app.use(cors());
app.use(express.json());

// Роут для авторизации
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ищем пользователя по email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Генерируем токен
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    // Отправляем успешный ответ
    res.json({
      message: 'Успешный вход',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});// --- API ПЕКАРЯ ---

// 1. Дашборд пекаря (продукты, сырье, активные партии)
app.get('/api/baker/dashboard', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { recipe: true }
    });
    const rawMaterials = await prisma.rawMaterial.findMany();
    const activeBatches = await prisma.productionBatch.findMany({
      where: { status: 'IN_PROGRESS' },
      include: { product: true },
      orderBy: { startTime: 'desc' }
    });
    
    res.json({ products, rawMaterials, activeBatches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 2. Начать партию (Списание сырья)
app.post('/api/baker/batch/start', async (req, res) => {
  const { productId, quantity, bakerId } = req.body;
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { recipe: { include: { ingredients: true } } }
    });

    if (!product) return res.status(404).json({ error: 'Продукт не найден' });

    // Списание сырья в транзакции
    await prisma.$transaction(async (tx) => {
      // Создаем партию
      await tx.productionBatch.create({
        data: {
          productId,
          quantity,
          bakerId,
          status: 'IN_PROGRESS'
        }
      });

      // Если есть рецепт, списываем сырье
      if (product.recipe) {
        for (const ing of product.recipe.ingredients) {
          const totalNeeded = ing.quantity * quantity;
          await tx.rawMaterial.update({
            where: { id: ing.rawMaterialId },
            data: { stock: { decrement: totalNeeded } }
          });
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при старте партии' });
  }
});

// 3. Завершить партию
app.post('/api/baker/batch/finish', async (req, res) => {
  const { batchId } = req.body;
  try {
    const batch = await prisma.productionBatch.findUnique({ where: { id: batchId } });
    if (!batch || batch.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Партия не найдена или уже завершена' });
    }

    await prisma.$transaction([
      prisma.productionBatch.update({
        where: { id: batchId },
        data: { status: 'COMPLETED', endTime: new Date() }
      }),
      prisma.product.update({
        where: { id: batch.productId },
        data: { stock: { increment: batch.quantity } }
      })
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при завершении партии' });
  }
});

// 4. Зафиксировать брак
app.post('/api/baker/defect', async (req, res) => {
  const { productId, quantity, reason, bakerId } = req.body;
  try {
    const defect = await prisma.defectLog.create({
      data: { productId, quantity, reason, bakerId }
    });
    res.json({ success: true, defect });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка фиксации брака' });
  }
});

// --- КОНЕЦ API ПЕКАРЯ ---
// --- API КАССИРА ---

// Получить товары для POS
app.get('/api/cashier/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' }
    });
    res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Провести продажу
app.post('/api/cashier/sell', async (req, res) => {
  const { cart, paymentMethod, cashierId } = req.body;
  // cart: array of { productId, quantity, price }
  try {
    let totalAmount = 0;
    
    // Считаем сумму и подготавливаем items
    const saleItems = cart.map((item) => {
      totalAmount += item.price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      };
    });

    await prisma.$transaction(async (tx) => {
      // 1. Создаем продажу
      const sale = await tx.sale.create({
        data: {
          totalAmount,
          paymentMethod,
          cashierId,
          items: {
            create: saleItems
          }
        }
      });

      // 2. Списываем остатки с витрины
      for (const item of saleItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    });

    res.json({ success: true, totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при проведении продажи' });
  }
});

// --- КОНЕЦ API КАССИРА ---
// --- API КУРЬЕРА ---

// Получить активные заказы курьера
app.get('/api/courier/orders', async (req, res) => {
  const { driverId } = req.query;
  if (!driverId) return res.status(400).json({ error: 'driverId required' });
  
  try {
    const orders = await prisma.deliveryOrder.findMany({
      where: {
        driverId: parseInt(driverId),
        status: { in: ['PENDING', 'IN_TRANSIT'] }
      },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить статус заказа (Доставлено / Отменено)
app.post('/api/courier/order/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, paymentMethod } = req.body; // status: "DELIVERED" or "CANCELLED"
  
  try {
    const order = await prisma.deliveryOrder.findUnique({ where: { id: parseInt(id) } });
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });

    await prisma.deliveryOrder.update({
      where: { id: parseInt(id) },
      data: {
        status,
        paymentMethod: paymentMethod || order.paymentMethod,
        isPaid: status === 'DELIVERED' ? true : order.isPaid
      }
    });
    
    // Если заказ был отменен, возможно нужно вернуть товары на склад (пока не реализуем сложную логику)
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
});

// --- КОНЕЦ API КУРЬЕРА ---

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
