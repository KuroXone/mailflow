import { PrismaService } from '../../prisma/prisma.service';
export declare class DomainsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly SAFE_SELECT;
    findAll(orgId: string): Promise<{
        domain: string;
        id: string;
        orgId: string;
        status: import(".prisma/client").$Enums.DomainStatus;
        spfValid: boolean;
        dkimValid: boolean;
        dmarcValid: boolean;
        mxValid: boolean;
        dkimSelector: string;
        dkimPublicKey: string;
        isDefault: boolean;
        verifiedAt: Date;
        lastCheckedAt: Date;
        createdAt: Date;
    }[]>;
    create(orgId: string, domain: string, selector?: string): Promise<{
        domain: string;
        id: string;
        orgId: string;
        status: import(".prisma/client").$Enums.DomainStatus;
        spfValid: boolean;
        dkimValid: boolean;
        dmarcValid: boolean;
        mxValid: boolean;
        dkimSelector: string;
        dkimPublicKey: string;
        isDefault: boolean;
        verifiedAt: Date;
        lastCheckedAt: Date;
        createdAt: Date;
    }>;
    getRecords(id: string, orgId: string): Promise<{
        domain: string;
        selector: string;
        records: {
            spf: {
                type: string;
                host: string;
                value: string;
            };
            dkim: {
                type: string;
                host: string;
                value: string;
            };
            dmarc: {
                type: string;
                host: string;
                value: string;
            };
        };
    }>;
    verify(id: string, orgId: string): Promise<{
        status: string;
        spf: boolean;
        dkim: boolean;
        dmarc: boolean;
        mx: boolean;
    }>;
    delete(id: string, orgId: string): Promise<{
        message: string;
    }>;
    private checkAll;
    private checkSpf;
    private checkDkim;
    private checkDmarc;
    private checkMx;
}
