import { PrismaService } from '../prisma/prisma.service';
export declare class ClientWorkspaceService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: number): Promise<{
        name: string;
        address: string;
        balance: number;
        phone: string | null;
    }>;
    getProducts(): Promise<{
        id: number;
        name: string;
        price: number;
        imageUrl: string | null;
    }[]>;
    getActiveOrder(userId: number): Promise<({
        driver: {
            name: string | null;
            phone: string | null;
        } | null;
        items: ({
            product: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string;
                categoryId: number;
                weight: number;
                cost: number;
                price: number;
                isActive: boolean;
                imageUrl: string | null;
                stock: number;
            };
        } & {
            id: number;
            price: number;
            orderId: number;
            productId: number;
            quantity: number;
        })[];
    } & {
        id: number;
        clientId: number | null;
        status: import(".prisma/client").$Enums.DeliveryOrderStatus;
        createdAt: Date;
        clientName: string;
        clientPhone: string;
        address: string;
        totalAmount: number;
        isPaid: boolean;
        paymentMethod: string | null;
        driverId: number | null;
    }) | null>;
    getLastOrder(userId: number): Promise<({
        items: {
            id: number;
            price: number;
            orderId: number;
            productId: number;
            quantity: number;
        }[];
    } & {
        id: number;
        clientId: number | null;
        status: import(".prisma/client").$Enums.DeliveryOrderStatus;
        createdAt: Date;
        clientName: string;
        clientPhone: string;
        address: string;
        totalAmount: number;
        isPaid: boolean;
        paymentMethod: string | null;
        driverId: number | null;
    }) | null>;
    getOrderHistory(userId: number): Promise<({
        items: ({
            product: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string;
                categoryId: number;
                weight: number;
                cost: number;
                price: number;
                isActive: boolean;
                imageUrl: string | null;
                stock: number;
            };
        } & {
            id: number;
            price: number;
            orderId: number;
            productId: number;
            quantity: number;
        })[];
    } & {
        id: number;
        clientId: number | null;
        status: import(".prisma/client").$Enums.DeliveryOrderStatus;
        createdAt: Date;
        clientName: string;
        clientPhone: string;
        address: string;
        totalAmount: number;
        isPaid: boolean;
        paymentMethod: string | null;
        driverId: number | null;
    })[]>;
    createOrder(userId: number, items: {
        productId: number;
        quantity: number;
    }[], paymentMethod: string): Promise<{
        id: number;
        clientId: number | null;
        status: import(".prisma/client").$Enums.DeliveryOrderStatus;
        createdAt: Date;
        clientName: string;
        clientPhone: string;
        address: string;
        totalAmount: number;
        isPaid: boolean;
        paymentMethod: string | null;
        driverId: number | null;
    }>;
}
