import React, { useContext, useState } from 'react';
import './MessageForm.css';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';
import { StoreContext } from '../../Context';

const client = generateClient<Schema>();

interface MessageFormProps {
	chatId: string;
}

const MessageForm: React.FC<MessageFormProps> = ({ chatId }) => {
	const [message, setMessage] = useState('');
	const store = useContext(StoreContext);

	const createMsg = async () => {
		try {
			const { data, errors } = await client.models.Message.create({
				chatId,
				userId: store?.currentUser?.id,
				content: message,
			});
			console.log(data, errors);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<form className="message-form" onSubmit={(e) => e.preventDefault()}>
			<input
				type="text"
				className="message-input"
				placeholder="Type your message..."
				value={message}
				onChange={(e) => setMessage(e.target.value)}
			/>
			<button className="send-button" onClick={createMsg}>
				Send
			</button>
		</form>
	);
};

export default MessageForm;
