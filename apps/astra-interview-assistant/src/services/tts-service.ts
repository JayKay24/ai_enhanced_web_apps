import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { stripMarkdown } from '@ai-enhanced-web-apps/shared-utils';
import { logger } from '@ai-enhanced-web-apps/logger';

const ttsClient = new TextToSpeechClient();

export async function generateTTSAudio(text: string) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text parameter');
  }

  const cleanText = stripMarkdown(text);
  if (!cleanText.trim()) {
    throw new Error('No text content after processing');
  }
  
  logger.info(`Text-to-speech request: ${cleanText.substring(0, 50)}...`); 
  
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
  return response.audioContent as Uint8Array;
}
