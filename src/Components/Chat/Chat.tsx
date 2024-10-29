import { useState } from 'react';
import './Chat.css';

interface ChatProps {
  messages: Array<{ content: string; userId: string; createdAt: string; id: string }>;
  createMsg: (value: string) => void;
  clearChat: () => void;
  currentUserId: string;
  saveMessage: (id: string) => void;
  deleteMessage: (id: string) => void;
  updateMessage: (id: string, newContent: string) => void;
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  createMsg,
  clearChat,
  currentUserId,
  saveMessage,
  deleteMessage,
  updateMessage,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [contextMenuMsgId, setContextMenuMsgId] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessageContent, setEditedMessageContent] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      createMsg(inputValue);
      setInputValue('');
    }
  };

  const handleContextMenuOpen = (event: React.MouseEvent, messageId: string, messageContent: string) => {
    event.preventDefault();
    setShowContextMenu(true);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuMsgId(messageId);
    setEditedMessageContent(messageContent);
  };

  const handleSaveMessage = () => {
    if (contextMenuMsgId) {
      saveMessage(contextMenuMsgId);
    }
    setShowContextMenu(false);
    setContextMenuMsgId(null);
  };

  const handleDeleteMessage = () => {
    if (contextMenuMsgId) {
      deleteMessage(contextMenuMsgId);
    }
    setShowContextMenu(false);
    setContextMenuMsgId(null);
  };

  const handleEditMessage = () => {
    if (contextMenuMsgId) {
      updateMessage(contextMenuMsgId, editedMessageContent);
    }
    setShowContextMenu(false);
    setContextMenuMsgId(null);
    setIsEditing(false);
  };

  const handleCopyMessage = () => {
    if (contextMenuMsgId) {
      const messageToCopy = messages.find(msg => msg.id === contextMenuMsgId);
      if (messageToCopy) {
        navigator.clipboard.writeText(messageToCopy.content);
      }
    }
    setShowContextMenu(false);
    setContextMenuMsgId(null);
  };

  const handleClearChat = () => {
    clearChat();
    setShowContextMenu(false);
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={message.userId === currentUserId ? 'sent' : 'received'}
              onContextMenu={(e) => handleContextMenuOpen(e, message.id, message.content)}
            >
              <div className="message-bubble">
                <strong>{message.userId === currentUserId ? 'You' : 'User'}:</strong> {message.content}
              </div>
            </div>
          ))
        )}
      </div>
      {showContextMenu && contextMenuPosition && (
        <div
          className="context-menu"
          style={{ position: 'absolute', top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <button onClick={handleSaveMessage}>Save</button>
          <button onClick={handleCopyMessage}>Copy</button>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={handleDeleteMessage}>Delete</button>
          <button onClick={handleClearChat}>Clear Chat</button>
        </div>
      )}
      {isEditing && (
        <div className="editing-container">
          <input
            type="text"
            className="input"
            value={editedMessageContent}
            onChange={(e) => setEditedMessageContent(e.target.value)}
            placeholder="Edit message..."
          />
          <button className="send-button" onClick={handleEditMessage}>
            Save
          </button>
        </div>
      )}
      <div className="input-container">
        <input
          type="text"
          className="input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
        />
        <div className="button-container">
          {inputValue.trim() && (
            <button className="send-button" onClick={handleSend}>
              <span>↑</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

