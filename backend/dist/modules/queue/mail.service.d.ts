import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private config;
    private transporter;
    constructor(config: ConfigService);
    private send;
    sendVerification(email: string, name: string, token: string): Promise<void>;
    sendPasswordReset(email: string, name: string, token: string): Promise<void>;
    sendTeamInvite(email: string, inviterName: string, orgName: string, token: string): Promise<void>;
}
