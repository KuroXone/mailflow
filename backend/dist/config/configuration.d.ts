declare const _default: () => {
    port: number;
    nodeEnv: string;
    appUrl: string;
    frontendUrl: string;
    trackingDomain: string;
    database: {
        url: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
        fromEmail: string;
        fromName: string;
    };
    s3: {
        endpoint: string;
        region: string;
        accessKey: string;
        secretKey: string;
        bucket: string;
    };
    openai: {
        apiKey: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
        prices: {
            starter: string;
            pro: string;
            enterprise: string;
        };
    };
    encryption: {
        key: string;
    };
};
export default _default;
