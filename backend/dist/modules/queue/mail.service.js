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
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let MailService = class MailService {
    constructor(config) {
        this.config = config;
        this.transporter = nodemailer.createTransport({
            host: config.get('smtp.host'),
            port: config.get('smtp.port'),
            secure: config.get('smtp.secure'),
            auth: { user: config.get('smtp.user'), pass: config.get('smtp.pass') },
        });
    }
    async send(to, subject, html) {
        try {
            await this.transporter.sendMail({
                from: `"${this.config.get('smtp.fromName')}" <${this.config.get('smtp.fromEmail')}>`,
                to,
                subject,
                html,
            });
        }
        catch (e) {
            console.error('Mail send error:', e.message);
        }
    }
    async sendVerification(email, name, token) {
        const url = `${this.config.get('frontendUrl')}/verify-email?token=${token}`;
        await this.send(email, 'Verify your MailFlow account', `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Hi ${name}, verify your email</h2>
        <p>Click the button below to verify your MailFlow account.</p>
        <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
        <p style="color:#888;font-size:12px;margin-top:24px">Link expires in 24 hours.</p>
      </div>
    `);
    }
    async sendPasswordReset(email, name, token) {
        const url = `${this.config.get('frontendUrl')}/reset-password?token=${token}`;
        await this.send(email, 'Reset your MailFlow password', `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Hi ${name}, reset your password</h2>
        <p>Click below to set a new password. Link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#888;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
      </div>
    `);
    }
    async sendTeamInvite(email, inviterName, orgName, token) {
        const url = `${this.config.get('frontendUrl')}/accept-invite?token=${token}`;
        await this.send(email, `${inviterName} invited you to ${orgName}`, `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>You're invited to ${orgName}</h2>
        <p>${inviterName} has invited you to join their MailFlow workspace.</p>
        <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Accept Invitation</a>
        <p style="color:#888;font-size:12px;margin-top:24px">Invite expires in 7 days.</p>
      </div>
    `);
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map