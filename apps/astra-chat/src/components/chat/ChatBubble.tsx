import React from 'react';
import { Card } from '../ui/card';

interface ChatBubbleProps {
  role: string;
  text: string;
  className?: string;
  width?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  role,
  text,
  className = '',
  width = 'w-fit max-w-md',
}) => {
  return (
    <Card className={`p-5 flex flex-col gap-3 text-wrap break-words border-none whitespace-pre-wrap ${width} ${className}`}>
      <h5 className="text-lg font-semibold">{role === 'assistant' ? `✴️ Astra` : `👤 ${role}`}</h5>
      <p>{text}</p>
    </Card>
  );
};

export default ChatBubble;
