import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
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

    const model = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
    });

    // Note: @ai-sdk/google uses the GOOGLE_GENERATIVE_AI_API_KEY environment variable.
    // If you wish to continue using Vertex AI, use @ai-sdk/google-vertex instead.
    const { text: responseMessage } = await generateText({
      model: model('gemini-2.0-flash'),
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
