import { AiService } from './ai.service';
export declare class AiController {
    private svc;
    constructor(svc: AiService);
    generateEmail(body: {
        prompt: string;
        tone?: string;
    }): Promise<any>;
    generateSubjectLines(body: {
        context: string;
        count?: number;
    }): Promise<any>;
    analyzeCampaign(body: {
        subject: string;
        htmlContent: string;
        listSize?: number;
    }): Promise<any>;
    optimizeSubject(body: {
        subject: string;
    }): Promise<any>;
    getBestSendTime(body: {
        industry: string;
        audienceTimezone?: string;
    }): Promise<any>;
}
