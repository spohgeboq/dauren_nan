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
    findByProduct(productId: number): Promise<({
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
    create(dto: any): Promise<({
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
    createRawMaterial(dto: {
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
    addIngredient(id: number, dto: {
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
    updateIngredient(ingredientId: number, dto: any): Promise<{
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
}
