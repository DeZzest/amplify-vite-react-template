import React, { useContext, useEffect, useState } from 'react';
import MessageForm from '../MessageForm/MessageForm';
import Message from '../Message/Message';
import './ChatRoom.css';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';
import { StoreContext } from '../../Context';

const client = generateClient<Schema>();

interface Props {
	currentChat: {
		chatId: string;
		email: string;
	};
}

export const ChatRoom: React.FC<Props> = ({ currentChat }) => {
	const store = useContext(StoreContext);
	const [messages, setMessages] = useState<
		{
			id: string;
			content: string;
			createdAt: string;
			userId: string;
		}[]
	>([]);

	useEffect(() => {
		const sub = client.models.Message.observeQuery({
			selectionSet: ['content', 'id', 'createdAt', 'userId'],
			authMode: 'userPool',
			filter: { chatId: { eq: currentChat.chatId } },
		}).subscribe({
			next(value) {
				const messages = value.items.map((item) => ({
					id: item.id,
					content: item.content,
					createdAt: item.createdAt,
					userId: item.userId!,
				}));

				console.log(messages);
				setMessages(messages);
			},
		});

		return () => {
			sub.unsubscribe();
		};
	}, [currentChat]);

	return (
		<div className="chat_room">
			<h4 className="chat_room_user_name">{currentChat.email}</h4>

			<div className="messages">
				{messages.map((item) => (
					<Message
						msgData={{
							content: item.content,
							createdAt: item.createdAt,
							id: item.id,
						}}
						variant={
							item.userId === store?.currentUser?.id ? 'owner' : 'friend'
						}
					/>
				))}
			</div>
			<MessageForm chatId={currentChat.chatId} />
		</div>
	);
};
