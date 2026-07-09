import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

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
    return this.prisma.client.create({ data: dto });
  }

  async update(id: number, dto: UpdateClientDto) {
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    return this.prisma.client.delete({ where: { id } });
  }

  async getStats() {
    const total = await this.prisma.client.count();
    const debtors = await this.prisma.client.findMany({ where: { balance: { lt: 0 } } });
    const totalDebt = debtors.reduce((acc, c) => acc + Math.abs(c.balance), 0);
    return { activeCount: total, totalDebt };
  }
}
