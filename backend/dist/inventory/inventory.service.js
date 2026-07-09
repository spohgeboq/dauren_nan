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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
    }
    async findOne(id) {
        return this.prisma.inventoryItem.findUnique({ where: { id } });
    }
    async create(data) {
        return this.prisma.inventoryItem.create({ data });
    }
    async update(id, data) {
        return this.prisma.inventoryItem.update({ where: { id }, data });
    }
    async getStats() {
        const items = await this.prisma.inventoryItem.findMany();
        const total = items.length;
        const critical = items.filter(i => i.currentStock < i.minLimit).length;
        const totalValue = items.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0);
        return { totalItems: total, criticalItems: critical, totalValue };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map