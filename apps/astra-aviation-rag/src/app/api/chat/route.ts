import { NextRequest } from 'next/server';
import { createTextStreamResponse } from 'ai';
import { AviationRAG } from '@ai-enhanced-web-apps/rag';
import { logger } from '@ai-enhanced-web-apps/logger';
import * as path from 'path';
import * as fs from 'fs';

export const dynamic = 'force-dynamic';

let ragInstance: AviationRAG | null = null;

function getRAGInstance(): AviationRAG {
  if (!ragInstance) {
    ragInstance = new AviationRAG();
  }
  return ragInstance;
}

export async function POST(req: NextRequest) {
  logger.info('[POST /api/chat] START (Aviation Incident RAG)');
  try {
    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      return new Response('No messages provided', { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // Resolve RAG index path with default fallback
    let defaultIndexPath = path.join(
      process.cwd(),
      'src/assets/hnswlib-index'
    );
    if (!fs.existsSync(defaultIndexPath)) {
      defaultIndexPath = path.join(
        process.cwd(),
        'apps/astra-aviation-rag/src/assets/hnswlib-index'
      );
    }
    const indexPath = process.env.RAG_INDEX_PATH || defaultIndexPath;

    logger.info(`[POST /api/chat] Using index path: "${indexPath}"`);

    const rag = getRAGInstance();
    const stream = await rag.queryStream(indexPath, userQuery);

    return createTextStreamResponse({ textStream: stream });
  } catch (error: any) {
    logger.error({ err: error }, '[POST /api/chat] Error');
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred during query execution.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
