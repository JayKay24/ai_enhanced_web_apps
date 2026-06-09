import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { McpCoreModule } from './mcp-core/mcp-core.module';
import { InterviewModule } from './interview/interview.module';
import { DocumentSummaryModule } from './document-summary/document-summary.module';
import { AviationRagModule } from './aviation-rag/aviation-rag.module';

@Module({
  imports: [
    McpCoreModule,
    InterviewModule,
    DocumentSummaryModule,
    AviationRagModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
