import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(compression());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-org-id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 MailFlow API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
