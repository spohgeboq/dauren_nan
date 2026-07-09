"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourierController = void 0;
const common_1 = require("@nestjs/common");
const courier_service_1 = require("./courier.service");
let CourierController = class CourierController {
    constructor(service) {
        this.service = service;
    }
    getOrders(driverId) {
        return this.service.getOrders(driverId);
    }
    updateStatus(id, body) {
        return this.service.updateOrderStatus(id, body.status, body.paymentMethod);
    }
};
exports.CourierController = CourierController;
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Query)('driverId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CourierController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Post)('order/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CourierController.prototype, "updateStatus", null);
exports.CourierController = CourierController = __decorate([
    (0, common_1.Controller)('courier'),
    __metadata("design:paramtypes", [courier_service_1.CourierService])
], CourierController);
//# sourceMappingURL=courier.controller.js.map