import { ChatResponse } from '@ai-enhanced-web-apps/shared-types';
import { fetchAssistantResponse } from '@ai-enhanced-web-apps/shared-utils';

export async function getAssistantResponse(text: string): Promise<ChatResponse> {
  return fetchAssistantResponse("http://localhost:3000/", text);
}
