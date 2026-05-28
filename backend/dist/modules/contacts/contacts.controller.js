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
exports.ContactsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const contacts_service_1 = require("./contacts.service");
const contact_dto_1 = require("./dto/contact.dto");
const org_decorator_1 = require("../../common/decorators/org.decorator");
let ContactsController = class ContactsController {
    constructor(svc) {
        this.svc = svc;
    }
    getLists(orgId) { return this.svc.getLists(orgId); }
    createList(orgId, dto) { return this.svc.createList(orgId, dto); }
    deleteList(id, orgId) { return this.svc.deleteList(id, orgId); }
    getStats(orgId) { return this.svc.getStats(orgId); }
    getTags(orgId) { return this.svc.getTags(orgId); }
    findAll(orgId, query) { return this.svc.findAll(orgId, query); }
    findOne(id, orgId) { return this.svc.findOne(id, orgId); }
    create(orgId, dto) { return this.svc.create(orgId, dto); }
    update(id, orgId, dto) {
        return this.svc.update(id, orgId, dto);
    }
    delete(id, orgId) { return this.svc.delete(id, orgId); }
    addTag(id, orgId, tag) {
        return this.svc.addTag(id, orgId, tag);
    }
    removeTag(id, orgId, tag) {
        return this.svc.removeTag(id, orgId, tag);
    }
    import(orgId, listId, file) {
        return this.svc.importCsv(orgId, listId, file);
    }
    addToList(listId, contactId, orgId) {
        return this.svc.addToList(listId, contactId, orgId);
    }
    removeFromList(listId, contactId) {
        return this.svc.removeFromList(listId, contactId);
    }
};
exports.ContactsController = ContactsController;
__decorate([
    (0, common_1.Get)('lists'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "getLists", null);
__decorate([
    (0, common_1.Post)('lists'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contact_dto_1.CreateListDto]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "createList", null);
__decorate([
    (0, common_1.Delete)('lists/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "deleteList", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('tags'),
    __param(0, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "getTags", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contact_dto_1.CreateContactDto]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, contact_dto_1.UpdateContactDto]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/tags'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __param(2, (0, common_1.Body)('tag')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "addTag", null);
__decorate([
    (0, common_1.Delete)(':id/tags/:tag'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_decorator_1.OrgId)()),
    __param(2, (0, common_1.Param)('tag')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "removeTag", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.diskStorage)({ destination: '/tmp' }) })),
    __param(0, (0, org_decorator_1.OrgId)()),
    __param(1, (0, common_1.Query)('listId')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "import", null);
__decorate([
    (0, common_1.Post)('lists/:listId/contacts/:contactId'),
    __param(0, (0, common_1.Param)('listId')),
    __param(1, (0, common_1.Param)('contactId')),
    __param(2, (0, org_decorator_1.OrgId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "addToList", null);
__decorate([
    (0, common_1.Delete)('lists/:listId/contacts/:contactId'),
    __param(0, (0, common_1.Param)('listId')),
    __param(1, (0, common_1.Param)('contactId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "removeFromList", null);
exports.ContactsController = ContactsController = __decorate([
    (0, swagger_1.ApiTags)('contacts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('contacts'),
    __metadata("design:paramtypes", [contacts_service_1.ContactsService])
], ContactsController);
//# sourceMappingURL=contacts.controller.js.map