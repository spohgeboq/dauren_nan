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
            categoryId: number;
            sku: string;
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
                categoryId: number;
                sku: string;
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
        b2bOrders: ({
            items: ({
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
                    stock: number;
                };
            } & {
                id: number;
                price: number;
                quantity: number;
                productId: number;
                orderId: number;
            })[];
        } & {
            id: number;
            status: import(".prisma/client").$Enums.DeliveryOrderStatus;
            createdAt: Date;
            clientId: number | null;
            clientName: string;
            clientPhone: string;
            address: string;
            totalAmount: number;
            isPaid: boolean;
            isBaked: boolean;
            paymentMethod: string | null;
            driverId: number | null;
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
            quantity: number;
            productId: number;
            bakerId: number;
            reason: string | null;
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
