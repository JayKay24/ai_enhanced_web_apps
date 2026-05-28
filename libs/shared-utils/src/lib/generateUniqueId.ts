/**
 * Generates a unique, collision-resistant string identifier.
 * Combines a base-36 timestamp with a random base-36 alphanumeric string.
 * Useful for assigning unique keys/IDs to chat messages, sessions, or requests.
 * 
 * @returns A unique identifier string (e.g., "kp2g3h1a-d4k9j3f").
 */
export function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2);
  return `${timestamp}-${randomPart}`;
}
