import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '../../../amplify/data/resource';
import './MessageForm.css';

const client = generateClient<Schema>();

interface MessageFormProps {
  chatId: string;
  userIds: string[];
}

const MessageForm: React.FC<MessageFormProps> = ({ chatId, userIds }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await client.models.Message.create({
        content: message,
        chatId,
        userId: userIds[0], // передаємо ID поточного користувача
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="message-input"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="send-button">Send</button>
    </form>
  );
};

export default MessageForm;
