"use client";
import { Card } from "../ui/card";

interface ChatMessageProps {
  role: string;
  text: string;
  attachments?: {
    url: string;
    contentType: string;
    name?: string;
  }[];
  width?: string;
  className?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, text, attachments, width = 'w-fit max-w-md', className = '' }) => {
  return (
    <Card className={`p-5 flex flex-col gap-3 text-wrap break-words border-none whitespace-pre-wrap ${width} ${className}`}>
      <h5 className="text-lg font-semibold">{role === 'assistant' ? `✴️ Astra` : `👤 ${role}`}</h5>
      
      {attachments && attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((attachment, i) => (
            <div key={i} className="max-w-full overflow-hidden rounded-lg border border-gray-100 shadow-sm">
              <img 
                src={attachment.url.startsWith('data:') ? attachment.url : `data:${attachment.contentType};base64,${attachment.url}`} 
                alt={attachment.name || 'Attachment'} 
                className="max-h-64 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      )}
      
      <p>{text}</p>
    </Card>
  );
};

export default ChatMessage;
