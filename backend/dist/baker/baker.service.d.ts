import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
export declare class BakerService {
    private prisma;
    private eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    getDashboard(): Promise<{
        products: ({
            recipe: ({
                ingredients: {
                    id: number;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    quantity: import("@prisma/client/runtime/library").Decimal;
                    unit: string | null;
                    rawMaterialId: number;
                    recipeId: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                productId: number;
                yield: number;
                instructions: string | null;
            }) | null;
        } & {
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
        })[];
        rawMaterials: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            stock: import("@prisma/client/runtime/library").Decimal;
            unit: string;
            costPerUnit: import("@prisma/client/runtime/library").Decimal;
            minLimit: import("@prisma/client/runtime/library").Decimal;
        }[];
        activeBatches: ({
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
        } & {
            id: number;
            status: import(".prisma/client").$Enums.BatchStatus;
            productId: number;
            quantity: number;
            bakerId: number;
            startTime: Date;
            endTime: Date | null;
        })[];
        b2bOrders: ({
            items: ({
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
            } & {
                id: number;
                price: number;
                productId: number;
                quantity: number;
                orderId: number;
            })[];
        } & {
            id: number;
            status: import(".prisma/client").$Enums.DeliveryOrderStatus;
            createdAt: Date;
            clientId: number | null;
            paymentMethod: string | null;
            clientName: string;
            clientPhone: string;
            address: string;
            totalAmount: number;
            isPaid: boolean;
            isBaked: boolean;
            driverId: number | null;
        })[];
    }>;
    startBatch(productId: number, quantity: number, bakerId: number): Promise<{
        success: boolean;
        batch: {
            id: number;
            status: import(".prisma/client").$Enums.BatchStatus;
            productId: number;
            quantity: number;
            bakerId: number;
            startTime: Date;
            endTime: Date | null;
        };
        hasPlannedTask: boolean;
    }>;
    finishBatch(batchId: number): Promise<{
        success: boolean;
    }>;
    recordDefect(productId: number, quantity: number, reason: string, bakerId: number): Promise<{
        success: boolean;
        defect: {
            id: number;
            createdAt: Date;
            productId: number;
            quantity: number;
            reason: string | null;
            bakerId: number;
        };
    }>;
    markB2bOrderReady(orderId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    logShowcaseBatch(productId: number, quantity: number, bakerId: number): Promise<{
        success: boolean;
    }>;
}
