'use client';
import { MarkdownHooks } from 'react-markdown';

export default function Markdown({ text }: { text: string }) {
  return (
    <div className="prose max-w-none">
      <MarkdownHooks>{text}</MarkdownHooks>
    </div>
  );
}
