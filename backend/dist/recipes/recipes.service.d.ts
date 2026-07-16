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
            recipeId: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            rawMaterialId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        yield: number;
        instructions: string | null;
    })[]>;
    findOne(id: number): Promise<({
        product: {
            description: string | null;
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
            recipeId: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            rawMaterialId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        yield: number;
        instructions: string | null;
    }) | null>;
    findByProductId(productId: number): Promise<({
        product: {
            description: string | null;
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
            recipeId: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            rawMaterialId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        yield: number;
        instructions: string | null;
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
            description: string | null;
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
            recipeId: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            rawMaterialId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        yield: number;
        instructions: string | null;
    }) | null>;
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
        recipeId: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string | null;
        rawMaterialId: number;
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
        recipeId: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string | null;
        rawMaterialId: number;
    }>;
    removeIngredient(ingredientId: number): Promise<{
        id: number;
        recipeId: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string | null;
        rawMaterialId: number;
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
            description: string | null;
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
            recipeId: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            rawMaterialId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        yield: number;
        instructions: string | null;
    }) | null>;
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
