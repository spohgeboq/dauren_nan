import { VehiclesService } from './vehicles.service';
export declare class VehiclesController {
    private service;
    constructor(service: VehiclesService);
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
    getStats(): Promise<{
        total: number;
        active: number;
        repair: number;
    }>;
    findOne(id: number): Promise<({
        driver: {
            email: string;
            id: number;
            login: string | null;
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
    create(dto: any): Promise<{
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
    update(id: number, dto: any): Promise<{
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
}
