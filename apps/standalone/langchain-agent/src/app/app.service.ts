import { Injectable, Logger } from '@nestjs/common';
import { ChatVertexAI, VertexAIEmbeddings } from '@langchain/google-vertexai';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { createAgent } from 'langchain';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { BaseMessage, AIMessage } from '@langchain/core/messages';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async executeChain(): Promise<void> {
    this.logger.log('--- LangChain ReAct Agent Demo (Vertex AI) Initializing ---');

    const projectId = process.env.VERTEX_AI_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

    this.logger.log(`Using GCP Project ID: ${projectId}`);
    this.logger.log(`Using GCP Location: ${location}`);

    if (!projectId) {
      this.logger.error('Error: VERTEX_AI_PROJECT_ID is not set in environment.');
      throw new Error('VERTEX_AI_PROJECT_ID is not set.');
    }

    // 1. Raw Text Document
    const rawText = `Artificial Intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of "intelligent agents": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals.

As machines become increasingly capable, tasks considered to require "intelligence" are often removed from the definition of AI, a phenomenon known as the AI effect. For instance, optical character recognition is frequently excluded from things considered to be AI, having become a routine technology. Similarly, advances in machine learning have led to significant improvements in natural language processing and computer vision.

AI applications include advanced web search engines, recommendation systems, understanding human speech (natural language processing), self-driving cars, and competing at a high level in strategic game systems like chess and Go.`;

    // 2. Split Text into Chunks
    const chunkSize = 500;
    const chunkOverlap = 50;
    this.logger.log(`Splitting text into chunks (size: ${chunkSize}, overlap: ${chunkOverlap})...`);
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
    const documents = await splitter.createDocuments([rawText]);

    // 3. Initialize Embeddings Model (Vertex AI)
    this.logger.log('Initializing Vertex AI Embeddings (text-embedding-004)...');
    const embeddings = new VertexAIEmbeddings({
      model: 'text-embedding-004',
      authOptions: {
        projectId: projectId,
      },
      location: location,
    });

    // 4. Ingest documents into MemoryVectorStore
    this.logger.log('Ingesting documents into MemoryVectorStore...');
    const vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addDocuments(documents);

    // 5. Create retriever and wrap it in a tool using standard tool builder
    const retriever = vectorStore.asRetriever({ k: 2 });
    const retrieverTool = tool(
      async ({ query }) => {
        this.logger.log(`[retrieverTool] Querying vector store for: "${query}"`);
        const docs = await retriever.invoke(query);
        this.logger.log(`[retrieverTool] Found ${docs.length} relevant document(s).`);
        return docs.map((doc) => doc.pageContent).join('\n\n');
      },
      {
        name: 'search_ai_definitions',
        description: 'Search for definitions, applications, and general concepts of Artificial Intelligence (AI). Use this tool to answer any questions about AI.',
        schema: z.object({
          query: z.string().describe('The search query to look up in the AI knowledge base.'),
        }),
      }
    );

    // 6. Initialize LLM (Vertex AI)
    this.logger.log('Initializing ChatVertexAI (gemini-2.5-flash)...');
    const model = new ChatVertexAI({
      model: 'gemini-2.5-flash',
      authOptions: {
        projectId: projectId,
      },
      location: location,
      temperature: 0,
    });

    // 7. Create the ReAct agent
    this.logger.log('Creating ReAct agent using createAgent...');
    const agent = createAgent({
      model: model,
      tools: [retrieverTool],
    });

    // 8. Invoke the agent
    const question = 'What is the definition of artificial intelligence according to leading textbooks?';
    this.logger.log(`Invoking agent with question: "${question}"`);

    const result = await agent.invoke({
      messages: [{ role: 'user', content: question }],
    });

    this.logger.log('--- Agent Execution Flow ---');
    if (result.messages && result.messages.length > 0) {
      result.messages.forEach((msg: BaseMessage, idx: number) => {
        let role = msg._getType();
        let toolCallsContent = '';

        if (msg instanceof AIMessage) {
          if (msg.tool_calls && msg.tool_calls.length > 0) {
            role = 'agent (tool_call)';
            toolCallsContent = JSON.stringify(msg.tool_calls);
          }
        }

        const toolName = msg.name ? ` [Tool: ${msg.name}]` : '';
        const content = msg.content || toolCallsContent;
        this.logger.log(`Message [${idx + 1}] | Role: ${role}${toolName} | Content: ${content}`);
      });
    }

    const finalAnswer = result.messages[result.messages.length - 1]?.content;
    this.logger.log('---------------------------');
    this.logger.log(`Final Answer:\n${finalAnswer}`);
  }
}
