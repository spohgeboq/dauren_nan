import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.customRole.findMany({ include: { permissions: true }, orderBy: { name: 'asc' } });
    const users = await this.prisma.user.findMany({ select: { role: true } });

    const roleMap: Record<string, string[]> = {
      'ADMIN': ['ADMIN', 'АДМИНИСТРАТОР'],
      'BAKER': ['BAKER', 'ПЕКАРЬ'],
      'DRIVER': ['DRIVER', 'ВОДИТЕЛЬ', 'ВОДИТЕЛЬ / КУРЬЕР'],
      'CASHIER': ['CASHIER', 'КАССИР'],
      'CLIENT': ['CLIENT', 'КЛИЕНТ']
    };

    return roles.map(role => {
      const uRole = role.name.toUpperCase();
      const count = users.filter(u => {
        const aliases = roleMap[u.role] || [u.role];
        return aliases.some(a => a === uRole || a.toLowerCase() === role.name.toLowerCase());
      }).length;

      return {
        ...role,
        employeeCount: count,
        isSystemAdmin: uRole === 'ADMIN'
      };
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.customRole.findUnique({ where: { id }, include: { permissions: true } });
    if (!role) return null;

    const users = await this.prisma.user.findMany({ select: { role: true } });
    const roleMap: Record<string, string[]> = {
      'ADMIN': ['ADMIN', 'АДМИНИСТРАТОР'],
      'BAKER': ['BAKER', 'ПЕКАРЬ'],
      'DRIVER': ['DRIVER', 'ВОДИТЕЛЬ', 'ВОДИТЕЛЬ / КУРЬЕР'],
      'CASHIER': ['CASHIER', 'КАССИР'],
      'CLIENT': ['CLIENT', 'КЛИЕНТ']
    };

    const uRole = role.name.toUpperCase();
    const count = users.filter(u => {
      const aliases = roleMap[u.role] || [u.role];
      return aliases.some(a => a === uRole || a.toLowerCase() === role.name.toLowerCase());
    }).length;

    return {
      ...role,
      employeeCount: count,
      isSystemAdmin: uRole === 'ADMIN'
    };
  }

  async create(data: { name: string; description?: string; permissions?: { module: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }[] }) {
    return this.prisma.customRole.create({
      data: { name: data.name, description: data.description, permissions: data.permissions ? { create: data.permissions } : undefined },
      include: { permissions: true },
    });
  }

  async update(id: number, data: { name?: string; description?: string }) {
    return this.prisma.customRole.update({ where: { id }, data, include: { permissions: true } });
  }

  async updatePermission(roleId: number, module: string, data: { canView?: boolean; canCreate?: boolean; canEdit?: boolean; canDelete?: boolean }) {
    return this.prisma.rolePermission.upsert({
      where: { roleId_module: { roleId, module } },
      update: data,
      create: { roleId, module, ...data },
    });
  }

  async remove(id: number) {
    return this.prisma.customRole.delete({ where: { id } });
  }
}
