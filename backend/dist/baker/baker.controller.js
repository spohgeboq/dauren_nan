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
exports.BakerController = void 0;
const common_1 = require("@nestjs/common");
const baker_service_1 = require("./baker.service");
let BakerController = class BakerController {
    constructor(service) {
        this.service = service;
    }
    getDashboard() {
        return this.service.getDashboard();
    }
    startBatch(body) {
        return this.service.startBatch(body.productId, body.quantity, body.bakerId);
    }
    finishBatch(body) {
        return this.service.finishBatch(body.batchId);
    }
    recordDefect(body) {
        return this.service.recordDefect(body.productId, body.quantity, body.reason || '', body.bakerId);
    }
};
exports.BakerController = BakerController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BakerController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('batch/start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BakerController.prototype, "startBatch", null);
__decorate([
    (0, common_1.Post)('batch/finish'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BakerController.prototype, "finishBatch", null);
__decorate([
    (0, common_1.Post)('defect'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BakerController.prototype, "recordDefect", null);
exports.BakerController = BakerController = __decorate([
    (0, common_1.Controller)('baker'),
    __metadata("design:paramtypes", [baker_service_1.BakerService])
], BakerController);
//# sourceMappingURL=baker.controller.js.map