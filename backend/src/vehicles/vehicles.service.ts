import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleStatus } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vehicle.findMany({ include: { driver: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    return this.prisma.vehicle.findUnique({ where: { id }, include: { driver: true } });
  }

  async create(data: { brandModel: string; licensePlate: string; capacityTrays?: number; driverId?: number; status?: string; fuelConsumption?: number }) {
    return this.prisma.vehicle.create({
      data: { ...data, status: (data.status || 'ACTIVE') as VehicleStatus },
      include: { driver: { select: { id: true, name: true } } },
    });
  }

  async update(id: number, data: any) {
    if (data.status) data.status = data.status as VehicleStatus;
    return this.prisma.vehicle.update({ where: { id }, data, include: { driver: { select: { id: true, name: true } } } });
  }

  async remove(id: number) {
    return this.prisma.vehicle.delete({ where: { id } });
  }

  async getStats() {
    const total = await this.prisma.vehicle.count();
    const active = await this.prisma.vehicle.count({ where: { status: 'ACTIVE' } });
    const repair = await this.prisma.vehicle.count({ where: { status: 'REPAIR' } });
    return { total, active, repair };
  }
}
