import { 
  ChatResponse,
  InterviewConfig,
  CreateInterviewSessionResponse,
  FetchInterviewSessionResponse,
  FetchAllInterviewSessionsResponse,
  InterviewFeedbackResponse
} from '@ai-enhanced-web-apps/shared-types';

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
 * Sends a request to create a new AI interview session.
 * 
 * @param interviewConfig - Configuration object defining the job role, difficulty, and questions.
 * @returns A promise resolving to an object containing the new sessionId and the initial AI prompt messages.
 * @throws {Error} If the server responds with a non-OK status.
 */
export async function createInterviewSession(interviewConfig: InterviewConfig): Promise<CreateInterviewSessionResponse> {
  const response = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', interviewConfig }),
  });
  if (!response.ok) throw new Error('Failed to create interview session');
  return (await response.json()) as CreateInterviewSessionResponse;
}

/**
 * Sends a request to mark an active interview session as completed.
 * 
 * @param sessionId - The unique identifier of the interview session to complete.
 * @returns A promise resolving to an object indicating success.
 * @throws {Error} If the server responds with a non-OK status.
 */
export async function completeInterviewSession(sessionId: string): Promise<{ success: boolean }> {
  const response = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'complete', sessionId }),
  });
  if (!response.ok) throw new Error('Failed to complete interview session');
  return (await response.json()) as { success: boolean };
}

/**
 * Sends a request to generate and fetch feedback for a completed interview session.
 * 
 * @param sessionId - The unique identifier of the interview session.
 * @returns A promise resolving to the feedback payload.
 * @throws {Error} If the server responds with a non-OK status.
 */
export async function fetchInterviewFeedback(sessionId: string): Promise<InterviewFeedbackResponse> {
  const response = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'feedback', sessionId }),
  });
  if (!response.ok) throw new Error('Failed to fetch interview feedback');
  return (await response.json()) as InterviewFeedbackResponse;
}

/**
 * Fetches either a specific interview session or all past interview sessions for the authenticated user.
 * 
 * @param sessionId - (Optional) The unique identifier of a specific interview session.
 * @returns A promise resolving to either a specific session (with feedback) or a list of all sessions.
 * @throws {Error} If the server responds with a non-OK status.
 */
export function fetchInterviewSession(sessionId: string): Promise<FetchInterviewSessionResponse>;
export function fetchInterviewSession(): Promise<FetchAllInterviewSessionsResponse>;
export async function fetchInterviewSession(sessionId?: string): Promise<FetchInterviewSessionResponse | FetchAllInterviewSessionsResponse> {
  const url = sessionId ? `/api/interview?sessionId=${sessionId}` : '/api/interview';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch interview session(s)');
  return (await response.json()) as FetchInterviewSessionResponse | FetchAllInterviewSessionsResponse;
}

/**
 * Sends a request to generate Text-To-Speech (TTS) audio for a given string of text.
 * 
 * @param text - The raw text payload (will be stripped of markdown by the server).
 * @returns A promise resolving to a Blob containing the MP3 audio data.
 * @throws {Error} If the server responds with a non-OK status or generation fails.
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
