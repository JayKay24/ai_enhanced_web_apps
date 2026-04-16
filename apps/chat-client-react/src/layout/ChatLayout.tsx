import React from "react";

interface ChatLayoutProps {
  top: string;
  bottom: string;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ top, bottom }) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full items-center justify-center">{top}</div>
      <div className="flex-1 overflow-hidden h-full">{bottom}</div>
    </div>
  );
};

export default ChatLayout;
