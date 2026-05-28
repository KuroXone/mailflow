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
exports.DomainsService = void 0;
const common_1 = require("@nestjs/common");
const dns = require("dns/promises");
const crypto = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
let DomainsService = class DomainsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.SAFE_SELECT = {
            id: true, orgId: true, domain: true, status: true,
            spfValid: true, dkimValid: true, dmarcValid: true, mxValid: true,
            dkimSelector: true, dkimPublicKey: true, isDefault: true,
            verifiedAt: true, lastCheckedAt: true, createdAt: true,
        };
    }
    async findAll(orgId) {
        return this.prisma.domain.findMany({
            where: { orgId }, orderBy: { createdAt: 'desc' },
            select: this.SAFE_SELECT,
        });
    }
    async create(orgId, domain, selector = 'mail') {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
        const pubDer = publicKey.export({ type: 'spki', format: 'der' });
        const pubB64 = pubDer.toString('base64');
        const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
        const created = await this.prisma.domain.create({
            data: {
                orgId, domain: domain.toLowerCase(), dkimSelector: selector,
                dkimPublicKey: pubB64, dkimPrivateKey: privPem,
                isDefault: !(await this.prisma.domain.findFirst({ where: { orgId } })),
            },
            select: this.SAFE_SELECT,
        });
        return created;
    }
    async getRecords(id, orgId) {
        const d = await this.prisma.domain.findFirst({ where: { id, orgId } });
        if (!d)
            throw new common_1.NotFoundException('Domain not found');
        const dkimValue = `v=DKIM1; k=rsa; p=${d.dkimPublicKey}`;
        return {
            domain: d.domain,
            selector: d.dkimSelector,
            records: {
                spf: {
                    type: 'TXT', host: d.domain,
                    value: 'v=spf1 a mx include:sendgrid.net ~all',
                },
                dkim: {
                    type: 'TXT', host: `${d.dkimSelector}._domainkey.${d.domain}`,
                    value: dkimValue,
                },
                dmarc: {
                    type: 'TXT', host: `_dmarc.${d.domain}`,
                    value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${d.domain}`,
                },
            },
        };
    }
    async verify(id, orgId) {
        const d = await this.prisma.domain.findFirst({ where: { id, orgId } });
        if (!d)
            throw new common_1.NotFoundException('Domain not found');
        const results = await this.checkAll(d.domain, d.dkimSelector, d.dkimPublicKey);
        const allValid = results.spf && results.dkim && results.dmarc;
        const anyValid = results.spf || results.dkim || results.dmarc;
        await this.prisma.domain.update({
            where: { id },
            data: {
                spfValid: results.spf,
                dkimValid: results.dkim,
                dmarcValid: results.dmarc,
                mxValid: results.mx,
                status: allValid ? 'ACTIVE' : anyValid ? 'PARTIAL' : 'PENDING',
                verifiedAt: allValid ? new Date() : undefined,
                lastCheckedAt: new Date(),
            },
        });
        return { ...results, status: allValid ? 'ACTIVE' : anyValid ? 'PARTIAL' : 'PENDING' };
    }
    async delete(id, orgId) {
        await this.prisma.domain.delete({ where: { id } });
        return { message: 'Domain deleted' };
    }
    async checkAll(domain, selector, pubKey) {
        const [spf, dkim, dmarc, mx] = await Promise.all([
            this.checkSpf(domain),
            this.checkDkim(domain, selector, pubKey),
            this.checkDmarc(domain),
            this.checkMx(domain),
        ]);
        return { spf, dkim, dmarc, mx };
    }
    async checkSpf(domain) {
        try {
            const records = await dns.resolveTxt(domain);
            return records.flat().some(r => r.startsWith('v=spf1'));
        }
        catch {
            return false;
        }
    }
    async checkDkim(domain, selector, pubKey) {
        try {
            const records = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
            const flat = records.flat().join('');
            return flat.includes('v=DKIM1') && flat.includes(pubKey.substring(0, 20));
        }
        catch {
            return false;
        }
    }
    async checkDmarc(domain) {
        try {
            const records = await dns.resolveTxt(`_dmarc.${domain}`);
            return records.flat().some(r => r.startsWith('v=DMARC1'));
        }
        catch {
            return false;
        }
    }
    async checkMx(domain) {
        try {
            const records = await dns.resolveMx(domain);
            return records.length > 0;
        }
        catch {
            return false;
        }
    }
};
exports.DomainsService = DomainsService;
exports.DomainsService = DomainsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DomainsService);
//# sourceMappingURL=domains.service.js.map