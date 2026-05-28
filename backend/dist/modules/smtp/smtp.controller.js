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
exports.SmtpController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const smtp_service_1 = require("./smtp.service");
const smtp_dto_1 = require("./dto/smtp.dto");
const org_decorator_1 = require("../../common/decorators/org.decorator");
let SmtpController = class SmtpController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(orgId) { return this.svc.findAll(orgId); }
    create(orgId, dto) { return this.svc.create(orgId, dto); }
    update(id, orgId, dto) { return this.svc.update(id, orgId, dto); }
    test(id, orgId, email) { return this.svc.test(id, orgId, email); }
    delete(id, orgId) { return this.svc.delete(id, orgId); }
};
exports.SmtpController = SmtpController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SmtpController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, smtp_dto_1.CreateSmtpDto]),
    __metadata("design:returntype", void 0)
], SmtpController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, smtp_dto_1.UpdateSmtpDto]),
    __metadata("design:returntype", void 0)
], SmtpController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/test'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __param(2, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SmtpController.prototype, "test", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SmtpController.prototype, "delete", null);
exports.SmtpController = SmtpController = __decorate([
    (0, swagger_1.ApiTags)('smtp'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('smtp'),
    __metadata("design:paramtypes", [smtp_service_1.SmtpService])
], SmtpController);
//# sourceMappingURL=smtp.controller.js.map