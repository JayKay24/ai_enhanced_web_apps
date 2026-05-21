import { Injectable, Logger } from '@nestjs/common';
import { ChatVertexAI } from "@langchain/google-vertexai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { StringOutputParser } from "@langchain/core/output_parsers";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly messageHistories: Record<string, InMemoryChatMessageHistory> = {};

  async executeChain(): Promise<void> {
    this.logger.log('--- LangChain Message History Demo (Vertex AI) Initializing ---');

    // 1. Initialize the ChatVertexAI model
    // This will reuse the existing gcloud application-default credentials session.
    // It requires VERTEX_AI_PROJECT_ID and VERTEX_AI_LOCATION to be set.
    const projectId = process.env.VERTEX_AI_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION;

    this.logger.log(`Using GCP Project ID: ${projectId}`);
    this.logger.log(`Using GCP Location: ${location}`);

    if (!projectId || !location) {
      this.logger.warn('Warning: VERTEX_AI_PROJECT_ID or VERTEX_AI_LOCATION is not set in env.');
    }

    const model = new ChatVertexAI({
      model: "gemini-2.5-flash", // Using the latest stable model
      authOptions: {
        projectId: projectId,
      },
      location: location,
      temperature: 0.7,
    });

    // 2. Define the ChatPromptTemplate containing a MessagesPlaceholder for the history
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful, friendly AI assistant. Answer all questions to the best of your ability."],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    // 3. Create the main chain (prompt | model | output parser)
    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    // 4. Wrap the chain in RunnableWithMessageHistory to automatically handle state/history
    const chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: async (sessionId: string) => {
        if (!this.messageHistories[sessionId]) {
          this.logger.log(`Creating new chat history store for session: ${sessionId}`);
          this.messageHistories[sessionId] = new InMemoryChatMessageHistory();
        }
        return this.messageHistories[sessionId];
      },
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    const sessionId = "demo-session-123";
    const config = { configurable: { sessionId } };

    // --- Turn 1 ---
    const input1 = "Hi! My name is Jim. Remember that name.";
    this.logger.log(`\n=== Turn 1 ===\nUser: ${input1}`);

    try {
      const response1 = await chainWithHistory.invoke(
        { input: input1 },
        config
      );
      this.logger.log(`Assistant: ${response1}`);
    } catch (error) {
      this.logger.error('Error invoking Turn 1', error);
      throw error;
    }

    // --- Turn 2 ---
    const input2 = "What is my name again? And can you say it backwards?";
    this.logger.log(`\n=== Turn 2 ===\nUser: ${input2}`);

    try {
      const response2 = await chainWithHistory.invoke(
        { input: input2 },
        config
      );
      this.logger.log(`Assistant: ${response2}`);
    } catch (error) {
      this.logger.error('Error invoking Turn 2', error);
      throw error;
    }

    // --- Retrieve and Print Final History ---
    this.logger.log('\n=== In-Memory Message History Dump ===');
    const history = await this.messageHistories[sessionId].getMessages();
    history.forEach((message, idx) => {
      this.logger.log(`[Message ${idx + 1}] Role: ${message.type} | Content: ${message.content}`);
    });
    this.logger.log('====================================\n');
  }
}
