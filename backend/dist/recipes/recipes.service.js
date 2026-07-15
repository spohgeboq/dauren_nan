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
        return this.prisma.$transaction(async (tx) => {
            const recipe = await tx.recipe.create({
                data: {
                    productId: data.productId,
                    yield: data.yield || 1,
                    instructions: data.instructions,
                },
            });
            let totalCostOnBatch = 0;
            if (data.ingredients && data.ingredients.length > 0) {
                for (const ing of data.ingredients) {
                    const material = await tx.rawMaterial.findUnique({ where: { id: ing.rawMaterialId } });
                    let actualAmount = ing.amount;
                    if (material) {
                        const matUnit = (material.unit || '').toLowerCase();
                        const ingUnit = (ing.unit || matUnit).toLowerCase();
                        if (matUnit === 'кг' && ingUnit === 'г')
                            actualAmount /= 1000;
                        if (matUnit === 'л' && ingUnit === 'мл')
                            actualAmount /= 1000;
                        if (matUnit === 'г' && ingUnit === 'кг')
                            actualAmount *= 1000;
                        if (matUnit === 'мл' && ingUnit === 'л')
                            actualAmount *= 1000;
                        totalCostOnBatch += Number(material.costPerUnit) * actualAmount;
                    }
                    await tx.recipeIngredient.create({
                        data: {
                            recipeId: recipe.id,
                            rawMaterialId: ing.rawMaterialId,
                            amount: ing.amount,
                            unit: ing.unit || null,
                            quantity: recipe.yield > 0 ? actualAmount / recipe.yield : 0,
                        },
                    });
                }
            }
            const costPerUnit = recipe.yield > 0 ? totalCostOnBatch / recipe.yield : 0;
            await tx.product.update({
                where: { id: data.productId },
                data: { cost: costPerUnit },
            });
            return tx.recipe.findUnique({
                where: { id: recipe.id },
                include: { product: true, ingredients: { include: { rawMaterial: true } } },
            });
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
    async updateRecipe(recipeId, data) {
        return this.prisma.$transaction(async (tx) => {
            await tx.recipe.update({
                where: { id: recipeId },
                data: { yield: data.yield, instructions: data.instructions },
            });
            await tx.recipeIngredient.deleteMany({
                where: { recipeId },
            });
            let totalCostOnBatch = 0;
            if (data.ingredients && data.ingredients.length > 0) {
                for (const ing of data.ingredients) {
                    const material = await tx.rawMaterial.findUnique({ where: { id: ing.rawMaterialId } });
                    let actualAmount = ing.amount;
                    if (material) {
                        const matUnit = (material.unit || '').toLowerCase();
                        const ingUnit = (ing.unit || matUnit).toLowerCase();
                        if (matUnit === 'кг' && ingUnit === 'г')
                            actualAmount /= 1000;
                        if (matUnit === 'л' && ingUnit === 'мл')
                            actualAmount /= 1000;
                        if (matUnit === 'г' && ingUnit === 'кг')
                            actualAmount *= 1000;
                        if (matUnit === 'мл' && ingUnit === 'л')
                            actualAmount *= 1000;
                        totalCostOnBatch += Number(material.costPerUnit) * actualAmount;
                    }
                    await tx.recipeIngredient.create({
                        data: {
                            recipeId,
                            rawMaterialId: ing.rawMaterialId,
                            amount: ing.amount,
                            unit: ing.unit || null,
                            quantity: data.yield > 0 ? actualAmount / data.yield : 0,
                        },
                    });
                }
            }
            const costPerUnit = data.yield > 0 ? totalCostOnBatch / data.yield : 0;
            const recipe = await tx.recipe.findUnique({ where: { id: recipeId } });
            if (recipe) {
                await tx.product.update({
                    where: { id: recipe.productId },
                    data: { cost: costPerUnit },
                });
            }
            return tx.recipe.findUnique({
                where: { id: recipeId },
                include: { product: true, ingredients: { include: { rawMaterial: true } } },
            });
        });
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