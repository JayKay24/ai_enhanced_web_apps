import { Injectable, Logger } from '@nestjs/common';
import { AviationRAG } from '@ai-enhanced-web-apps/rag';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async runIndexer(): Promise<void> {
    this.logger.log('=== Starting Aviation Incident Report Indexer CLI ===');

    const docsDir = path.join(__dirname, 'assets/docs');
    const saveDir = path.join(
      process.cwd(),
      'apps/astra-aviation-rag/src/assets/hnswlib-index'
    );

    const sourceDatasetDir = '/Users/jamesnjuguna/Downloads/books/personal_projects/ai_enhanced_web_apps/KG-RAG-datasets-main/ntsb-aviation-incident-accident-reports/data/v1/docs';

    // 1. Co-locate dataset to indexer assets
    if (fs.existsSync(sourceDatasetDir)) {
      this.logger.log(`Co-locating NTSB PDFs from source: "${sourceDatasetDir}"...`);
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
      const files = fs.readdirSync(sourceDatasetDir).filter((f) => f.endsWith('.pdf'));
      for (const file of files) {
        fs.copyFileSync(path.join(sourceDatasetDir, file), path.join(docsDir, file));
      }
      this.logger.log(`Successfully copied ${files.length} PDF files to assets.`);
    } else {
      this.logger.warn(`Source dataset directory not found at: "${sourceDatasetDir}". Relying on pre-existing assets.`);
    }

    this.logger.log(`Source docs directory: "${docsDir}"`);
    this.logger.log(`Target save directory: "${saveDir}"`);

    // 2. Instantiate and run buildIndex using the shared library AviationRAG service
    const rag = new AviationRAG();
    await rag.buildIndex(docsDir, saveDir);

    this.logger.log('=== Indexer CLI Completed Successfully ===');
  }
}
