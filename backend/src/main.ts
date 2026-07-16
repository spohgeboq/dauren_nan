import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for frontend (настроено для работы через ngrok)
  app.enableCors({
    origin: true, // Разрешаем все источники (для ngrok)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'ngrok-skip-browser-warning', // Обход предупреждения ngrok
      'Bypass-Tunnel-Reminder', // Обход предупреждения localtunnel
      'X-Requested-With',
      'Accept',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204, // Для корректного Preflight
    maxAge: 86400, // Кешировать preflight на 24 часа
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Serve static uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Daurennan CRM Backend running on http://localhost:${port}`);
}
bootstrap();
