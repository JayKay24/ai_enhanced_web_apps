import { Module } from '@nestjs/common';
import { AviationRagService } from './aviation-rag.service';

@Module({
  providers: [AviationRagService],
})
export class AviationRagModule {}
