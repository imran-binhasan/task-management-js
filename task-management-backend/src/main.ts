import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common/services/logger.service';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  app.setGlobalPrefix('api');
  app.enableVersioning();
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API documentation for Task Management application')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
    })
    .build();

  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(port);
  logger.debug(`Application is running on: http://127.0.0.1:${port}/api`);
  logger.debug(`Swagger docs available at: http://127.0.0.1:${port}/docs`);
}

bootstrap();