import { Role } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    login?: string;
    pin?: string;
    role?: Role;
}
export declare class UpdateUserDto {
    name?: string;
    phone?: string;
    role?: Role;
    status?: string;
}
