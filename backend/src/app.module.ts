import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ClientsModule } from './clients/clients.module';
import { OrdersModule } from './orders/orders.module';
import { RoutesModule } from './routes/routes.module';
import { InventoryModule } from './inventory/inventory.module';
import { PurchasesModule } from './purchases/purchases.module';
import { ProductionModule } from './production/production.module';
import { ExpensesModule } from './expenses/expenses.module';
import { RecipesModule } from './recipes/recipes.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { RolesModule } from './roles/roles.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PosModule } from './pos/pos.module';
import { BakerModule } from './baker/baker.module';
import { CashierModule } from './cashier/cashier.module';
import { CourierModule } from './courier/courier.module';
import { ClientWorkspaceModule } from './client-workspace/client-workspace.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    ClientsModule,
    OrdersModule,
    RoutesModule,
    InventoryModule,
    PurchasesModule,
    ProductionModule,
    ExpensesModule,
    RecipesModule,
    VehiclesModule,
    RolesModule,
    AnalyticsModule,
    PosModule,
    BakerModule,
    CashierModule,
    CourierModule,
    ClientWorkspaceModule,
  ],
})
export class AppModule {}
