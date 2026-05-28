import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export declare class BillingService {
    private prisma;
    private config;
    private stripe;
    constructor(prisma: PrismaService, config: ConfigService);
    getSubscription(orgId: string): Promise<{
        plan: import(".prisma/client").$Enums.PlanTier;
        status: string;
        currentPeriodEnd: Date;
        limits: {
            contacts: number;
            emailsPerMonth: number;
        };
    }>;
    createCheckoutSession(orgId: string, userId: string, plan: string, returnUrl: string): Promise<{
        url: string;
    }>;
    createPortalSession(orgId: string, returnUrl: string): Promise<{
        url: string;
    }>;
    handleWebhook(rawBody: Buffer, signature: string): Promise<void>;
    private handleCheckoutCompleted;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    private handleInvoicePaid;
    private handleInvoiceFailed;
    getInvoices(orgId: string): Promise<{
        id: string;
        createdAt: Date;
        orgId: string;
        status: string;
        stripeInvoiceId: string | null;
        amount: number;
        currency: string;
        paidAt: Date | null;
        invoiceUrl: string | null;
        invoicePdf: string | null;
    }[]>;
    getUsage(orgId: string): Promise<{
        contacts: number;
        emailsSent: number;
        limits: {
            contacts: number;
            emailsPerMonth: number;
        };
    }>;
}
