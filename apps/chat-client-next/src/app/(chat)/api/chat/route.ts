import { createVertex } from '@ai-sdk/google-vertex';
import { convertToModelMessages, streamText } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const vertex = createVertex({
      project: process.env.VERTEX_AI_PROJECT_ID,
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    });

    const result = streamText({
      model: vertex('gemini-2.5-flash'),
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in chat api route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
