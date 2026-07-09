"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const categories_module_1 = require("./categories/categories.module");
const products_module_1 = require("./products/products.module");
const clients_module_1 = require("./clients/clients.module");
const orders_module_1 = require("./orders/orders.module");
const routes_module_1 = require("./routes/routes.module");
const inventory_module_1 = require("./inventory/inventory.module");
const purchases_module_1 = require("./purchases/purchases.module");
const production_module_1 = require("./production/production.module");
const expenses_module_1 = require("./expenses/expenses.module");
const recipes_module_1 = require("./recipes/recipes.module");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const roles_module_1 = require("./roles/roles.module");
const analytics_module_1 = require("./analytics/analytics.module");
const pos_module_1 = require("./pos/pos.module");
const baker_module_1 = require("./baker/baker.module");
const cashier_module_1 = require("./cashier/cashier.module");
const courier_module_1 = require("./courier/courier.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            clients_module_1.ClientsModule,
            orders_module_1.OrdersModule,
            routes_module_1.RoutesModule,
            inventory_module_1.InventoryModule,
            purchases_module_1.PurchasesModule,
            production_module_1.ProductionModule,
            expenses_module_1.ExpensesModule,
            recipes_module_1.RecipesModule,
            vehicles_module_1.VehiclesModule,
            roles_module_1.RolesModule,
            analytics_module_1.AnalyticsModule,
            pos_module_1.PosModule,
            baker_module_1.BakerModule,
            cashier_module_1.CashierModule,
            courier_module_1.CourierModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map