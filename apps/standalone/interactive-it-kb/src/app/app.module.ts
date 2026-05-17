import { Module } from '@nestjs/common';
import { AppService } from './app.service.js';

@Module({
  imports: [],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
