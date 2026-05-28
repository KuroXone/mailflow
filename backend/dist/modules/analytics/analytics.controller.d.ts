import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private svc;
    constructor(svc: AnalyticsService);
    getDashboard(orgId: string): Promise<{
        overview: {
            totalCampaigns: number;
            totalContacts: number;
            emailsSent: number;
            deliveryRate: number;
            openRate: number;
            clickRate: number;
            bounceRate: number;
        };
        recentCampaigns: ({
            analytics: {
                id: string;
                updatedAt: Date;
                campaignId: string;
                sent: number;
                delivered: number;
                opened: number;
                uniqueOpens: number;
                clicked: number;
                uniqueClicks: number;
                bounced: number;
                complained: number;
                unsubscribed: number;
                failed: number;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            orgId: string;
            subject: string;
            previewText: string | null;
            fromName: string;
            fromEmail: string;
            replyTo: string | null;
            htmlContent: string;
            textContent: string | null;
            jsonContent: import("@prisma/client/runtime/library").JsonValue | null;
            templateId: string | null;
            status: import(".prisma/client").$Enums.CampaignStatus;
            scheduledAt: Date | null;
            sentAt: Date | null;
            completedAt: Date | null;
            listIds: string[];
            segmentIds: string[];
            excludeListIds: string[];
            totalRecipients: number;
            trackOpens: boolean;
            trackClicks: boolean;
            utmSource: string | null;
            utmMedium: string | null;
            utmCampaign: string | null;
            smtpConfigId: string | null;
        })[];
    }>;
    getCampaign(id: string, orgId: string): Promise<{
        campaign: {
            analytics: {
                id: string;
                updatedAt: Date;
                campaignId: string;
                sent: number;
                delivered: number;
                opened: number;
                uniqueOpens: number;
                clicked: number;
                uniqueClicks: number;
                bounced: number;
                complained: number;
                unsubscribed: number;
                failed: number;
            };
            emailLogs: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                orgId: string;
                userAgent: string | null;
                ipAddress: string | null;
                campaignId: string;
                status: import(".prisma/client").$Enums.EmailLogStatus;
                sentAt: Date | null;
                smtpConfigId: string | null;
                contactId: string;
                trackingId: string;
                openedAt: Date | null;
                clickedAt: Date | null;
                bouncedAt: Date | null;
                bounceType: string | null;
                bounceReason: string | null;
                country: string | null;
                city: string | null;
                device: string | null;
                opens: number;
                clicks: number;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            orgId: string;
            subject: string;
            previewText: string | null;
            fromName: string;
            fromEmail: string;
            replyTo: string | null;
            htmlContent: string;
            textContent: string | null;
            jsonContent: import("@prisma/client/runtime/library").JsonValue | null;
            templateId: string | null;
            status: import(".prisma/client").$Enums.CampaignStatus;
            scheduledAt: Date | null;
            sentAt: Date | null;
            completedAt: Date | null;
            listIds: string[];
            segmentIds: string[];
            excludeListIds: string[];
            totalRecipients: number;
            trackOpens: boolean;
            trackClicks: boolean;
            utmSource: string | null;
            utmMedium: string | null;
            utmCampaign: string | null;
            smtpConfigId: string | null;
        };
        devices: {
            device: string;
            count: number;
        }[];
        countries: {
            country: string;
            count: number;
        }[];
        topLinks: {
            url: string;
            clicks: number;
        }[];
    }>;
    getTimeline(orgId: string, days: number): Promise<{
        sent: number;
        opens: number;
        clicks: number;
        date: string;
    }[]>;
}
