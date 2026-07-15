import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(route?: string, debtorsOnly?: boolean) {
    const where: any = {};
    if (route && route !== 'Все маршруты') where.route = route;
    if (debtorsOnly) where.balance = { lt: 0 };
    return this.prisma.client.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    return this.prisma.client.findUnique({ where: { id }, include: { orders: true } });
  }

  async create(dto: CreateClientDto) {
    const { login, password, ...clientData } = dto;
    const client = await this.prisma.client.create({ data: clientData });

    if (login && password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await this.prisma.user.create({
        data: {
          email: `${login}@daurennan.kz`,
          login,
          passwordHash,
          name: client.ownerName || client.name,
          phone: client.phone,
          role: 'CLIENT',
          clientId: client.id,
        },
      });
    }

    return client;
  }

  async update(id: number, dto: UpdateClientDto) {
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    // Delete associated user if exists
    await this.prisma.user.deleteMany({
      where: { clientId: id }
    });
    return this.prisma.client.delete({ where: { id } });
  }

  async getStats() {
    const total = await this.prisma.client.count();
    const debtors = await this.prisma.client.findMany({ where: { balance: { lt: 0 } } });
    const totalDebt = debtors.reduce((acc, c) => acc + Math.abs(c.balance), 0);
    return { activeCount: total, totalDebt };
  }

  async payDebt(id: number, data: { amount: number; paymentMethod: string }) {
    return this.prisma.$transaction(async (tx) => {
      const client = await tx.client.findUnique({ where: { id } });
      if (!client) throw new Error('Client not found');

      // Create ClientPayment
      const payment = await tx.clientPayment.create({
        data: {
          clientId: id,
          amount: data.amount,
          paymentMethod: data.paymentMethod === 'CASH' ? 'CASH' : 'KASPI',
        }
      });

      // Create Income
      const income = await tx.income.create({
        data: {
          amount: data.amount,
          paymentMethod: data.paymentMethod === 'CASH' ? 'CASH' : 'KASPI',
          source: 'DEBT_PAYMENT',
          description: `Оплата долга от клиента: ${client.name}`,
          isAuto: true,
        }
      });

      // Link payment to income
      await tx.clientPayment.update({
        where: { id: payment.id },
        data: { incomeId: income.id },
      });

      // Increase balance
      await tx.client.update({
        where: { id },
        data: { balance: { increment: data.amount } },
      });

      return { success: true };
    });
  }
}
