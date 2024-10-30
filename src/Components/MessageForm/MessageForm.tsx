import React, { useState } from 'react';
import './MessageForm.css';

interface MessageFormProps {}

const MessageForm: React.FC<MessageFormProps> = () => {
	const [message, setMessage] = useState('');

	return (
		<form className="message-form">
			<input
				type="text"
				className="message-input"
				placeholder="Type your message..."
				value={message}
				onChange={(e) => setMessage(e.target.value)}
			/>
			<button type="submit" className="send-button">
				Send
			</button>
		</form>
	);
};

export default MessageForm;
