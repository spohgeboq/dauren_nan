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
exports.RecipesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RecipesService = class RecipesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.recipe.findMany({
            include: { product: { select: { id: true, name: true } }, ingredients: { include: { rawMaterial: true } } },
        });
    }
    async findOne(id) {
        return this.prisma.recipe.findUnique({
            where: { id },
            include: { product: true, ingredients: { include: { rawMaterial: true } } },
        });
    }
    async findByProductId(productId) {
        return this.prisma.recipe.findUnique({
            where: { productId },
            include: { product: true, ingredients: { include: { rawMaterial: true } } },
        });
    }
    async create(data) {
        return this.prisma.recipe.create({
            data: {
                productId: data.productId,
                ingredients: data.ingredients ? { create: data.ingredients } : undefined,
            },
            include: { product: true, ingredients: { include: { rawMaterial: true } } },
        });
    }
    async addIngredient(recipeId, data) {
        return this.prisma.recipeIngredient.create({ data: { recipeId, ...data }, include: { rawMaterial: true } });
    }
    async updateIngredient(ingredientId, data) {
        return this.prisma.recipeIngredient.update({ where: { id: ingredientId }, data, include: { rawMaterial: true } });
    }
    async removeIngredient(ingredientId) {
        return this.prisma.recipeIngredient.delete({ where: { id: ingredientId } });
    }
    async getRawMaterials() {
        return this.prisma.rawMaterial.findMany({ orderBy: { name: 'asc' } });
    }
    async createRawMaterial(data) {
        return this.prisma.rawMaterial.create({ data });
    }
};
exports.RecipesService = RecipesService;
exports.RecipesService = RecipesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecipesService);
//# sourceMappingURL=recipes.service.js.map