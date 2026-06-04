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

/**
 * Sends a summarization request to the summarize API endpoint.
 * Returns the raw Response object to allow chunk-by-chunk stream reading.
 * 
 * @param file - Optional PDF or DOCX file to summarize.
 * @param text - Optional raw text input to summarize.
 * @returns A promise resolving to the fetch Response.
 */
export async function fetchSummaryResponse(file: File | null, text: string): Promise<Response> {
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    return fetch('/api/summarize', {
      method: 'POST',
      body: formData,
    });
  } else {
    return fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
  }
}


/**
 * Creates a new interview session.
 */
export async function createInterviewSession(interviewConfig: any): Promise<any> {
  const response = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', interviewConfig }),
  });
  if (!response.ok) throw new Error('Failed to create interview session');
  return response.json();
}

/**
 * Completes an interview session.
 */
export async function completeInterviewSession(sessionId: string): Promise<any> {
  const response = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'complete', sessionId }),
  });
  if (!response.ok) throw new Error('Failed to complete interview session');
  return response.json();
}

/**
 * Generates and fetches feedback for a completed interview session.
 */
export async function fetchInterviewFeedback(sessionId: string): Promise<any> {
  const response = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'feedback', sessionId }),
  });
  if (!response.ok) throw new Error('Failed to fetch interview feedback');
  return response.json();
}

/**
 * Fetches a specific interview session or all sessions if sessionId is not provided.
 */
export async function fetchInterviewSession(sessionId?: string): Promise<any> {
  const url = sessionId ? `/api/interview?sessionId=${sessionId}` : '/api/interview';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch interview session(s)');
  return response.json();
}

/**
 * Fetches TTS Audio blob for a given text.
 */
export async function fetchTTSAudio(text: string): Promise<Blob> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error('Failed to fetch TTS audio');
  return response.blob();
}
