import { RecipesService } from './recipes.service';
export declare class RecipesController {
    private service;
    constructor(service: RecipesService);
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
            unit: string | null;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        yield: number;
        instructions: string | null;
    })[]>;
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
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        yield: number;
        instructions: string | null;
    }) | null>;
    findByProduct(productId: number): Promise<({
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
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        yield: number;
        instructions: string | null;
    }) | null>;
    create(dto: any): Promise<({
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
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        yield: number;
        instructions: string | null;
    }) | null>;
    updateRecipe(id: number, dto: {
        yield: number;
        instructions?: string;
        ingredients: {
            rawMaterialId: number;
            amount: number;
            unit?: string;
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
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        yield: number;
        instructions: string | null;
    }) | null>;
    createRawMaterial(dto: {
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
    addIngredient(id: number, dto: {
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
        unit: string | null;
        rawMaterialId: number;
        recipeId: number;
    }>;
    updateIngredient(ingredientId: number, dto: any): Promise<{
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
        unit: string | null;
        rawMaterialId: number;
        recipeId: number;
    }>;
    removeIngredient(ingredientId: number): Promise<{
        id: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string | null;
        rawMaterialId: number;
        recipeId: number;
    }>;
}
