import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppService } from './app/app.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const appService = app.get(AppService);

  try {
    await appService.run();
  } catch (error) {
    console.error('Execution failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
