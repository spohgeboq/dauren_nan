import { ClientWorkspaceService } from './client-workspace.service';
export declare class ClientWorkspaceController {
    private readonly service;
    constructor(service: ClientWorkspaceService);
    getProfile(req: any): Promise<{
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
    getActiveOrder(req: any): Promise<({
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
    getOrderHistory(req: any): Promise<({
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
    getLastOrder(req: any): Promise<({
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
    createOrder(req: any, body: any): Promise<{
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
