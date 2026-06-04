import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { stripMarkdown } from '@ai-enhanced-web-apps/shared-utils';
import { logger } from '@ai-enhanced-web-apps/logger';

const ttsClient = new TextToSpeechClient();

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new NextResponse(JSON.stringify({ error: 'Invalid text parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanText = stripMarkdown(text);
    if (!cleanText.trim()) {
      return new NextResponse(JSON.stringify({ error: 'No text content after processing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    logger.info(`[POST /api/tts] Text-to-speech request: ${cleanText.substring(0, 50)}...`); 
    
    const ttsRequest = {
      input: { text: cleanText },
      voice: {
        languageCode: 'en-US',
        ssmlGender: 'FEMALE' as const,
        name: 'en-US-Neural2-F',
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    const [response] = await ttsClient.synthesizeSpeech(ttsRequest);
    const audioContent = response.audioContent;

    return new NextResponse(Buffer.from(audioContent as Uint8Array), {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, '[POST /api/tts] Text-to-speech error');
    return new NextResponse(JSON.stringify({ error: 'Failed to generate speech' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
