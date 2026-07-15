import { ClientWorkspaceService } from './client-workspace.service';
export declare class ClientWorkspaceController {
    private readonly service;
    constructor(service: ClientWorkspaceService);
    getProfile(req: any): Promise<{
        name: string;
        address: string;
        savedAddresses: string[];
        balance: number;
        debt: number;
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
        driver: {
            name: string | null;
            phone: string | null;
        } | null;
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
    }) | null>;
    getOrderHistory(req: any): Promise<({
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
        paymentMethod: string | null;
        clientName: string;
        clientPhone: string;
        address: string;
        totalAmount: number;
        isPaid: boolean;
        isBaked: boolean;
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
    }) | null>;
    createOrder(req: any, body: any): Promise<{
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
    }>;
}
