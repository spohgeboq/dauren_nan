export declare class CreateClientDto {
    name: string;
    type?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    deliveryTime?: string;
}
export declare class UpdateClientDto {
    name?: string;
    type?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    route?: string;
    balance?: number;
    deliveryTime?: string;
}
