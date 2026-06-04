import { NextRequest, NextResponse } from 'next/server';
import { generateTTSAudio } from '../../../services/tts-service';
import { logger } from '@ai-enhanced-web-apps/logger';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const audioBuffer = await generateTTSAudio(text);

    return new NextResponse(Buffer.from(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, '[POST /api/tts] Text-to-speech error');
    
    if (error.message.includes('Invalid text') || error.message.includes('No text content')) {
      return new NextResponse(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new NextResponse(JSON.stringify({ error: 'Failed to generate speech' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

