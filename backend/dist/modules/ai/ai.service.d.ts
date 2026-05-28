import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private config;
    private openai;
    constructor(config: ConfigService);
    private ensure;
    private callOpenAI;
    generateEmail(prompt: string, tone?: string): Promise<any>;
    generateSubjectLines(context: string, count?: number): Promise<any>;
    analyzeCampaign(campaign: {
        subject: string;
        htmlContent: string;
        listSize?: number;
    }): Promise<any>;
    optimizeSubject(subject: string): Promise<any>;
    getBestSendTime(industry: string, audienceTimezone?: string): Promise<any>;
}
