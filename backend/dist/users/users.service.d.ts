import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(role?: string): Promise<{
        email: string;
        id: number;
        login: string | null;
        name: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.EmployeeStatus;
        isOnShift: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        email: string;
        id: number;
        login: string | null;
        name: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.EmployeeStatus;
        isOnShift: boolean;
        createdAt: Date;
    } | null>;
    create(dto: CreateUserDto): Promise<{
        email: string;
        id: number;
        login: string | null;
        name: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.EmployeeStatus;
        isOnShift: boolean;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        email: string;
        id: number;
        login: string | null;
        name: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.EmployeeStatus;
        isOnShift: boolean;
    }>;
    remove(id: number): Promise<{
        email: string;
        id: number;
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
    }>;
}
