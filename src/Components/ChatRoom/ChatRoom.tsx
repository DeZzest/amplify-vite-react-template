import React, { useContext, useEffect, useState } from 'react';
import MessageForm from '../MessageForm/MessageForm';
import Message from '../Message/Message';
import style from './ChatRoom.module.css';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';
import { StoreContext } from '../../Context';
import { IoArrowBackCircleSharp } from 'react-icons/io5';

const client = generateClient<Schema>();

interface Props {
	currentChat: {
		chatId: string;
		email: string;
	};
	setCurrentChat: () => void;
}

export const ChatRoom: React.FC<Props> = ({ currentChat, setCurrentChat }) => {
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

				setMessages(messages);
			},
		});

		return () => {
			sub.unsubscribe();
		};
	}, [currentChat]);

	const handleSaveMessage = async (content: string) => {
        if (!store?.currentUser) {
            console.error('No current user found');
            return;
        }
        await client.models.SavedMessage.create({
            content,
            userId: store.currentUser.id,
            chatId: currentChat.chatId,
            isSaved: true
        });
    };

	return (
		<div className={`${style.room} ${currentChat && style.active}`}>
			<div className={style.header}>
				<div
					onClick={() => setCurrentChat()}
					className={`${style.btnBack} ${currentChat && style.active}`}
				>
					<IoArrowBackCircleSharp size={30} color={'white'}/>
				</div>
				<h4 className={style.room_name}>{currentChat.email}</h4>
			</div>

			<div className={style.messages}>
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
						onSaveMessage={handleSaveMessage}
					/>
				))}
			</div>
			<MessageForm chatId={currentChat.chatId} />
		</div>
	);
};
