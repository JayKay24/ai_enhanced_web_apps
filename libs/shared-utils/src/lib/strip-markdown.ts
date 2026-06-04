/**
 * Function to strip markdown formatting from text.
 * Useful for text-to-speech processing where markdown symbols shouldn't be read.
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';

  let cleanText = text;
  cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1');
  cleanText = cleanText.replace(/\*(.*?)\*/g, '$1');
  cleanText = cleanText.replace(/__(.*?)__/g, '$1');
  cleanText = cleanText.replace(/_(.*?)_/g, '$1');
  cleanText = cleanText.replace(/#{1,6}\s(.*?)(\n|$)/g, '$1$2');
  cleanText = cleanText.replace(/```[\s\S]*?```/g, '');
  cleanText = cleanText.replace(/`(.*?)`/g, '$1');
  cleanText = cleanText.replace(/^\s*[-*+]\s+/gm, '');
  cleanText = cleanText.replace(/^\s*>\s+/gm, '');
  cleanText = cleanText.replace(/^\s*[-*_]{3,}\s*$/gm, '');
  cleanText = cleanText.replace(/\[(.*?)\]\(.*?\)/g, '$1');

  return cleanText;
}
