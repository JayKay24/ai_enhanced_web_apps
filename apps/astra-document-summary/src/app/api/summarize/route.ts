import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  processFileStream, 
  summarizeTextStream 
} from '@ai-enhanced-web-apps/shared-utils/ai-providers';
import { 
  MAX_FILE_SIZE_BYTES, 
  FILE_SIZE_ERROR_MESSAGE, 
  AIErrorTracker 
} from '@ai-enhanced-web-apps/shared-utils';
import { logger } from '@ai-enhanced-web-apps/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  logger.info('[POST /api/summarize] START (Document Summarization)');
  const { userId } = await auth();
  if (!userId) {
    logger.warn('[POST /api/summarize] Unauthorized access attempt');
    return new Response('Unauthorized', { status: 401 });
  }
  const contentType = req.headers.get('content-type') || '';

  try {
    let stream: any;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return new Response('No file uploaded', { status: 400 });
      }

      // Enforce file size limit
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return new Response(FILE_SIZE_ERROR_MESSAGE, { status: 400 });
      }

      logger.info(`[POST /api/summarize] Summarizing uploaded file: "${file.name}" (${file.size} bytes)`);
      stream = await processFileStream(file, file.type);
    } else {
      const { text } = await req.json();
      if (!text || !text.trim()) {
        return new Response('No text content provided', { status: 400 });
      }

      logger.info('[POST /api/summarize] Summarizing raw text input');
      stream = await summarizeTextStream(text);
    }

    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(textEncoder.encode(chunk));
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      }
    });
  } catch (error: any) {
    logger.error({ err: error }, '[POST /api/summarize] Error');
    const errorData = await AIErrorTracker.trackError(error, {
      provider: 'Google Vertex AI',
      model: 'gemini-2.5-flash',
      input: 'Document/Text summarization route handler exception',
    });
    const userError = AIErrorTracker.createUserFacingError(errorData);

    return new Response(
      JSON.stringify({ 
        error: userError.message, 
        requestId: userError.requestId 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
