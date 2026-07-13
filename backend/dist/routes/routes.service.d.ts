import { PrismaService } from '../prisma/prisma.service';
export declare class RoutesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        loadItems: ({
            product: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            quantity: number;
            productId: number;
            routeId: number;
        })[];
        driver: {
            id: number;
            name: string | null;
        } | null;
        points: {
            id: number;
            status: import(".prisma/client").$Enums.PointStatus;
            clientId: number | null;
            sortOrder: number;
            storeName: string;
            time: string | null;
            totalSum: number;
            routeId: number;
        }[];
    } & {
        id: number;
        name: string;
        status: import(".prisma/client").$Enums.RouteStatus;
        createdAt: Date;
        updatedAt: Date;
        driverId: number | null;
        date: Date;
    })[]>;
    findOne(id: number): Promise<({
        loadItems: ({
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
            quantity: number;
            productId: number;
            routeId: number;
        })[];
        driver: {
            email: string;
            id: number;
            passwordHash: string;
            name: string | null;
            phone: string | null;
            login: string | null;
            pin: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            isOnShift: boolean;
            createdAt: Date;
            updatedAt: Date;
            clientId: number | null;
        } | null;
        points: {
            id: number;
            status: import(".prisma/client").$Enums.PointStatus;
            clientId: number | null;
            sortOrder: number;
            storeName: string;
            time: string | null;
            totalSum: number;
            routeId: number;
        }[];
    } & {
        id: number;
        name: string;
        status: import(".prisma/client").$Enums.RouteStatus;
        createdAt: Date;
        updatedAt: Date;
        driverId: number | null;
        date: Date;
    }) | null>;
    create(data: {
        name: string;
        driverId?: number;
        loadItems?: {
            productId: number;
            quantity: number;
        }[];
        points?: {
            storeName: string;
            time?: string;
            totalSum?: number;
        }[];
    }): Promise<{
        loadItems: ({
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
            quantity: number;
            productId: number;
            routeId: number;
        })[];
        driver: {
            email: string;
            id: number;
            passwordHash: string;
            name: string | null;
            phone: string | null;
            login: string | null;
            pin: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            isOnShift: boolean;
            createdAt: Date;
            updatedAt: Date;
            clientId: number | null;
        } | null;
        points: {
            id: number;
            status: import(".prisma/client").$Enums.PointStatus;
            clientId: number | null;
            sortOrder: number;
            storeName: string;
            time: string | null;
            totalSum: number;
            routeId: number;
        }[];
    } & {
        id: number;
        name: string;
        status: import(".prisma/client").$Enums.RouteStatus;
        createdAt: Date;
        updatedAt: Date;
        driverId: number | null;
        date: Date;
    }>;
    updatePointStatus(routeId: number, pointId: number, status: string): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.PointStatus;
        clientId: number | null;
        sortOrder: number;
        storeName: string;
        time: string | null;
        totalSum: number;
        routeId: number;
    }>;
    updateRouteStatus(id: number, status: string): Promise<{
        id: number;
        name: string;
        status: import(".prisma/client").$Enums.RouteStatus;
        createdAt: Date;
        updatedAt: Date;
        driverId: number | null;
        date: Date;
    }>;
}
