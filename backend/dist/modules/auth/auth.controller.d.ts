import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto/login.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        user: any;
        org: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            logo: string | null;
            website: string | null;
            plan: import(".prisma/client").$Enums.PlanTier;
            emailsSent: number;
            emailsLimit: number;
            contactsCount: number;
            contactsLimit: number;
            customDomain: string | null;
            whitelabel: boolean;
            stripeCustomerId: string | null;
            billingEmail: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto, req: any): Promise<{
        user: any;
        org: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            logo: string | null;
            website: string | null;
            plan: import(".prisma/client").$Enums.PlanTier;
            emailsSent: number;
            emailsLimit: number;
            contactsCount: number;
            contactsLimit: number;
            customDomain: string | null;
            whitelabel: boolean;
            stripeCustomerId: string | null;
            billingEmail: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    me(user: any): any;
}
