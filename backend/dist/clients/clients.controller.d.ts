import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
export declare class ClientsController {
    private service;
    constructor(service: ClientsService);
    findAll(route?: string, debtorsOnly?: string): Promise<{
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
    }[]>;
    getStats(): Promise<{
        activeCount: number;
        totalDebt: number;
    }>;
    findOne(id: number): Promise<({
        orders: {
            id: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            deliveryTime: string | null;
            clientId: number;
            deliveryDate: Date;
            total: number;
        }[];
    } & {
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
    }) | null>;
    create(dto: CreateClientDto): Promise<{
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
    }>;
    update(id: number, dto: UpdateClientDto): Promise<{
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
    }>;
    remove(id: number): Promise<{
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
    }>;
}
