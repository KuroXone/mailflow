import { RawBodyRequest } from '@nestjs/common';
import { BillingService } from './billing.service';
export declare class BillingController {
    private svc;
    constructor(svc: BillingService);
    getSubscription(orgId: string): Promise<{
        plan: import(".prisma/client").$Enums.PlanTier;
        status: string;
        currentPeriodEnd: Date;
        limits: {
            contacts: number;
            emailsPerMonth: number;
        };
    }>;
    createCheckout(orgId: string, user: any, body: {
        plan: string;
        returnUrl: string;
    }): Promise<{
        url: string;
    }>;
    createPortal(orgId: string, body: {
        returnUrl: string;
    }): Promise<{
        url: string;
    }>;
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
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
