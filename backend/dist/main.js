"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const compression = require("compression");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
    app.use(compression());
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-org-id'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('MailFlow API')
        .setDescription('Modern SaaS Email Marketing Platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth')
        .addTag('campaigns')
        .addTag('contacts')
        .addTag('analytics')
        .addTag('domains')
        .addTag('smtp')
        .addTag('templates')
        .addTag('automation')
        .addTag('ai')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 MailFlow API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map