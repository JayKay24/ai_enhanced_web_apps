import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module.js';
import { AppService } from './app/app.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'], // Suppress initialization logs for a cleaner CLI experience
  });

  const appService = app.get(AppService);

  try {
    await appService.executeInteractiveQuery();
  } catch (error) {
    console.error('An error occurred during execution:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
