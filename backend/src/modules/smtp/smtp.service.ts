import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSmtpDto, UpdateSmtpDto } from './dto/smtp.dto';

@Injectable()
export class SmtpService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.smtpConfig.findMany({
      where: { orgId }, orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, host: true, port: true, fromEmail: true, fromName: true, isActive: true, isDefault: true, dailyLimit: true, sentToday: true, totalSent: true, lastUsedAt: true, createdAt: true },
    });
  }

  async create(orgId: string, dto: CreateSmtpDto) {
    if (dto.isDefault) {
      await this.prisma.smtpConfig.updateMany({ where: { orgId }, data: { isDefault: false } });
    }
    return this.prisma.smtpConfig.create({ data: { orgId, ...dto } });
  }

  async update(id: string, orgId: string, dto: UpdateSmtpDto) {
    const smtp = await this.prisma.smtpConfig.findFirst({ where: { id, orgId } });
    if (!smtp) throw new NotFoundException();
    if (dto.isDefault) {
      await this.prisma.smtpConfig.updateMany({ where: { orgId }, data: { isDefault: false } });
    }
    return this.prisma.smtpConfig.update({ where: { id }, data: dto });
  }

  async test(id: string, orgId: string, toEmail: string) {
    const smtp = await this.prisma.smtpConfig.findFirst({ where: { id, orgId } });
    if (!smtp) throw new NotFoundException();

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
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async delete(id: string, orgId: string) {
    await this.prisma.smtpConfig.delete({ where: { id } });
    return { message: 'SMTP config deleted' };
  }
}
