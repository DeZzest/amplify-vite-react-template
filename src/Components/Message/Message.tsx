import React from 'react';
import { Schema } from '../../../amplify/data/resource';
import './Message.css';

interface MessageProps {
  msgData: Schema['Message']['type'];
  variant: 'owner' | 'friend';
}

const Message: React.FC<MessageProps> = ({ msgData, variant }) => {
  const isOwner = variant === 'owner';

  return (
    <div className={`message ${isOwner ? 'message-owner' : 'message-friend'}`}>
      <div className="message-content">
        <p>{msgData.content}</p>
        <span className="message-time">
          {new Date(msgData.createdAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default Message;
