import { NextRequest } from 'next/server';
import { createUIMessageStream, createUIMessageStreamResponse, generateId } from 'ai';
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
    let userQuery = '';
    if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
      for (const part of lastMessage.parts) {
        if (part.type === 'text' && typeof part.text === 'string') {
          userQuery += part.text;
        }
      }
    } else if (typeof lastMessage.content === 'string') {
      userQuery = lastMessage.content;
    }

    if (!userQuery.trim()) {
      return new Response('No text query found in the last message', { status: 400 });
    }

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
    const langchainStream = await rag.queryStream(indexPath, userQuery);

    const uiMessageStream = createUIMessageStream({
      execute: async ({ writer }) => {
        try {
          const messageId = generateId();
          writer.write({ type: 'text-start', id: messageId });
          for await (const chunk of langchainStream) {
            writer.write({ type: 'text-delta', id: messageId, delta: chunk });
          }
          writer.write({ type: 'text-end', id: messageId });
        } catch (err: any) {
          writer.write({ type: 'error', errorText: err.message || 'An error occurred during streaming.' });
        }
      }
    });

    return createUIMessageStreamResponse({ stream: uiMessageStream });
  } catch (error: any) {
    logger.error({ err: error }, '[POST /api/chat] Error');
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred during query execution.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
