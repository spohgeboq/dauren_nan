import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncomeSource, PaymentMethod } from '@prisma/client';

@Injectable()
export class IncomesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    amount: number;
    paymentMethod: PaymentMethod;
    source: IncomeSource;
    description?: string;
    isAuto?: boolean;
    userId?: number;
  }) {
    return this.prisma.income.create({
      data: {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        source: data.source,
        description: data.description,
        isAuto: data.isAuto || false,
        userId: data.userId,
      },
    });
  }

  async findAll(params?: { month?: string; source?: IncomeSource }) {
    const where: any = {};

    if (params?.month && params.month !== 'Все') {
      const [m, y] = params.month.split('-');
      const start = new Date(parseInt(y), parseInt(m) - 1, 1);
      const end = new Date(parseInt(y), parseInt(m), 1);
      where.date = { gte: start, lt: end };
    }

    if (params?.source && params.source !== ('Все' as any)) {
      where.source = params.source;
    }

    return this.prisma.income.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }

  async remove(id: number) {
    const income = await this.prisma.income.findUnique({ where: { id } });
    if (!income) throw new Error('Income not found');
    
    // Also remove clientPayment if it's tied to debt repayment
    if (income.source === 'DEBT_PAYMENT') {
      await this.prisma.clientPayment.deleteMany({
        where: { incomeId: id },
      });
      // we might need to restore balance? that's complex, better to just delete for now or warn user.
    }

    return this.prisma.income.delete({ where: { id } });
  }
}
