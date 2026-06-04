import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { stripMarkdown } from '@ai-enhanced-web-apps/shared-utils';
import { logger } from '@ai-enhanced-web-apps/logger';

const ttsClient = new TextToSpeechClient();

/**
 * Generates an MP3 audio buffer from text using Google Cloud Text-to-Speech.
 * Strips markdown from the text before synthesis.
 * 
 * @param text - The raw text (potentially containing markdown) to synthesize.
 * @returns A promise resolving to a Uint8Array containing the MP3 audio data.
 * @throws {Error} If the text is invalid or empty after markdown stripping.
 */
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
