import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global Prefix
  app.setGlobalPrefix('api');

  // CORS Configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  if (frontendUrl) {
    logger.log(`Enabling CORS for origin: ${frontendUrl}`);
    app.enableCors({
      origin: frontendUrl, // Izinkan hanya dari URL frontend di .env
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true, // Izinkan pengiriman cookie/header otentikasi jika perlu
    });
  } else {
    logger.warn(
      'FRONTEND_URL not set in .env. Falling back to enabling broad CORS (might not work as expected in production).',
    );
    // Fallback untuk development jika env var tidak diset
    // Hati-hati jika ini dipakai di production
    app.enableCors({
      origin: true, // Izinkan dari mana saja (kurang aman)
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
  }

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Hapus properti yang tidak ada di DTO
      forbidNonWhitelisted: true, // Tolak request jika ada properti ekstra
      transform: true, // Ubah payload masuk menjadi instance DTO
      transformOptions: {
        enableImplicitConversion: true, // Bantu konversi tipe dasar
      },
    }),
  );

  // Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TaskEase API')
    .setDescription('API documentation for the TaskEase application')
    .setVersion('1.0')
    .addBearerAuth(
      // Definisikan skema otentikasi Bearer
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization', // Nama header standar
        description: 'Enter JWT token',
        in: 'header',
      },
      'bearer', // Nama kunci untuk referensi di @ApiBearerAuth
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document); // Sajikan di /api/docs

  // Start Listening
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
  logger.log(`API running at: http://localhost:${port}/api`);
  logger.log(`Swagger UI available at http://localhost:${port}/api/docs`);
  logger.log(`Node Environment: ${configService.get<string>('NODE_ENV')}`);
}
bootstrap();
