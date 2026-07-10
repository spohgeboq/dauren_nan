"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = exports.CheckPermissions = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const CheckPermissions = (moduleName) => (0, common_1.SetMetadata)('module', moduleName);
exports.CheckPermissions = CheckPermissions;
let PermissionsGuard = class PermissionsGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const moduleName = this.reflector.get('module', context.getClass());
        if (!moduleName) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            return false;
        }
        if (user.role === 'ADMIN') {
            return true;
        }
        const getRoleNames = (role) => {
            if (role === 'ADMIN')
                return ['ADMIN', 'АДМИНИСТРАТОР'];
            if (role === 'BAKER')
                return ['BAKER', 'ПЕКАРЬ'];
            if (role === 'DRIVER')
                return ['DRIVER', 'ВОДИТЕЛЬ', 'ВОДИТЕЛЬ / КУРЬЕР'];
            if (role === 'CASHIER')
                return ['CASHIER', 'КАССИР'];
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
        }
        else if (method === 'DELETE') {
            return permission.canDelete;
        }
        else if (['POST', 'PUT', 'PATCH'].includes(method)) {
            return permission.canCreate || permission.canEdit;
        }
        return false;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map