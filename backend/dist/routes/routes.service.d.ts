import { PrismaService } from '../prisma/prisma.service';
export declare class RoutesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(date?: string): Promise<({
        driver: {
            id: number;
            name: string | null;
        } | null;
        points: {
            id: number;
            status: import(".prisma/client").$Enums.PointStatus;
            clientId: number | null;
            sortOrder: number;
            routeId: number;
            storeName: string;
            time: string | null;
            totalSum: number;
        }[];
        loadItems: ({
            product: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            routeId: number;
            productId: number;
            quantity: number;
        })[];
    } & {
        id: number;
        name: string;
        driverId: number | null;
        status: import(".prisma/client").$Enums.RouteStatus;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: number): Promise<({
        driver: {
            id: number;
            name: string | null;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            passwordHash: string;
            phone: string | null;
            login: string | null;
            pin: string | null;
            role: import(".prisma/client").$Enums.Role;
            isOnShift: boolean;
            clientId: number | null;
        } | null;
        points: {
            id: number;
            status: import(".prisma/client").$Enums.PointStatus;
            clientId: number | null;
            sortOrder: number;
            routeId: number;
            storeName: string;
            time: string | null;
            totalSum: number;
        }[];
        loadItems: ({
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
            routeId: number;
            productId: number;
            quantity: number;
        })[];
    } & {
        id: number;
        name: string;
        driverId: number | null;
        status: import(".prisma/client").$Enums.RouteStatus;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    createWithAutoLoad(data: {
        name: string;
        driverId: number;
        date: string;
        clientIds: number[];
    }): Promise<{
        driver: {
            id: number;
            name: string | null;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            passwordHash: string;
            phone: string | null;
            login: string | null;
            pin: string | null;
            role: import(".prisma/client").$Enums.Role;
            isOnShift: boolean;
            clientId: number | null;
        } | null;
        points: {
            id: number;
            status: import(".prisma/client").$Enums.PointStatus;
            clientId: number | null;
            sortOrder: number;
            routeId: number;
            storeName: string;
            time: string | null;
            totalSum: number;
        }[];
        loadItems: ({
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
            routeId: number;
            productId: number;
            quantity: number;
        })[];
    } & {
        id: number;
        name: string;
        driverId: number | null;
        status: import(".prisma/client").$Enums.RouteStatus;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updatePointStatus(routeId: number, pointId: number, status: string): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.PointStatus;
        clientId: number | null;
        sortOrder: number;
        routeId: number;
        storeName: string;
        time: string | null;
        totalSum: number;
    }>;
    updateRouteStatus(id: number, status: string): Promise<{
        id: number;
        name: string;
        driverId: number | null;
        status: import(".prisma/client").$Enums.RouteStatus;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
