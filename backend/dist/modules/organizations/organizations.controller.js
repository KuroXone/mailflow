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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const organizations_service_1 = require("./organizations.service");
const org_decorator_1 = require("../../common/decorators/org.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let OrganizationsController = class OrganizationsController {
    constructor(svc) {
        this.svc = svc;
    }
    getCurrent(orgId) { return this.svc.findOne(orgId); }
    update(orgId, dto) { return this.svc.update(orgId, dto); }
    getMembers(orgId) { return this.svc.getMembers(orgId); }
    updateRole(orgId, id, body, user) {
        return this.svc.updateMemberRole(orgId, id, body.role, user.id);
    }
    removeMember(orgId, id, user) {
        return this.svc.removeMember(orgId, id, user.id);
    }
    getInvitations(orgId) { return this.svc.getInvitations(orgId); }
    invite(orgId, user, body) {
        return this.svc.inviteMember(orgId, body.email, body.role, user.id);
    }
    cancelInvite(orgId, id) {
        return this.svc.cancelInvitation(orgId, id);
    }
    acceptInvite(body, user) {
        return this.svc.acceptInvitation(body.token, user?.id);
    }
    getApiKeys(orgId) { return this.svc.getApiKeys(orgId); }
    createApiKey(orgId, user, body) {
        return this.svc.createApiKey(orgId, user.id, body.name, body.permissions);
    }
    deleteApiKey(orgId, id) {
        return this.svc.deleteApiKey(orgId, id);
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Put)('current'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('members'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Put)('members/:id/role'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('members/:id'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)('invitations'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "getInvitations", null);
__decorate([
    (0, common_1.Post)('invite'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "invite", null);
__decorate([
    (0, common_1.Delete)('invitations/:id'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "cancelInvite", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('accept-invite'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.Get)('api-keys'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "getApiKeys", null);
__decorate([
    (0, common_1.Post)('api-keys'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "createApiKey", null);
__decorate([
    (0, common_1.Delete)('api-keys/:id'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "deleteApiKey", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, swagger_1.ApiTags)('organizations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('organizations'),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map