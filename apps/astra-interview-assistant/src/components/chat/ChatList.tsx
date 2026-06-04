import ChatBubble from './ChatBubble';
import ChatBubbleLoading from './ChatBubbleLoading';

import { UIMessage } from 'ai';
const ChatList = ({ messages, isLoading }: { messages: UIMessage[]; isLoading: boolean }) => {
  return (
    <ul className="flex flex-col gap-5">
      {messages.map((message: UIMessage) => (
        <li key={message?.id}>
          <ChatBubble
            role={message.role}
            text={message.parts?.filter(p => p.type === "text").map((p: any) => p.text).join("") || ""}
            
          />
        </li>
      ))}
      {isLoading ? (
        <li key={messages.length + 1}>
          <ChatBubbleLoading />
        </li>
      ) : null}
    </ul>
  );
};

export default ChatList;
