import { Logger } from '@nestjs/common';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestLoggerService, logger } from '@ai-enhanced-web-apps/logger';
import { AppModule } from './app/app.module';
import { AppService } from './app/app.service';

async function bootstrap() {
  const pdfPath = process.argv[2];

  if (!pdfPath) {
    logger.error('\n❌ Error: Missing PDF file path argument.');
    logger.info('Usage: npx nx execute kmeans-summarization --args="path/to/document.pdf"\n');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: new NestLoggerService(),
  });

  const appService = app.get(AppService);

  try {
    await appService.runSummarization(pdfPath);
  } catch (error) {
    logger.error(error, '\n❌ Execution failed:');
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
