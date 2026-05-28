import { Job } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class CsvProcessor {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleCsvImport(job: Job<{
        orgId: string;
        listId: string;
        filePath: string;
    }>): Promise<{
        imported: number;
        skipped: number;
    }>;
}
