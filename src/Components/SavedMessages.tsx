import React, { useState } from 'react';
import './SavedMessages.css';

interface SavedMessagesProps {
  savedMessages: Array<{ content: string; userId: string; id: string }>;
  createSavedMsg: (value: string) => void;
  deleteSavedMsg: (id: string) => void;
  updateSavedMsg: (id: string, newContent: string) => void;
  replyToSavedMsg: (messageId: string) => void;
  attachSavedMsg: (messageId: string) => void;
}

const SavedMessages: React.FC<SavedMessagesProps> = ({
  savedMessages,
  createSavedMsg,
  deleteSavedMsg,
  updateSavedMsg,
  replyToSavedMsg,
  attachSavedMsg,
}) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const [contextMenuMsgId, setContextMenuMsgId] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessageContent, setEditedMessageContent] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleSend = () => {
    if (newMessage.trim() !== '') {
      createSavedMsg(newMessage);
      setNewMessage('');
    }
  };

  const handleContextMenuOpen = (event: React.MouseEvent, messageId: string, messageContent: string) => {
    event.preventDefault();
    setShowContextMenu(true);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuMsgId(messageId);
    setEditedMessageContent(messageContent);
  };

  const handleDeleteSavedMsg = () => {
    if (contextMenuMsgId) {
      deleteSavedMsg(contextMenuMsgId);
    }
    setShowContextMenu(false);
    setContextMenuMsgId(null);
  };

  const handleEditSavedMsg = () => {
    if (contextMenuMsgId) {
      updateSavedMsg(contextMenuMsgId, editedMessageContent);
    }
    setShowContextMenu(false);
    setContextMenuMsgId(null);
    setIsEditing(false);
  };

  const handleReplyToSavedMsg = () => {
    if (contextMenuMsgId) {
      replyToSavedMsg(contextMenuMsgId);
    }
    setShowContextMenu(false);
    setContextMenuMsgId(null);
  };

  const handleAttachSavedMsg = () => {
    if (contextMenuMsgId) {
      attachSavedMsg(contextMenuMsgId);
    }
    setShowContextMenu(false);
    setContextMenuMsgId(null);
  };

  const handleCopySavedMsg = () => {
    if (contextMenuMsgId) {
      const messageToCopy = savedMessages.find(msg => msg.id === contextMenuMsgId);
      if (messageToCopy) {
        navigator.clipboard.writeText(messageToCopy.content);
      }
    }
    setShowContextMenu(false);
    setContextMenuMsgId(null);
  };

  return (
    <div className="saved-messages">
      <h2>Saved Messages</h2>
      <div className="input-container">
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage} 
          onChange={handleInputChange} 
          className="message-input" 
        />
        {newMessage.trim() && (
          <button className="send-button" onClick={handleSend}>
            <span>↑</span>
          </button>
        )}
      </div>

      {savedMessages.length === 0 ? (
        <p className="no-messages">No saved messages.</p>
      ) : (
        <ul>
          {savedMessages.map(msg => (
            <li 
              key={msg.id} 
              onContextMenu={(e) => handleContextMenuOpen(e, msg.id, msg.content)}
            >
              <div className="message-content">{msg.content}</div>
              <div className="message-info">Belongs to: {msg.userId} (Saved)</div>
            </li>
          ))}
        </ul>
      )}

      {showContextMenu && contextMenuPosition && (
        <div
          className="context-menu"
          style={{ position: 'absolute', top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <button onClick={handleCopySavedMsg} className="context-menu-button">Copy</button>
          <button onClick={() => setIsEditing(true)} className="context-menu-button">Edit</button>
          <button onClick={handleDeleteSavedMsg} className="context-menu-button">Delete</button>
          <button onClick={handleReplyToSavedMsg} className="context-menu-button">Reply</button>
          <button onClick={handleAttachSavedMsg} className="context-menu-button">Attach</button>
        </div>
      )}

      {isEditing && (
        <div className="editing-container">
          <input
            type="text"
            value={editedMessageContent}
            onChange={(e) => setEditedMessageContent(e.target.value)}
            placeholder="Edit saved message..."
            className="message-input" 
          />
          <button onClick={handleEditSavedMsg} className="save-button">Save</button>
        </div>
      )}
    </div>
  );
};

export default SavedMessages;
