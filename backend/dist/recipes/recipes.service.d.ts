import { PrismaService } from '../prisma/prisma.service';
export declare class RecipesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        product: {
            id: number;
            name: string;
        };
        ingredients: ({
            rawMaterial: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                stock: import("@prisma/client/runtime/library").Decimal;
                unit: string;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
                minLimit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
    })[]>;
    findOne(id: number): Promise<({
        product: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            categoryId: number;
            sku: string;
            weight: number;
            cost: number;
            price: number;
            imageUrl: string | null;
            isHit: boolean;
            stock: number;
        };
        ingredients: ({
            rawMaterial: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                stock: import("@prisma/client/runtime/library").Decimal;
                unit: string;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
                minLimit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
    }) | null>;
    findByProductId(productId: number): Promise<({
        product: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            categoryId: number;
            sku: string;
            weight: number;
            cost: number;
            price: number;
            imageUrl: string | null;
            isHit: boolean;
            stock: number;
        };
        ingredients: ({
            rawMaterial: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                stock: import("@prisma/client/runtime/library").Decimal;
                unit: string;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
                minLimit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
    }) | null>;
    create(data: {
        productId: number;
        ingredients?: {
            rawMaterialId: number;
            amount: number;
        }[];
    }): Promise<{
        product: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            categoryId: number;
            sku: string;
            weight: number;
            cost: number;
            price: number;
            imageUrl: string | null;
            isHit: boolean;
            stock: number;
        };
        ingredients: ({
            rawMaterial: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                stock: import("@prisma/client/runtime/library").Decimal;
                unit: string;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
                minLimit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
    }>;
    addIngredient(recipeId: number, data: {
        rawMaterialId: number;
        amount: number;
    }): Promise<{
        rawMaterial: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            stock: import("@prisma/client/runtime/library").Decimal;
            unit: string;
            costPerUnit: import("@prisma/client/runtime/library").Decimal;
            minLimit: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: import("@prisma/client/runtime/library").Decimal;
        rawMaterialId: number;
        recipeId: number;
    }>;
    updateIngredient(ingredientId: number, data: {
        rawMaterialId?: number;
        amount?: number;
    }): Promise<{
        rawMaterial: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            stock: import("@prisma/client/runtime/library").Decimal;
            unit: string;
            costPerUnit: import("@prisma/client/runtime/library").Decimal;
            minLimit: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: import("@prisma/client/runtime/library").Decimal;
        rawMaterialId: number;
        recipeId: number;
    }>;
    removeIngredient(ingredientId: number): Promise<{
        id: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: import("@prisma/client/runtime/library").Decimal;
        rawMaterialId: number;
        recipeId: number;
    }>;
    getRawMaterials(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
        minLimit: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createRawMaterial(data: {
        name: string;
        unit?: string;
        costPerUnit?: number;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        stock: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
        minLimit: import("@prisma/client/runtime/library").Decimal;
    }>;
}
