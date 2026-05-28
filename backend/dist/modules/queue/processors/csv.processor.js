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
var CsvProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const fs = require("fs");
const csv_parse_1 = require("csv-parse");
const prisma_service_1 = require("../../../prisma/prisma.service");
let CsvProcessor = CsvProcessor_1 = class CsvProcessor {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CsvProcessor_1.name);
    }
    async handleCsvImport(job) {
        const { orgId, listId, filePath } = job.data;
        this.logger.log(`Processing CSV import for org ${orgId}, list ${listId}`);
        let imported = 0;
        let skipped = 0;
        try {
            const records = await new Promise((resolve, reject) => {
                const rows = [];
                fs.createReadStream(filePath)
                    .pipe((0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true, trim: true }))
                    .on('data', (row) => rows.push(row))
                    .on('end', () => resolve(rows))
                    .on('error', reject);
            });
            for (const row of records) {
                const email = (row.email || row.Email || row.EMAIL || '').trim().toLowerCase();
                if (!email || !email.includes('@')) {
                    skipped++;
                    continue;
                }
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
                }
                catch {
                    skipped++;
                }
            }
            await this.prisma.contactList.update({
                where: { id: listId },
                data: { count: { increment: imported } },
            });
            this.logger.log(`CSV import complete: ${imported} imported, ${skipped} skipped`);
        }
        finally {
            try {
                fs.unlinkSync(filePath);
            }
            catch { }
        }
        return { imported, skipped };
    }
};
exports.CsvProcessor = CsvProcessor;
__decorate([
    (0, bull_1.Process)('import-csv'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CsvProcessor.prototype, "handleCsvImport", null);
exports.CsvProcessor = CsvProcessor = CsvProcessor_1 = __decorate([
    (0, bull_1.Processor)('csv-import'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CsvProcessor);
//# sourceMappingURL=csv.processor.js.map