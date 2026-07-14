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
                stock: number;
                costPerUnit: number;
                unit: string;
            };
        } & {
            id: number;
            quantity: number;
            amount: number;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
    })[]>;
    getRawMaterials(): Promise<{
        id: number;
        name: string;
        stock: number;
        costPerUnit: number;
        unit: string;
    }[]>;
    findOne(id: number): Promise<({
        product: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            sku: string;
            categoryId: number;
            weight: number;
            cost: number;
            price: number;
            imageUrl: string | null;
            stock: number;
        };
        ingredients: ({
            rawMaterial: {
                id: number;
                name: string;
                stock: number;
                costPerUnit: number;
                unit: string;
            };
        } & {
            id: number;
            quantity: number;
            amount: number;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
    }) | null>;
    findByProduct(productId: number): Promise<({
        product: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            sku: string;
            categoryId: number;
            weight: number;
            cost: number;
            price: number;
            imageUrl: string | null;
            stock: number;
        };
        ingredients: ({
            rawMaterial: {
                id: number;
                name: string;
                stock: number;
                costPerUnit: number;
                unit: string;
            };
        } & {
            id: number;
            quantity: number;
            amount: number;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
    }) | null>;
    create(dto: any): Promise<{
        product: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            sku: string;
            categoryId: number;
            weight: number;
            cost: number;
            price: number;
            imageUrl: string | null;
            stock: number;
        };
        ingredients: ({
            rawMaterial: {
                id: number;
                name: string;
                stock: number;
                costPerUnit: number;
                unit: string;
            };
        } & {
            id: number;
            quantity: number;
            amount: number;
            rawMaterialId: number;
            recipeId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
    }>;
    createRawMaterial(dto: {
        name: string;
        unit?: string;
        costPerUnit?: number;
    }): Promise<{
        id: number;
        name: string;
        stock: number;
        costPerUnit: number;
        unit: string;
    }>;
    addIngredient(id: number, dto: {
        rawMaterialId: number;
        amount: number;
    }): Promise<{
        rawMaterial: {
            id: number;
            name: string;
            stock: number;
            costPerUnit: number;
            unit: string;
        };
    } & {
        id: number;
        quantity: number;
        amount: number;
        rawMaterialId: number;
        recipeId: number;
    }>;
    updateIngredient(ingredientId: number, dto: any): Promise<{
        rawMaterial: {
            id: number;
            name: string;
            stock: number;
            costPerUnit: number;
            unit: string;
        };
    } & {
        id: number;
        quantity: number;
        amount: number;
        rawMaterialId: number;
        recipeId: number;
    }>;
    removeIngredient(ingredientId: number): Promise<{
        id: number;
        quantity: number;
        amount: number;
        rawMaterialId: number;
        recipeId: number;
    }>;
}
