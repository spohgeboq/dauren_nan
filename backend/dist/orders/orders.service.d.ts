import { PrismaService } from '../prisma/prisma.service';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(date?: string): Promise<({
        client: {
            id: number;
            name: string;
        };
        items: ({
            product: {
                id: number;
                name: string;
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
        clientId: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryTime: string | null;
        deliveryDate: Date;
        total: number;
    })[]>;
    findOne(id: number): Promise<({
        client: {
            email: string | null;
            id: number;
            name: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            ownerName: string | null;
            deliveryTime: string | null;
            route: string | null;
            balance: number;
        };
        items: ({
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
            price: number;
            quantity: number;
            productId: number;
            orderId: number;
        })[];
    } & {
        id: number;
        clientId: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryTime: string | null;
        deliveryDate: Date;
        total: number;
    }) | null>;
    create(data: {
        clientId: number;
        deliveryTime?: string;
        items: {
            productId: number;
            quantity: number;
            price: number;
        }[];
    }): Promise<{
        client: {
            email: string | null;
            id: number;
            name: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            ownerName: string | null;
            deliveryTime: string | null;
            route: string | null;
            balance: number;
        };
        items: ({
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
            price: number;
            quantity: number;
            productId: number;
            orderId: number;
        })[];
    } & {
        id: number;
        clientId: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryTime: string | null;
        deliveryDate: Date;
        total: number;
    }>;
    updateStatus(id: number, status: string): Promise<{
        id: number;
        clientId: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryTime: string | null;
        deliveryDate: Date;
        total: number;
    }>;
    getStats(): Promise<{
        totalOrders: number;
        pendingOrders: number;
        totalSum: number;
    }>;
}
