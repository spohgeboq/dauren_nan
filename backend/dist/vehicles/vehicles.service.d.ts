import { PrismaService } from '../prisma/prisma.service';
export declare class VehiclesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        driver: {
            id: number;
            name: string | null;
        } | null;
    } & {
        id: number;
        status: import(".prisma/client").$Enums.VehicleStatus;
        createdAt: Date;
        updatedAt: Date;
        driverId: number | null;
        brandModel: string;
        licensePlate: string;
        capacityTrays: number;
        fuelConsumption: number;
    })[]>;
    findOne(id: number): Promise<({
        driver: {
            id: number;
            email: string;
            login: string | null;
            clientId: number | null;
            passwordHash: string;
            name: string | null;
            phone: string | null;
            pin: string | null;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            isOnShift: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: number;
        status: import(".prisma/client").$Enums.VehicleStatus;
        createdAt: Date;
        updatedAt: Date;
        driverId: number | null;
        brandModel: string;
        licensePlate: string;
        capacityTrays: number;
        fuelConsumption: number;
    }) | null>;
    create(data: {
        brandModel: string;
        licensePlate: string;
        capacityTrays?: number;
        driverId?: number;
        status?: string;
        fuelConsumption?: number;
    }): Promise<{
        driver: {
            id: number;
            name: string | null;
        } | null;
    } & {
        id: number;
        status: import(".prisma/client").$Enums.VehicleStatus;
        createdAt: Date;
        updatedAt: Date;
        driverId: number | null;
        brandModel: string;
        licensePlate: string;
        capacityTrays: number;
        fuelConsumption: number;
    }>;
    update(id: number, data: any): Promise<{
        driver: {
            id: number;
            name: string | null;
        } | null;
    } & {
        id: number;
        status: import(".prisma/client").$Enums.VehicleStatus;
        createdAt: Date;
        updatedAt: Date;
        driverId: number | null;
        brandModel: string;
        licensePlate: string;
        capacityTrays: number;
        fuelConsumption: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.VehicleStatus;
        createdAt: Date;
        updatedAt: Date;
        driverId: number | null;
        brandModel: string;
        licensePlate: string;
        capacityTrays: number;
        fuelConsumption: number;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        repair: number;
    }>;
}
