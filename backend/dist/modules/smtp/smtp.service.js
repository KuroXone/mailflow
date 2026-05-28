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
exports.SmtpService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const prisma_service_1 = require("../../prisma/prisma.service");
let SmtpService = class SmtpService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId) {
        return this.prisma.smtpConfig.findMany({
            where: { orgId }, orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, host: true, port: true, fromEmail: true, fromName: true, isActive: true, isDefault: true, dailyLimit: true, sentToday: true, totalSent: true, lastUsedAt: true, createdAt: true },
        });
    }
    async create(orgId, dto) {
        if (dto.isDefault) {
            await this.prisma.smtpConfig.updateMany({ where: { orgId }, data: { isDefault: false } });
        }
        return this.prisma.smtpConfig.create({ data: { orgId, ...dto } });
    }
    async update(id, orgId, dto) {
        const smtp = await this.prisma.smtpConfig.findFirst({ where: { id, orgId } });
        if (!smtp)
            throw new common_1.NotFoundException();
        if (dto.isDefault) {
            await this.prisma.smtpConfig.updateMany({ where: { orgId }, data: { isDefault: false } });
        }
        return this.prisma.smtpConfig.update({ where: { id }, data: dto });
    }
    async test(id, orgId, toEmail) {
        const smtp = await this.prisma.smtpConfig.findFirst({ where: { id, orgId } });
        if (!smtp)
            throw new common_1.NotFoundException();
        const transporter = nodemailer.createTransport({
            host: smtp.host, port: smtp.port, secure: smtp.secure,
            auth: { user: smtp.authUser, pass: smtp.authPass },
        });
        try {
            await transporter.verify();
            await transporter.sendMail({
                from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
                to: toEmail,
                subject: 'MailFlow SMTP Test',
                html: `<p>✓ Your SMTP configuration is working correctly.</p><p>Server: ${smtp.host}:${smtp.port}</p>`,
            });
            return { success: true, message: 'Test email sent successfully' };
        }
        catch (err) {
            return { success: false, message: err.message };
        }
    }
    async delete(id, orgId) {
        await this.prisma.smtpConfig.delete({ where: { id } });
        return { message: 'SMTP config deleted' };
    }
};
exports.SmtpService = SmtpService;
exports.SmtpService = SmtpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SmtpService);
//# sourceMappingURL=smtp.service.js.map