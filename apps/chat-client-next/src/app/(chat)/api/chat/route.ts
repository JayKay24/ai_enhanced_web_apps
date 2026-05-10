import { NextRequest, NextResponse } from 'next/server';
import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { ChatResponse } from '@ai-enhanced-web-apps/shared-types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Missing message text' }, { status: 400 });
    }

    const vertex = createVertex({
      project: process.env.VERTEX_AI_PROJECT_ID,
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    });

    const { text: responseMessage } = await generateText({
      model: vertex('gemini-2.5-flash'),
      messages: [
        {
          role: 'user',
          content: 'Hello',
        },
        {
          role: 'assistant',
          content: "I'm happy to assist you in any way I can. How can I be of service today?",
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });

    console.log(`Assistant response: ${responseMessage}`);

    const chatResponse: ChatResponse = {
      message: {
        id: uuidv4(),
        created: new Date().toISOString(),
        role: 'assistant',
        content: responseMessage,
      },
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error in chat api route: ${error.message}`, error.stack);
    } else {
      console.error(`Error in chat api route: ${error}`);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
