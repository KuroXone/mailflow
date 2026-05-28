import { Injectable, NotFoundException } from '@nestjs/common';
import * as dns from 'dns/promises';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DomainsService {
  constructor(private prisma: PrismaService) {}

  private readonly SAFE_SELECT = {
    id: true, orgId: true, domain: true, status: true,
    spfValid: true, dkimValid: true, dmarcValid: true, mxValid: true,
    dkimSelector: true, dkimPublicKey: true, isDefault: true,
    verifiedAt: true, lastCheckedAt: true, createdAt: true,
  } as const;

  async findAll(orgId: string) {
    return this.prisma.domain.findMany({
      where: { orgId }, orderBy: { createdAt: 'desc' },
      select: this.SAFE_SELECT,
    });
  }

  async create(orgId: string, domain: string, selector = 'mail') {
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

  async getRecords(id: string, orgId: string) {
    const d = await this.prisma.domain.findFirst({ where: { id, orgId } });
    if (!d) throw new NotFoundException('Domain not found');

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

  async verify(id: string, orgId: string) {
    const d = await this.prisma.domain.findFirst({ where: { id, orgId } });
    if (!d) throw new NotFoundException('Domain not found');

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

  async delete(id: string, orgId: string) {
    await this.prisma.domain.delete({ where: { id } });
    return { message: 'Domain deleted' };
  }

  private async checkAll(domain: string, selector: string, pubKey: string) {
    const [spf, dkim, dmarc, mx] = await Promise.all([
      this.checkSpf(domain),
      this.checkDkim(domain, selector, pubKey),
      this.checkDmarc(domain),
      this.checkMx(domain),
    ]);
    return { spf, dkim, dmarc, mx };
  }

  private async checkSpf(domain: string): Promise<boolean> {
    try {
      const records = await dns.resolveTxt(domain);
      return records.flat().some(r => r.startsWith('v=spf1'));
    } catch { return false; }
  }

  private async checkDkim(domain: string, selector: string, pubKey: string): Promise<boolean> {
    try {
      const records = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
      const flat = records.flat().join('');
      return flat.includes('v=DKIM1') && flat.includes(pubKey.substring(0, 20));
    } catch { return false; }
  }

  private async checkDmarc(domain: string): Promise<boolean> {
    try {
      const records = await dns.resolveTxt(`_dmarc.${domain}`);
      return records.flat().some(r => r.startsWith('v=DMARC1'));
    } catch { return false; }
  }

  private async checkMx(domain: string): Promise<boolean> {
    try {
      const records = await dns.resolveMx(domain);
      return records.length > 0;
    } catch { return false; }
  }
}
