"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    appUrl: process.env.APP_URL || 'http://localhost:3001',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    trackingDomain: process.env.TRACKING_DOMAIN || 'http://localhost:3001',
    database: { url: process.env.DATABASE_URL },
    redis: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
    jwt: {
        secret: process.env.JWT_SECRET || 'dev_secret_32chars_change_me!!',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_32chars_change_me!',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@mailflow.app',
        fromName: process.env.SMTP_FROM_NAME || 'MailFlow',
    },
    s3: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
        bucket: process.env.S3_BUCKET || 'mailflow',
    },
    openai: { apiKey: process.env.OPENAI_API_KEY },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        prices: {
            starter: process.env.STRIPE_STARTER_PRICE_ID,
            pro: process.env.STRIPE_PRO_PRICE_ID,
            enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        },
    },
    encryption: { key: process.env.ENCRYPTION_KEY || 'change_me_32_char_encryption_key!' },
});
//# sourceMappingURL=configuration.js.map