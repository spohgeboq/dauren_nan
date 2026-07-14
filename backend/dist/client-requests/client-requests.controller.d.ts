import { ClientRequestsService } from './client-requests.service';
export declare class ClientRequestsController {
    private readonly service;
    constructor(service: ClientRequestsService);
    create(dto: any): Promise<{
        id: number;
        phone: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryTime: string | null;
        clientName: string;
        address: string;
        clientType: string;
        contactName: string;
        comment: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        phone: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryTime: string | null;
        clientName: string;
        address: string;
        clientType: string;
        contactName: string;
        comment: string | null;
    }[]>;
    approve(id: number, dto: any): Promise<{
        id: number;
        phone: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryTime: string | null;
        clientName: string;
        address: string;
        clientType: string;
        contactName: string;
        comment: string | null;
    }>;
    reject(id: number): Promise<{
        id: number;
        phone: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryTime: string | null;
        clientName: string;
        address: string;
        clientType: string;
        contactName: string;
        comment: string | null;
    }>;
}
