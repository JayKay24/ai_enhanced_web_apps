import { Module } from '@nestjs/common';
import { DocumentSummaryService } from './document-summary.service';

@Module({
  providers: [DocumentSummaryService],
})
export class DocumentSummaryModule {}
