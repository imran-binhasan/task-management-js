import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common/services/logger.service';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
   await app.listen(process.env.PORT ?? 3000);
   logger.debug(`Application is running on: ${await app.getUrl()}`);

}
bootstrap();
