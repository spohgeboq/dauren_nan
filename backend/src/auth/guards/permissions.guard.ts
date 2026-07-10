import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export const CheckPermissions = (moduleName: string) => SetMetadata('module', moduleName);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleName = this.reflector.get<string>('module', context.getClass());
    if (!moduleName) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    // ADMIN bypasses all permission checks
    if (user.role === 'ADMIN') {
      return true;
    }

    const getRoleNames = (role: string) => {
      if (role === 'ADMIN') return ['ADMIN', 'АДМИНИСТРАТОР'];
      if (role === 'BAKER') return ['BAKER', 'ПЕКАРЬ'];
      if (role === 'DRIVER') return ['DRIVER', 'ВОДИТЕЛЬ', 'ВОДИТЕЛЬ / КУРЬЕР'];
      if (role === 'CASHIER') return ['CASHIER', 'КАССИР'];
      return [role];
    };

    const customRole = await this.prisma.customRole.findFirst({
      where: {
        name: {
          in: getRoleNames(user.role),
          mode: 'insensitive',
        },
      },
      include: { permissions: true },
    });

    if (!customRole) {
      return false;
    }

    const permission = customRole.permissions.find(p => p.module === moduleName);
    if (!permission) {
      return false;
    }

    const method = request.method;
    if (method === 'GET') {
      return permission.canView;
    } else if (method === 'DELETE') {
      return permission.canDelete;
    } else if (['POST', 'PUT', 'PATCH'].includes(method)) {
      return permission.canCreate || permission.canEdit;
    }

    return false;
  }
}