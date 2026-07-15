import { CourierService } from './courier.service';
export declare class CourierController {
    private service;
    constructor(service: CourierService);
    getOrders(driverId: number): Promise<{
        orders: ({
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
    updateStatus(id: number, body: {
        status: string;
        paymentMethod?: string;
    }): Promise<{
        success: boolean;
    }>;
}
