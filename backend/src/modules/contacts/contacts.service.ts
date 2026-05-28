import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { CreateContactDto, UpdateContactDto, CreateListDto, ImportCsvDto } from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService, private queue: QueueService) {}

  // ── Lists ────────────────────────────────────────────────────────────────────

  async getLists(orgId: string) {
    return this.prisma.contactList.findMany({
      where: { orgId }, orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true } } },
    });
  }

  async createList(orgId: string, dto: CreateListDto) {
    return this.prisma.contactList.create({ data: { orgId, ...dto } });
  }

  async deleteList(id: string, orgId: string) {
    const list = await this.prisma.contactList.findFirst({ where: { id, orgId } });
    if (!list) throw new NotFoundException('List not found');
    await this.prisma.contactList.delete({ where: { id } });
    return { message: 'List deleted' };
  }

  // ── Contacts ─────────────────────────────────────────────────────────────────

  async findAll(orgId: string, query: any) {
    const { page = 1, limit = 50, search, status, listId, tag } = query;
    const where: any = { orgId };

    if (status) where.status = status;
    if (search) where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
    if (listId) where.listMemberships = { some: { listId } };
    if (tag) where.tags = { has: tag };

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

  async findOne(id: string, orgId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, orgId },
      include: {
        listMemberships: { include: { list: true } },
        emailLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async create(orgId: string, dto: CreateContactDto) {
    const exists = await this.prisma.contact.findFirst({ where: { orgId, email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('Contact with this email already exists');

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

  async upsert(orgId: string, dto: CreateContactDto) {
    return this.prisma.contact.upsert({
      where: { orgId_email: { orgId, email: dto.email.toLowerCase() } },
      create: { orgId, ...dto, email: dto.email.toLowerCase() },
      update: { firstName: dto.firstName, lastName: dto.lastName, customFields: dto.customFields },
    });
  }

  async update(id: string, orgId: string, dto: UpdateContactDto) {
    await this.findOne(id, orgId);
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  async delete(id: string, orgId: string) {
    await this.findOne(id, orgId);
    await this.prisma.contact.delete({ where: { id } });
    await this.prisma.organization.update({ where: { id: orgId }, data: { contactsCount: { decrement: 1 } } });
    return { message: 'Contact deleted' };
  }

  async addToList(listId: string, contactId: string, orgId: string) {
    const list = await this.prisma.contactList.findFirst({ where: { id: listId, orgId } });
    if (!list) throw new NotFoundException('List not found');

    await this.prisma.contactListMember.upsert({
      where: { listId_contactId: { listId, contactId } },
      create: { listId, contactId },
      update: {},
    });

    await this.prisma.contactList.update({ where: { id: listId }, data: { count: { increment: 1 } } });
    return { message: 'Added to list' };
  }

  async removeFromList(listId: string, contactId: string) {
    await this.prisma.contactListMember.delete({ where: { listId_contactId: { listId, contactId } } });
    await this.prisma.contactList.update({ where: { id: listId }, data: { count: { decrement: 1 } } });
    return { message: 'Removed from list' };
  }

  async addTag(id: string, orgId: string, tag: string) {
    const contact = await this.findOne(id, orgId);
    const tags = [...new Set([...contact.tags, tag])];
    return this.prisma.contact.update({ where: { id }, data: { tags } });
  }

  async removeTag(id: string, orgId: string, tag: string) {
    const contact = await this.findOne(id, orgId);
    return this.prisma.contact.update({ where: { id }, data: { tags: contact.tags.filter(t => t !== tag) } });
  }

  async importCsv(orgId: string, listId: string, file: Express.Multer.File) {
    return this.queue.enqueueCsvImport({ orgId, listId, filePath: file.path });
  }

  async unsubscribe(email: string, orgId: string) {
    await this.prisma.contact.updateMany({
      where: { email: email.toLowerCase(), orgId },
      data: { status: 'UNSUBSCRIBED' },
    });
    return { message: 'Unsubscribed' };
  }

  async getStats(orgId: string) {
    const [total, subscribed, unsubscribed, bounced] = await Promise.all([
      this.prisma.contact.count({ where: { orgId } }),
      this.prisma.contact.count({ where: { orgId, status: 'SUBSCRIBED' } }),
      this.prisma.contact.count({ where: { orgId, status: 'UNSUBSCRIBED' } }),
      this.prisma.contact.count({ where: { orgId, status: 'BOUNCED' } }),
    ]);
    return { total, subscribed, unsubscribed, bounced };
  }

  async getTags(orgId: string) {
    const contacts = await this.prisma.contact.findMany({ where: { orgId }, select: { tags: true } });
    const tags = [...new Set(contacts.flatMap(c => c.tags))];
    return tags.sort();
  }
}
