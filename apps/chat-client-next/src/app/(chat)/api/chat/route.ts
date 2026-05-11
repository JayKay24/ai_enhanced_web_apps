import { convertToModelMessages, streamText } from 'ai';
import { getModelInstance } from '@ai-enhanced-web-apps/shared-utils/ai-providers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages, provider, model } = await req.json();

    const modelInstance = getModelInstance(
      provider || 'vertex',
      model || 'gemini-2.5-flash'
    );

    const result = streamText({
      model: modelInstance,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in chat api route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
