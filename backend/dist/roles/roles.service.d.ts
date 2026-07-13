import { PrismaService } from '../prisma/prisma.service';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        employeeCount: number;
        isSystemAdmin: boolean;
        permissions: {
            id: number;
            module: string;
            roleId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        }[];
        description: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        employeeCount: number;
        isSystemAdmin: boolean;
        permissions: {
            id: number;
            module: string;
            roleId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        }[];
        description: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(data: {
        name: string;
        description?: string;
        permissions?: {
            module: string;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        }[];
    }): Promise<{
        permissions: {
            id: number;
            module: string;
            roleId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        }[];
    } & {
        description: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, data: {
        name?: string;
        description?: string;
    }): Promise<{
        permissions: {
            id: number;
            module: string;
            roleId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        }[];
    } & {
        description: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updatePermission(roleId: number, module: string, data: {
        canView?: boolean;
        canCreate?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
    }): Promise<{
        id: number;
        module: string;
        roleId: number;
        canView: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
    }>;
    remove(id: number): Promise<{
        description: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
