import { PrismaService } from '../prisma/prisma.service';
export declare class RoutesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(date?: string): Promise<({
        loadItems: ({
            product: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            productId: number;
            quantity: number;
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
        date: Date;
        driverId: number | null;
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
                isHit: boolean;
                stock: number;
            };
        } & {
            id: number;
            productId: number;
            quantity: number;
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
            fixedSalary: import("@prisma/client/runtime/library").Decimal;
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
        date: Date;
        driverId: number | null;
    }) | null>;
    createWithAutoLoad(data: {
        name: string;
        driverId: number;
        date: string;
        clientIds: number[];
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
                isHit: boolean;
                stock: number;
            };
        } & {
            id: number;
            productId: number;
            quantity: number;
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
            fixedSalary: import("@prisma/client/runtime/library").Decimal;
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
        date: Date;
        driverId: number | null;
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
        date: Date;
        driverId: number | null;
    }>;
}
