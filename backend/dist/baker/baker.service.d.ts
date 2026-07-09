import { PrismaService } from '../prisma/prisma.service';
export declare class BakerService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<{
        products: ({
            recipe: ({
                ingredients: {
                    id: number;
                    quantity: number;
                    amount: number;
                    rawMaterialId: number;
                    recipeId: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                productId: number;
            }) | null;
        } & {
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
        })[];
        rawMaterials: {
            id: number;
            name: string;
            stock: number;
            costPerUnit: number;
            unit: string;
        }[];
        activeBatches: ({
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
        } & {
            id: number;
            status: import(".prisma/client").$Enums.BatchStatus;
            quantity: number;
            productId: number;
            bakerId: number;
            startTime: Date;
            endTime: Date | null;
        })[];
    }>;
    startBatch(productId: number, quantity: number, bakerId: number): Promise<{
        success: boolean;
        batch: {
            id: number;
            status: import(".prisma/client").$Enums.BatchStatus;
            quantity: number;
            productId: number;
            bakerId: number;
            startTime: Date;
            endTime: Date | null;
        };
    }>;
    finishBatch(batchId: number): Promise<{
        success: boolean;
    }>;
    recordDefect(productId: number, quantity: number, reason: string, bakerId: number): Promise<{
        success: boolean;
        defect: {
            id: number;
            createdAt: Date;
            quantity: number;
            productId: number;
            bakerId: number;
            reason: string | null;
        };
    }>;
}
