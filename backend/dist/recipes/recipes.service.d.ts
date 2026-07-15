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
                createdAt: Date;
                updatedAt: Date;
                name: string;
                stock: import("@prisma/client/runtime/library").Decimal;
                unit: string;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
                minLimit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            recipeId: number;
            rawMaterialId: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
        })[];
    } & {
        id: number;
        productId: number;
        yield: number;
        instructions: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: number): Promise<({
        product: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            name: string;
            categoryId: number;
            weight: number;
            cost: number;
            price: number;
            isActive: boolean;
            imageUrl: string | null;
            description: string | null;
            isHit: boolean;
            stock: number;
        };
        ingredients: ({
            rawMaterial: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                stock: import("@prisma/client/runtime/library").Decimal;
                unit: string;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
                minLimit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            recipeId: number;
            rawMaterialId: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
        })[];
    } & {
        id: number;
        productId: number;
        yield: number;
        instructions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findByProductId(productId: number): Promise<({
        product: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            name: string;
            categoryId: number;
            weight: number;
            cost: number;
            price: number;
            isActive: boolean;
            imageUrl: string | null;
            description: string | null;
            isHit: boolean;
            stock: number;
        };
        ingredients: ({
            rawMaterial: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                stock: import("@prisma/client/runtime/library").Decimal;
                unit: string;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
                minLimit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            recipeId: number;
            rawMaterialId: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
        })[];
    } & {
        id: number;
        productId: number;
        yield: number;
        instructions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    create(data: {
        productId: number;
        yield?: number;
        instructions?: string;
        ingredients?: {
            rawMaterialId: number;
            amount: number;
            unit?: string | null;
        }[];
    }): Promise<({
        product: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            name: string;
            categoryId: number;
            weight: number;
            cost: number;
            price: number;
            isActive: boolean;
            imageUrl: string | null;
            description: string | null;
            isHit: boolean;
            stock: number;
        };
        ingredients: ({
            rawMaterial: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                stock: import("@prisma/client/runtime/library").Decimal;
                unit: string;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
                minLimit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            recipeId: number;
            rawMaterialId: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
        })[];
    } & {
        id: number;
        productId: number;
        yield: number;
        instructions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    addIngredient(recipeId: number, data: {
        rawMaterialId: number;
        amount: number;
    }): Promise<{
        rawMaterial: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            stock: import("@prisma/client/runtime/library").Decimal;
            unit: string;
            costPerUnit: import("@prisma/client/runtime/library").Decimal;
            minLimit: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: number;
        recipeId: number;
        rawMaterialId: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string | null;
    }>;
    updateIngredient(ingredientId: number, data: {
        rawMaterialId?: number;
        amount?: number;
    }): Promise<{
        rawMaterial: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            stock: import("@prisma/client/runtime/library").Decimal;
            unit: string;
            costPerUnit: import("@prisma/client/runtime/library").Decimal;
            minLimit: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: number;
        recipeId: number;
        rawMaterialId: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string | null;
    }>;
    removeIngredient(ingredientId: number): Promise<{
        id: number;
        recipeId: number;
        rawMaterialId: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string | null;
    }>;
    updateRecipe(recipeId: number, data: {
        yield: number;
        instructions?: string;
        ingredients: {
            rawMaterialId: number;
            amount: number;
            unit?: string | null;
        }[];
    }): Promise<({
        product: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            name: string;
            categoryId: number;
            weight: number;
            cost: number;
            price: number;
            isActive: boolean;
            imageUrl: string | null;
            description: string | null;
            isHit: boolean;
            stock: number;
        };
        ingredients: ({
            rawMaterial: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                stock: import("@prisma/client/runtime/library").Decimal;
                unit: string;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
                minLimit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            recipeId: number;
            rawMaterialId: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
        })[];
    } & {
        id: number;
        productId: number;
        yield: number;
        instructions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    getRawMaterials(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        stock: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
        minLimit: import("@prisma/client/runtime/library").Decimal;
    }>;
}
