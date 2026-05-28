import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

const PLAN_PRICES: Record<string, string> = {
  STARTER: 'price_starter',
  GROWTH: 'price_growth',
  PRO: 'price_pro',
  ENTERPRISE: 'price_enterprise',
};

const PLAN_LIMITS: Record<string, { contacts: number; emailsPerMonth: number }> = {
  FREE: { contacts: 500, emailsPerMonth: 1000 },
  STARTER: { contacts: 5000, emailsPerMonth: 50000 },
  GROWTH: { contacts: 25000, emailsPerMonth: 250000 },
  PRO: { contacts: 100000, emailsPerMonth: 1000000 },
  ENTERPRISE: { contacts: -1, emailsPerMonth: -1 },
};

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    const key = config.get<string>('stripe.secretKey');
    if (key) this.stripe = new Stripe(key, { apiVersion: '2023-10-16' });
  }

  async getSubscription(orgId: string) {
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

  async createCheckoutSession(orgId: string, userId: string, plan: string, returnUrl: string) {
    if (!this.stripe) throw new BadRequestException('Billing not configured');
    const priceId = PLAN_PRICES[plan];
    if (!priceId) throw new BadRequestException('Invalid plan');

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

  async createPortalSession(orgId: string, returnUrl: string) {
    if (!this.stripe) throw new BadRequestException('Billing not configured');

    const sub = await this.prisma.subscription.findFirst({
      where: { orgId, status: 'ACTIVE' },
    });
    if (!sub?.stripeCustomerId) throw new BadRequestException('No active subscription');

    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>('stripe.webhookSecret');
    if (!webhookSecret || !this.stripe) return;

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { orgId } = session.metadata || {};
    if (!orgId) return;

    const stripeSubscription = await this.stripe.subscriptions.retrieve(session.subscription as string);
    const priceId = stripeSubscription.items.data[0]?.price.id;
    const plan = Object.entries(PLAN_PRICES).find(([, p]) => p === priceId)?.[0] || 'STARTER';

    await this.prisma.$transaction([
      this.prisma.subscription.upsert({
        where: { orgId },
        create: {
          orgId,
          plan: plan as any,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: stripeSubscription.id,
          stripePriceId: priceId,
          status: 'ACTIVE' as any,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        } as any,
        update: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: stripeSubscription.id,
          stripePriceId: priceId,
          status: 'ACTIVE' as any,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        },
      }),
      this.prisma.organization.update({
        where: { id: orgId },
        data: { plan: plan as any },
      }),
    ]);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const sub = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!sub) return;

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
        data: { plan: plan as any },
      });
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const sub = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!sub) return;

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

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    const sub = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });
    if (!sub) return;

    await this.prisma.invoice.create({
      data: {
        orgId: sub.orgId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'PAID',
        paidAt: new Date(invoice.status_transitions?.paid_at! * 1000),
        invoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
      },
    });
  }

  private async handleInvoiceFailed(invoice: Stripe.Invoice) {
    const sub = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });
    if (!sub) return;

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

  async getInvoices(orgId: string) {
    return this.prisma.invoice.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUsage(orgId: string) {
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
}
