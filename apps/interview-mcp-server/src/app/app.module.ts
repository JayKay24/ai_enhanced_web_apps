import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { McpService } from './mcp.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [McpService],
})
export class AppModule {}
