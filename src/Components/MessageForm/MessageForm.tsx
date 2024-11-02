import React, { useContext, useState } from 'react';
import style from './MessageForm.module.css';
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
		setMessage('');
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
		<form className={style.form} onSubmit={(e) => e.preventDefault()}>
			<input
				type="text"
				className={style.input}
				placeholder="Type your message..."
				value={message}
				onChange={(e) => setMessage(e.target.value)}
			/>
			<button
				className={`${style.btn} ${message && style.active}`}
				onClick={createMsg}
			>
				Send
			</button>
		</form>
	);
};

export default MessageForm;
