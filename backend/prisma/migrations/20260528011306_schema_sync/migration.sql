-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'STARTER', 'GROWTH', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('SUBSCRIBED', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED', 'CLEANED');

-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'PARTIAL', 'ACTIVE', 'ERROR');

-- CreateEnum
CREATE TYPE "EmailLogStatus" AS ENUM ('QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINED', 'FAILED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('CONTACT_SUBSCRIBED', 'CONTACT_TAG_ADDED', 'FORM_SUBMITTED', 'DATE_BASED', 'CAMPAIGN_OPENED', 'CAMPAIGN_CLICKED', 'API_TRIGGER', 'SEGMENT_ENTERED');

-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'INCOMPLETE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "timezone" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,
    "verifyTokenExp" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "plan" "PlanTier" NOT NULL DEFAULT 'FREE',
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsLimit" INTEGER NOT NULL DEFAULT 500,
    "contactsCount" INTEGER NOT NULL DEFAULT 0,
    "contactsLimit" INTEGER NOT NULL DEFAULT 500,
    "customDomain" TEXT,
    "whitelabel" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "billingEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_members" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
    "invitedBy" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "previewText" TEXT,
    "fromName" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "replyTo" TEXT,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT,
    "jsonContent" JSONB,
    "templateId" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "listIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "segmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludeListIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "trackOpens" BOOLEAN NOT NULL DEFAULT true,
    "trackClicks" BOOLEAN NOT NULL DEFAULT true,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "smtpConfigId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_tests" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL DEFAULT 50,
    "sent" INTEGER NOT NULL DEFAULT 0,
    "opened" INTEGER NOT NULL DEFAULT 0,
    "winner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'SUBSCRIBED',
    "source" TEXT,
    "customFields" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "score" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_lists" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "count" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_list_members" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_list_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segments" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conditions" JSONB NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_fields" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT[],
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "orgId" TEXT,
    "name" TEXT NOT NULL,
    "subject" TEXT,
    "htmlContent" TEXT NOT NULL,
    "jsonContent" JSONB,
    "thumbnail" TEXT,
    "category" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domains" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "DomainStatus" NOT NULL DEFAULT 'PENDING',
    "spfValid" BOOLEAN NOT NULL DEFAULT false,
    "dkimValid" BOOLEAN NOT NULL DEFAULT false,
    "dmarcValid" BOOLEAN NOT NULL DEFAULT false,
    "mxValid" BOOLEAN NOT NULL DEFAULT false,
    "dkimSelector" TEXT NOT NULL DEFAULT 'mail',
    "dkimPublicKey" TEXT,
    "dkimPrivateKey" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smtp_configs" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "secure" BOOLEAN NOT NULL DEFAULT true,
    "authUser" TEXT NOT NULL,
    "authPass" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "dailyLimit" INTEGER NOT NULL DEFAULT 1000,
    "sentToday" INTEGER NOT NULL DEFAULT 0,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smtp_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_analytics" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "sent" INTEGER NOT NULL DEFAULT 0,
    "delivered" INTEGER NOT NULL DEFAULT 0,
    "opened" INTEGER NOT NULL DEFAULT 0,
    "uniqueOpens" INTEGER NOT NULL DEFAULT 0,
    "clicked" INTEGER NOT NULL DEFAULT 0,
    "uniqueClicks" INTEGER NOT NULL DEFAULT 0,
    "bounced" INTEGER NOT NULL DEFAULT 0,
    "complained" INTEGER NOT NULL DEFAULT 0,
    "unsubscribed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "status" "EmailLogStatus" NOT NULL DEFAULT 'QUEUED',
    "smtpConfigId" TEXT,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "bounceType" TEXT,
    "bounceReason" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "opens" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_clicks" (
    "id" TEXT NOT NULL,
    "emailLogId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "link_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automations" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "AutomationStatus" NOT NULL DEFAULT 'DRAFT',
    "triggerType" "TriggerType" NOT NULL,
    "triggerConfig" JSONB,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_runs" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "currentNodeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'running',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "automation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "settings" JSONB,
    "listId" TEXT,
    "embedCode" TEXT,
    "submissions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "contactId" TEXT,
    "data" JSONB NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "plan" "PlanTier" NOT NULL,
    "status" "SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripePriceId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "invoiceUrl" TEXT,
    "invoicePdf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "org_members_orgId_userId_key" ON "org_members"("orgId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "campaigns_orgId_status_idx" ON "campaigns"("orgId", "status");

-- CreateIndex
CREATE INDEX "campaigns_orgId_createdAt_idx" ON "campaigns"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "contacts_orgId_status_idx" ON "contacts"("orgId", "status");

-- CreateIndex
CREATE INDEX "contacts_orgId_createdAt_idx" ON "contacts"("orgId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_orgId_email_key" ON "contacts"("orgId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "contact_list_members_listId_contactId_key" ON "contact_list_members"("listId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_fields_orgId_key_key" ON "custom_fields"("orgId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "domains_orgId_domain_key" ON "domains"("orgId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_analytics_campaignId_key" ON "campaign_analytics"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_trackingId_key" ON "email_logs"("trackingId");

-- CreateIndex
CREATE INDEX "email_logs_campaignId_idx" ON "email_logs"("campaignId");

-- CreateIndex
CREATE INDEX "email_logs_contactId_idx" ON "email_logs"("contactId");

-- CreateIndex
CREATE INDEX "email_logs_trackingId_idx" ON "email_logs"("trackingId");

-- CreateIndex
CREATE INDEX "automation_runs_automationId_idx" ON "automation_runs"("automationId");

-- CreateIndex
CREATE INDEX "automation_runs_contactId_idx" ON "automation_runs"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_orgId_key" ON "subscriptions"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripeInvoiceId_key" ON "invoices"("stripeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "audit_logs_orgId_createdAt_idx" ON "audit_logs"("orgId", "createdAt");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_tests" ADD CONSTRAINT "ab_tests_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_lists" ADD CONSTRAINT "contact_lists_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_list_members" ADD CONSTRAINT "contact_list_members_listId_fkey" FOREIGN KEY ("listId") REFERENCES "contact_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_list_members" ADD CONSTRAINT "contact_list_members_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smtp_configs" ADD CONSTRAINT "smtp_configs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_analytics" ADD CONSTRAINT "campaign_analytics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_clicks" ADD CONSTRAINT "link_clicks_emailLogId_fkey" FOREIGN KEY ("emailLogId") REFERENCES "email_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automations" ADD CONSTRAINT "automations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
