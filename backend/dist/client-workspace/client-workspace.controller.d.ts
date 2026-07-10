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
        driver: {
            name: string | null;
            phone: string | null;
        } | null;
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
            quantity: number;
            productId: number;
            orderId: number;
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
