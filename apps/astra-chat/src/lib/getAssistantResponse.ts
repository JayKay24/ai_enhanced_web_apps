export async function getAssistantResponse(text: string, path = '/api/chat') {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch response from server');
  }

  return await response.json();
}
