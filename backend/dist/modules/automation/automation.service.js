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
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AutomationService = class AutomationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId) {
        return this.prisma.automation.findMany({
            where: { orgId },
            include: {
                _count: { select: { runs: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, orgId) {
        const automation = await this.prisma.automation.findFirst({ where: { id, orgId } });
        if (!automation)
            throw new common_1.NotFoundException('Automation not found');
        return automation;
    }
    async create(orgId, dto) {
        return this.prisma.automation.create({ data: { orgId, ...dto } });
    }
    async update(id, orgId, dto) {
        await this.findOne(id, orgId);
        return this.prisma.automation.update({ where: { id }, data: dto });
    }
    async delete(id, orgId) {
        await this.findOne(id, orgId);
        await this.prisma.automation.delete({ where: { id } });
        return { message: 'Automation deleted' };
    }
    async activate(id, orgId) {
        await this.findOne(id, orgId);
        return this.prisma.automation.update({ where: { id }, data: { status: 'ACTIVE' } });
    }
    async pause(id, orgId) {
        await this.findOne(id, orgId);
        return this.prisma.automation.update({ where: { id }, data: { status: 'PAUSED' } });
    }
    async getRuns(id, orgId) {
        await this.findOne(id, orgId);
        return this.prisma.automationRun.findMany({
            where: { automationId: id },
            orderBy: { startedAt: 'desc' },
            take: 100,
        });
    }
    async getStats(id, orgId) {
        await this.findOne(id, orgId);
        const [total, completed, failed, running] = await Promise.all([
            this.prisma.automationRun.count({ where: { automationId: id } }),
            this.prisma.automationRun.count({ where: { automationId: id, status: 'COMPLETED' } }),
            this.prisma.automationRun.count({ where: { automationId: id, status: 'FAILED' } }),
            this.prisma.automationRun.count({ where: { automationId: id, status: 'RUNNING' } }),
        ]);
        return { total, completed, failed, running };
    }
};
exports.AutomationService = AutomationService;
exports.AutomationService = AutomationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map