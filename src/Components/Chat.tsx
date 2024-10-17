import { useState } from 'react';
import './Chat.css';

interface ChatProps {
  messages: Array<{ content: string; userId: string }>;
  createMsg: (value: string) => void;
  clearChat: () => void; 
  currentUserId: string; // Змінено з userEmail на currentUserId
}

export const Chat: React.FC<ChatProps> = ({ messages, createMsg, clearChat, currentUserId }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      createMsg(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map((message, index) => (
            <div key={index}>
              <strong>{message.userId === currentUserId ? 'You' : 'User'}:</strong> {message.content}
            </div>
          ))
        )}
      </div>
      <div className="input-container">
        <input 
          type="text" 
          className="input" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          placeholder="Type a message..." 
        />
        <button className="send-button" onClick={handleSend}>
          <span>↑</span> 
        </button>
        <button className="clear-chat-button" onClick={clearChat} aria-label="Clear Chat">
          <img 
            src="https://img.icons8.com/ios-filled/50/ffffff/trash.png" 
            alt="Clear Chat" 
            style={{ width: '20px', height: '20px' }} // Задайте розміри іконки
          />
        </button>
      </div>
    </div>
  );
};
