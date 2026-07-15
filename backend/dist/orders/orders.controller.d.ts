import { OrdersService } from './orders.service';
export declare class OrdersController {
    private service;
    constructor(service: OrdersService);
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
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: number;
        deliveryTime: string | null;
        deliveryDate: Date;
        total: number;
    })[]>;
    getStats(): Promise<{
        totalOrders: number;
        pendingOrders: number;
        totalSum: number;
    }>;
    findAllDeliveries(date?: string): Promise<({
        client: {
            id: number;
            name: string;
        } | null;
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
        driver: {
            id: number;
            name: string | null;
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
    })[]>;
    createDelivery(dto: {
        clientId: number;
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
        } | null;
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
    }>;
    assignDriver(id: number, driverId: number | null): Promise<{
        driver: {
            id: number;
            name: string | null;
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
    }>;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: number;
        deliveryTime: string | null;
        deliveryDate: Date;
        total: number;
    }) | null>;
    create(dto: {
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
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: number;
        deliveryTime: string | null;
        deliveryDate: Date;
        total: number;
    }>;
    updateStatus(id: number, status: string): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: number;
        deliveryTime: string | null;
        deliveryDate: Date;
        total: number;
    }>;
}
