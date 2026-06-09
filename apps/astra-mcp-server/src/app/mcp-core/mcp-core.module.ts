import { Global, Module } from '@nestjs/common';
import { McpCoreService } from './mcp-core.service';

@Global()
@Module({
  providers: [McpCoreService],
  exports: [McpCoreService],
})
export class McpCoreModule {}
