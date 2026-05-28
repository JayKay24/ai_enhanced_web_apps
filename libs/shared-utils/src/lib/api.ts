import { ChatResponse } from '@ai-enhanced-web-apps/shared-types';

/**
 * Sends a POST request to the specified assistant endpoint with user text.
 * Expects a structured response containing the assistant's replies.
 * 
 * @param url - Endpoint URL to post the request to.
 * @param text - User query or input prompt message.
 * @returns A promise resolving to a {@link ChatResponse} object.
 * @throws {@link Error} If the HTTP response status is not OK.
 */
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
