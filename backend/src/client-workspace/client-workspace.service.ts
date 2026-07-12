import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientWorkspaceService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });
    
    if (!user || !user.client) {
      throw new NotFoundException('Магазин не найден для данного пользователя');
    }

    const pastOrders = await this.prisma.deliveryOrder.findMany({
      where: { clientId: user.client.id },
      select: { address: true },
      distinct: ['address'],
    });
    const savedAddresses = pastOrders.map(o => o.address).filter(a => a && a !== 'Не указан');
    // If the main route is not in saved addresses, add it
    if (user.client.route && !savedAddresses.includes(user.client.route)) {
      savedAddresses.unshift(user.client.route);
    }

    return {
      name: user.client.name,
      address: user.client.route || 'Адрес не указан',
      savedAddresses,
      balance: user.client.balance,
      debt: user.client.balance,
      phone: user.client.phone,
    };
  }

  async getProducts() {
    // Only get active products
    return this.prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getActiveOrder(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.clientId) throw new NotFoundException('Магазин не найден');

    const activeOrder = await this.prisma.deliveryOrder.findFirst({
      where: {
        clientId: user.clientId,
        status: { in: ['PENDING', 'IN_TRANSIT'] },
      },
      include: {
        driver: {
          select: { name: true, phone: true },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return activeOrder;
  }

  async getLastOrder(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.clientId) throw new NotFoundException('Магазин не найден');

    const lastOrder = await this.prisma.deliveryOrder.findFirst({
      where: { clientId: user.clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    return lastOrder;
  }

  async getOrderHistory(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.clientId) throw new NotFoundException('Магазин не найден');

    return this.prisma.deliveryOrder.findMany({
      where: { clientId: user.clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }
        },
      },
    });
  }

  async createOrder(userId: number, items: { productId: number, quantity: number }[], paymentMethod: string, address?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });
    if (!user || !user.clientId) throw new NotFoundException('Магазин не найден');

    // Fetch prices for products
    const productIds = items.map(i => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalAmount = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new NotFoundException(`Продукт ${item.productId} не найден`);
      const price = product.price;
      totalAmount += price * item.quantity;
      return {
        productId: product.id,
        quantity: item.quantity,
        price: price,
      };
    });

    const finalAddress = address && address.trim() !== '' ? address.trim() : (user.client!.route || 'Не указан');

    const newOrder = await this.prisma.deliveryOrder.create({
      data: {
        clientId: user.clientId,
        clientName: user.client!.name,
        clientPhone: user.client!.phone || '',
        address: finalAddress,
        totalAmount,
        status: 'PENDING',
        paymentMethod: paymentMethod || 'CASH',
        items: {
          create: orderItems,
        },
      },
    });

    return newOrder;
  }
}
