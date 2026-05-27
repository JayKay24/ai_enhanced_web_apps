import { Logger } from '@nestjs/common';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestLoggerService } from '@ai-enhanced-web-apps/logger';
import { AppModule } from './app/app.module';
import { AppService } from './app/app.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: new NestLoggerService(),
  });

  const appService = app.get(AppService);

  try {
    await appService.demonstrateFewShotPrompting();
  } catch (error) {
    Logger.error('Execution failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
