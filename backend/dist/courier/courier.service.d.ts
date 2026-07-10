import { PrismaService } from '../prisma/prisma.service';
export declare class CourierService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrders(driverId: number): Promise<{
        orders: ({
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
        })[];
    }>;
    updateOrderStatus(orderId: number, status: string, paymentMethod?: string): Promise<{
        success: boolean;
    }>;
}
