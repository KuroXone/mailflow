import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as fs from 'fs';
import { parse } from 'csv-parse';
import { PrismaService } from '../../../prisma/prisma.service';

@Processor('csv-import')
export class CsvProcessor {
  private readonly logger = new Logger(CsvProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('import-csv')
  async handleCsvImport(job: Job<{ orgId: string; listId: string; filePath: string }>) {
    const { orgId, listId, filePath } = job.data;
    this.logger.log(`Processing CSV import for org ${orgId}, list ${listId}`);

    let imported = 0;
    let skipped = 0;

    try {
      const records: any[] = await new Promise((resolve, reject) => {
        const rows: any[] = [];
        fs.createReadStream(filePath)
          .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
          .on('data', (row) => rows.push(row))
          .on('end', () => resolve(rows))
          .on('error', reject);
      });

      for (const row of records) {
        const email = (row.email || row.Email || row.EMAIL || '').trim().toLowerCase();
        if (!email || !email.includes('@')) { skipped++; continue; }

        try {
          const contact = await this.prisma.contact.upsert({
            where: { orgId_email: { orgId, email } },
            create: {
              orgId, email,
              firstName: row.first_name || row.firstName || row['First Name'] || undefined,
              lastName: row.last_name || row.lastName || row['Last Name'] || undefined,
            },
            update: {},
          });

          await this.prisma.contactListMember.upsert({
            where: { listId_contactId: { listId, contactId: contact.id } },
            create: { listId, contactId: contact.id },
            update: {},
          });

          imported++;
        } catch { skipped++; }
      }

      await this.prisma.contactList.update({
        where: { id: listId },
        data: { count: { increment: imported } },
      });

      this.logger.log(`CSV import complete: ${imported} imported, ${skipped} skipped`);
    } finally {
      try { fs.unlinkSync(filePath); } catch {}
    }

    return { imported, skipped };
  }
}
