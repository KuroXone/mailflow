export declare class CreateCampaignDto {
    name: string;
    subject: string;
    previewText?: string;
    fromName: string;
    fromEmail: string;
    replyTo?: string;
    htmlContent?: string;
    textContent?: string;
    jsonContent?: any;
    templateId?: string;
    listIds?: string[];
    segmentIds?: string[];
    trackOpens?: boolean;
    trackClicks?: boolean;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    smtpConfigId?: string;
}
declare const UpdateCampaignDto_base: import("@nestjs/common").Type<Partial<CreateCampaignDto>>;
export declare class UpdateCampaignDto extends UpdateCampaignDto_base {
}
export declare class ScheduleCampaignDto {
    scheduledAt: string;
}
export declare class TestEmailDto {
    email: string;
}
export {};
