import React, { useEffect, useState } from 'react';
import './ContextMenu.css';

interface ContextMenuProps {
  onClose: () => void;
  isVisiable: boolean;
  setIsVisiable: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ onClose }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [message, setMessage] = useState('');

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('context-menu');
      if (menu && !menu.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(message).catch(err => {
      console.error('Error copying text: ', err);
    });
    handleClose();
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEditText(message);
    setIsEditing(true);
    handleClose();
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    setMessage('');
    handleClose();
  };

  const handleSaveEdit = () => {
    setMessage(editText);
    setIsEditing(false);
    setEditText('');
  };

  return (
    <div
      className="app"
      onContextMenu={handleContextMenu}
      style={{ width: '100%', height: '100%' }}
    >
      {show && (
        <div
          id="context-menu"
          className="context-menu"
          style={{ top: position.y, left: position.x, display: show ? 'block' : 'none' }}
        >
          <div className="context-menu-item" onClick={handleCopy}>Copy</div>
          <div className="context-menu-item" onClick={handleEdit}>Edit</div>
          <div className="context-menu-item" onClick={handleDelete}>Delete</div>
        </div>
      )}

      {isEditing && (
        <div className="edit-container" style={{ position: 'absolute', top: position.y + 30, left: position.x }}>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Type new text..."
          />
          <button onClick={handleSaveEdit}>Зберегти</button>
        </div>
      )}
    </div>
  );
};

export default ContextMenu;


/*
  const [messages, setMessages] = useState<Array<{ id: string; content: string; userId: string; createdAt: string }>>([]);

  async function deleteMessage(messageId: string) {
    try {
      await client.models.Message.delete({ id: messageId });
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }

  async function updateMessage(messageId: string, newContent: string) {
    try {
      await client.models.Message.update({ id: messageId, content: newContent });
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, content: newContent } : msg
        )
      );
    } catch (error) {
      console.error("Error updating message:", error);
    }
  }
*/
  

