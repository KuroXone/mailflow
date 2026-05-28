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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
let ContactsService = class ContactsService {
    constructor(prisma, queue) {
        this.prisma = prisma;
        this.queue = queue;
    }
    async getLists(orgId) {
        return this.prisma.contactList.findMany({
            where: { orgId }, orderBy: { createdAt: 'desc' },
            include: { _count: { select: { members: true } } },
        });
    }
    async createList(orgId, dto) {
        return this.prisma.contactList.create({ data: { orgId, ...dto } });
    }
    async deleteList(id, orgId) {
        const list = await this.prisma.contactList.findFirst({ where: { id, orgId } });
        if (!list)
            throw new common_1.NotFoundException('List not found');
        await this.prisma.contactList.delete({ where: { id } });
        return { message: 'List deleted' };
    }
    async findAll(orgId, query) {
        const { page = 1, limit = 50, search, status, listId, tag } = query;
        const where = { orgId };
        if (status)
            where.status = status;
        if (search)
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        if (listId)
            where.listMemberships = { some: { listId } };
        if (tag)
            where.tags = { has: tag };
        const [items, total] = await Promise.all([
            this.prisma.contact.findMany({
                where, skip: (page - 1) * limit, take: limit,
                orderBy: { createdAt: 'desc' },
                include: { listMemberships: { include: { list: { select: { id: true, name: true } } } } },
            }),
            this.prisma.contact.count({ where }),
        ]);
        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id, orgId) {
        const contact = await this.prisma.contact.findFirst({
            where: { id, orgId },
            include: {
                listMemberships: { include: { list: true } },
                emailLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
            },
        });
        if (!contact)
            throw new common_1.NotFoundException('Contact not found');
        return contact;
    }
    async create(orgId, dto) {
        const exists = await this.prisma.contact.findFirst({ where: { orgId, email: dto.email.toLowerCase() } });
        if (exists)
            throw new common_1.ConflictException('Contact with this email already exists');
        const contact = await this.prisma.contact.create({
            data: { orgId, ...dto, email: dto.email.toLowerCase() },
        });
        if (dto.listId) {
            await this.addToList(dto.listId, contact.id, orgId);
        }
        await this.prisma.organization.update({
            where: { id: orgId },
            data: { contactsCount: { increment: 1 } },
        });
        return contact;
    }
    async upsert(orgId, dto) {
        return this.prisma.contact.upsert({
            where: { orgId_email: { orgId, email: dto.email.toLowerCase() } },
            create: { orgId, ...dto, email: dto.email.toLowerCase() },
            update: { firstName: dto.firstName, lastName: dto.lastName, customFields: dto.customFields },
        });
    }
    async update(id, orgId, dto) {
        await this.findOne(id, orgId);
        return this.prisma.contact.update({ where: { id }, data: dto });
    }
    async delete(id, orgId) {
        await this.findOne(id, orgId);
        await this.prisma.contact.delete({ where: { id } });
        await this.prisma.organization.update({ where: { id: orgId }, data: { contactsCount: { decrement: 1 } } });
        return { message: 'Contact deleted' };
    }
    async addToList(listId, contactId, orgId) {
        const list = await this.prisma.contactList.findFirst({ where: { id: listId, orgId } });
        if (!list)
            throw new common_1.NotFoundException('List not found');
        await this.prisma.contactListMember.upsert({
            where: { listId_contactId: { listId, contactId } },
            create: { listId, contactId },
            update: {},
        });
        await this.prisma.contactList.update({ where: { id: listId }, data: { count: { increment: 1 } } });
        return { message: 'Added to list' };
    }
    async removeFromList(listId, contactId) {
        await this.prisma.contactListMember.delete({ where: { listId_contactId: { listId, contactId } } });
        await this.prisma.contactList.update({ where: { id: listId }, data: { count: { decrement: 1 } } });
        return { message: 'Removed from list' };
    }
    async addTag(id, orgId, tag) {
        const contact = await this.findOne(id, orgId);
        const tags = [...new Set([...contact.tags, tag])];
        return this.prisma.contact.update({ where: { id }, data: { tags } });
    }
    async removeTag(id, orgId, tag) {
        const contact = await this.findOne(id, orgId);
        return this.prisma.contact.update({ where: { id }, data: { tags: contact.tags.filter(t => t !== tag) } });
    }
    async importCsv(orgId, listId, file) {
        return this.queue.enqueueCsvImport({ orgId, listId, filePath: file.path });
    }
    async unsubscribe(email, orgId) {
        await this.prisma.contact.updateMany({
            where: { email: email.toLowerCase(), orgId },
            data: { status: 'UNSUBSCRIBED' },
        });
        return { message: 'Unsubscribed' };
    }
    async getStats(orgId) {
        const [total, subscribed, unsubscribed, bounced] = await Promise.all([
            this.prisma.contact.count({ where: { orgId } }),
            this.prisma.contact.count({ where: { orgId, status: 'SUBSCRIBED' } }),
            this.prisma.contact.count({ where: { orgId, status: 'UNSUBSCRIBED' } }),
            this.prisma.contact.count({ where: { orgId, status: 'BOUNCED' } }),
        ]);
        return { total, subscribed, unsubscribed, bounced };
    }
    async getTags(orgId) {
        const contacts = await this.prisma.contact.findMany({ where: { orgId }, select: { tags: true } });
        const tags = [...new Set(contacts.flatMap(c => c.tags))];
        return tags.sort();
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, queue_service_1.QueueService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map