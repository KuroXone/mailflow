export declare class CreateSmtpDto {
    name: string;
    host: string;
    port: number;
    secure?: boolean;
    authUser: string;
    authPass: string;
    fromEmail: string;
    fromName: string;
    isDefault?: boolean;
    dailyLimit?: number;
}
declare const UpdateSmtpDto_base: import("@nestjs/common").Type<Partial<CreateSmtpDto>>;
export declare class UpdateSmtpDto extends UpdateSmtpDto_base {
}
export {};
