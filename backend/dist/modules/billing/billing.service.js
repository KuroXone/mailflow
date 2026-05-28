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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const stripe_1 = require("stripe");
const PLAN_PRICES = {
    STARTER: 'price_starter',
    GROWTH: 'price_growth',
    PRO: 'price_pro',
    ENTERPRISE: 'price_enterprise',
};
const PLAN_LIMITS = {
    FREE: { contacts: 500, emailsPerMonth: 1000 },
    STARTER: { contacts: 5000, emailsPerMonth: 50000 },
    GROWTH: { contacts: 25000, emailsPerMonth: 250000 },
    PRO: { contacts: 100000, emailsPerMonth: 1000000 },
    ENTERPRISE: { contacts: -1, emailsPerMonth: -1 },
};
let BillingService = class BillingService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        const key = config.get('stripe.secretKey');
        if (key)
            this.stripe = new stripe_1.default(key, { apiVersion: '2023-10-16' });
    }
    async getSubscription(orgId) {
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
            include: { subscriptions: { where: { status: 'ACTIVE' }, take: 1 } },
        });
        const sub = org?.subscriptions[0];
        return {
            plan: org?.plan || 'FREE',
            status: sub?.status || 'active',
            currentPeriodEnd: sub?.currentPeriodEnd,
            limits: PLAN_LIMITS[org?.plan || 'FREE'],
        };
    }
    async createCheckoutSession(orgId, userId, plan, returnUrl) {
        if (!this.stripe)
            throw new common_1.BadRequestException('Billing not configured');
        const priceId = PLAN_PRICES[plan];
        if (!priceId)
            throw new common_1.BadRequestException('Invalid plan');
        const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
        const session = await this.stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            metadata: { orgId, userId },
            customer_email: org?.billingEmail || undefined,
            success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: returnUrl,
        });
        return { url: session.url };
    }
    async createPortalSession(orgId, returnUrl) {
        if (!this.stripe)
            throw new common_1.BadRequestException('Billing not configured');
        const sub = await this.prisma.subscription.findFirst({
            where: { orgId, status: 'ACTIVE' },
        });
        if (!sub?.stripeCustomerId)
            throw new common_1.BadRequestException('No active subscription');
        const session = await this.stripe.billingPortal.sessions.create({
            customer: sub.stripeCustomerId,
            return_url: returnUrl,
        });
        return { url: session.url };
    }
    async handleWebhook(rawBody, signature) {
        const webhookSecret = this.config.get('stripe.webhookSecret');
        if (!webhookSecret || !this.stripe)
            return;
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await this.handleInvoicePaid(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handleInvoiceFailed(event.data.object);
                break;
        }
    }
    async handleCheckoutCompleted(session) {
        const { orgId } = session.metadata || {};
        if (!orgId)
            return;
        const stripeSubscription = await this.stripe.subscriptions.retrieve(session.subscription);
        const priceId = stripeSubscription.items.data[0]?.price.id;
        const plan = Object.entries(PLAN_PRICES).find(([, p]) => p === priceId)?.[0] || 'STARTER';
        await this.prisma.$transaction([
            this.prisma.subscription.upsert({
                where: { orgId },
                create: {
                    orgId,
                    plan: plan,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: stripeSubscription.id,
                    stripePriceId: priceId,
                    status: 'ACTIVE',
                    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                },
                update: {
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: stripeSubscription.id,
                    stripePriceId: priceId,
                    status: 'ACTIVE',
                    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                },
            }),
            this.prisma.organization.update({
                where: { id: orgId },
                data: { plan: plan },
            }),
        ]);
    }
    async handleSubscriptionUpdated(subscription) {
        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id },
        });
        if (!sub)
            return;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = Object.entries(PLAN_PRICES).find(([, p]) => p === priceId)?.[0];
        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: {
                status: subscription.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
                stripePriceId: priceId,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        });
        if (plan) {
            await this.prisma.organization.update({
                where: { id: sub.orgId },
                data: { plan: plan },
            });
        }
    }
    async handleSubscriptionDeleted(subscription) {
        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscription.id },
        });
        if (!sub)
            return;
        await this.prisma.$transaction([
            this.prisma.subscription.update({
                where: { id: sub.id },
                data: { status: 'CANCELLED' },
            }),
            this.prisma.organization.update({
                where: { id: sub.orgId },
                data: { plan: 'FREE' },
            }),
        ]);
    }
    async handleInvoicePaid(invoice) {
        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription },
        });
        if (!sub)
            return;
        await this.prisma.invoice.create({
            data: {
                orgId: sub.orgId,
                stripeInvoiceId: invoice.id,
                amount: invoice.amount_paid / 100,
                currency: invoice.currency.toUpperCase(),
                status: 'PAID',
                paidAt: new Date(invoice.status_transitions?.paid_at * 1000),
                invoiceUrl: invoice.hosted_invoice_url,
                invoicePdf: invoice.invoice_pdf,
            },
        });
    }
    async handleInvoiceFailed(invoice) {
        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription },
        });
        if (!sub)
            return;
        await this.prisma.invoice.create({
            data: {
                orgId: sub.orgId,
                stripeInvoiceId: invoice.id,
                amount: invoice.amount_due / 100,
                currency: invoice.currency.toUpperCase(),
                status: 'FAILED',
                invoiceUrl: invoice.hosted_invoice_url,
            },
        });
    }
    async getInvoices(orgId) {
        return this.prisma.invoice.findMany({
            where: { orgId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getUsage(orgId) {
        const [contacts, emailsSent] = await Promise.all([
            this.prisma.contact.count({ where: { orgId, status: 'SUBSCRIBED' } }),
            this.prisma.emailLog.count({
                where: {
                    campaign: { orgId },
                    sentAt: { gte: new Date(new Date().setDate(1)) },
                },
            }),
        ]);
        const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
        const limits = PLAN_LIMITS[org?.plan || 'FREE'];
        return { contacts, emailsSent, limits };
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService])
], BillingService);
//# sourceMappingURL=billing.service.js.map