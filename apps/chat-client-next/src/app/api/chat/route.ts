import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { ChatResponse } from '@ai-enhanced-web-apps/shared-types';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Missing message text' }, { status: 400 });
    }

    const projectId = process.env.VERTEX_AI_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!projectId) {
      console.error('VERTEX_AI_PROJECT_ID is not defined in the environment variables');
      return NextResponse.json({ error: 'Missing Vertex AI configuration' }, { status: 500 });
    }

    console.log(`Initializing GoogleGenAI with Vertex AI (Project: ${projectId}, Location: ${location})`);
    
    if (credentialsPath) {
      console.log(`Using GOOGLE_APPLICATION_CREDENTIALS from: ${credentialsPath}`);
    } else {
      console.warn('GOOGLE_APPLICATION_CREDENTIALS not set; falling back to standard Application Default Credentials (ADC).');
      console.warn('Ensure you have run: gcloud auth application-default login');
    }

    const ai = new GoogleGenAI({
      vertexai: true,
      project: projectId,
      location: location,
    });

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: [
        {
          role: 'user',
          parts: [{ text: 'Hello' }],
        },
        {
          role: 'model',
          parts: [
            {
              text: "I'm happy to assist you in any way I can. How can I be of service today?",
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage({
      message: text,
    });

    const responseMessage = result.text || '';

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
