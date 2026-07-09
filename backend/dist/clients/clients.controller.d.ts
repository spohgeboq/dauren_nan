import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
export declare class ClientsController {
    private service;
    constructor(service: ClientsService);
    findAll(route?: string, debtorsOnly?: string): Promise<{
        id: number;
        email: string | null;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        ownerName: string | null;
        route: string | null;
        balance: number;
        deliveryTime: string | null;
    }[]>;
    getStats(): Promise<{
        activeCount: number;
        totalDebt: number;
    }>;
    findOne(id: number): Promise<({
        orders: {
            id: number;
            clientId: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            deliveryTime: string | null;
            deliveryDate: Date;
            total: number;
        }[];
    } & {
        id: number;
        email: string | null;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        ownerName: string | null;
        route: string | null;
        balance: number;
        deliveryTime: string | null;
    }) | null>;
    create(dto: CreateClientDto): Promise<{
        id: number;
        email: string | null;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        ownerName: string | null;
        route: string | null;
        balance: number;
        deliveryTime: string | null;
    }>;
    update(id: number, dto: UpdateClientDto): Promise<{
        id: number;
        email: string | null;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        ownerName: string | null;
        route: string | null;
        balance: number;
        deliveryTime: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        email: string | null;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        ownerName: string | null;
        route: string | null;
        balance: number;
        deliveryTime: string | null;
    }>;
}
