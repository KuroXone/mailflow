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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TemplatesService = class TemplatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId, query = {}) {
        const { category, search } = query;
        const where = {
            OR: [{ orgId }, { isGlobal: true }],
        };
        if (category)
            where.category = category;
        if (search)
            where.name = { contains: search, mode: 'insensitive' };
        return this.prisma.emailTemplate.findMany({
            where, orderBy: [{ isGlobal: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async findOne(id, orgId) {
        const tmpl = await this.prisma.emailTemplate.findFirst({
            where: { id, OR: [{ orgId }, { isGlobal: true }] },
        });
        if (!tmpl)
            throw new common_1.NotFoundException('Template not found');
        return tmpl;
    }
    async create(orgId, dto) {
        return this.prisma.emailTemplate.create({ data: { orgId, ...dto } });
    }
    async update(id, orgId, dto) {
        await this.findOne(id, orgId);
        return this.prisma.emailTemplate.update({ where: { id }, data: dto });
    }
    async delete(id, orgId) {
        await this.prisma.emailTemplate.delete({ where: { id } });
        return { message: 'Template deleted' };
    }
    async duplicate(id, orgId) {
        const tmpl = await this.findOne(id, orgId);
        const { id: _id, isGlobal, createdAt, updatedAt, usageCount, ...rest } = tmpl;
        return this.prisma.emailTemplate.create({ data: { ...rest, orgId, name: `Copy of ${tmpl.name}`, isGlobal: false } });
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map