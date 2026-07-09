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
            status: import(".prisma/client").$Enums.DeliveryOrderStatus;
            createdAt: Date;
            driverId: number | null;
            paymentMethod: string | null;
            totalAmount: number;
            clientName: string;
            clientPhone: string;
            address: string;
            isPaid: boolean;
        })[];
    }>;
    updateOrderStatus(orderId: number, status: string, paymentMethod?: string): Promise<{
        success: boolean;
    }>;
}
