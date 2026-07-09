import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.customRole.findMany({ include: { permissions: true }, orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    return this.prisma.customRole.findUnique({ where: { id }, include: { permissions: true } });
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
