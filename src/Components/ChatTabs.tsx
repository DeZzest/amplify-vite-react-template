import React from 'react';

interface ChatTabsProps {
  chats: Array<{ id: string; user: string }>;
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
}

const ChatTabs: React.FC<ChatTabsProps> = ({ chats, activeChatId, onSelectChat }) => {
  return (
    <div className="chat-tabs">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`chat-tab ${chat.id === activeChatId ? 'active' : ''}`}
          onClick={() => onSelectChat(chat.id)}
        >
          {chat.user}
        </div>
      ))}
    </div>
  );
};

export default ChatTabs;
