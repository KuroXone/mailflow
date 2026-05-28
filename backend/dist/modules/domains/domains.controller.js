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
exports.DomainsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const domains_service_1 = require("./domains.service");
const org_decorator_1 = require("../../common/decorators/org.decorator");
let DomainsController = class DomainsController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(orgId) { return this.svc.findAll(orgId); }
    create(orgId, body) {
        return this.svc.create(orgId, body.domain, body.selector);
    }
    getRecords(id, orgId) { return this.svc.getRecords(id, orgId); }
    verify(id, orgId) { return this.svc.verify(id, orgId); }
    delete(id, orgId) { return this.svc.delete(id, orgId); }
};
exports.DomainsController = DomainsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DomainsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DomainsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id/records'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DomainsController.prototype, "getRecords", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DomainsController.prototype, "verify", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DomainsController.prototype, "delete", null);
exports.DomainsController = DomainsController = __decorate([
    (0, swagger_1.ApiTags)('domains'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('domains'),
    __metadata("design:paramtypes", [domains_service_1.DomainsService])
], DomainsController);
//# sourceMappingURL=domains.controller.js.map