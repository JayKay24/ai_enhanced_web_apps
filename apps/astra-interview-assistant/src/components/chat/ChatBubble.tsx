import { Card, CardContent } from '@ai-enhanced-web-apps/chat-ui';
import Markdown from '../Markdown';

export function ChatBubble({ role, text }: { role: string; text: string }) {
  const isUser = role === 'user';
  return (
    <Card className={`max-w-[80%] ${isUser ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto'}`}>
      <CardContent className="p-4">
        <h5 className="text-sm font-semibold mb-2">{role === 'assistant' ? `✴️ Astra (Interviewer)` : `👤 ${role}`}</h5>
        <Markdown text={text} />
      </CardContent>
    </Card>
  );
};

export default ChatBubble;
