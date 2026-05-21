// Hot-patch a packaging bug in @langchain/core where v4 is exported as an object instead of a function in CommonJS environment.
try {
  const uuidPkg = require('@langchain/core/utils/uuid');
  if (uuidPkg && typeof uuidPkg.v4 !== 'function' && uuidPkg.v4?.default) {
    uuidPkg.v4 = uuidPkg.v4.default;
  }
} catch (e) {
  // Ignore if require fails
}

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppService } from './app/app.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'], // Include 'log' to see our steps
  });

  const appService = app.get(AppService);

  try {
    await appService.executeChain();
  } catch (error) {
    console.error('Execution failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
