import { ChatResponse } from '@ai-enhanced-web-apps/shared-types';

export async function fetchAssistantResponse(url: string, text: string): Promise<ChatResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch response from ${url}`);
  }

  return (await response.json()) as ChatResponse;
}
