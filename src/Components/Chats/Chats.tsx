
/*
import React, { useState, useEffect, useContext } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data'; // імпорт клієнта для API
import { StoreContext } from '../../Context'; // імпорт контексту збереження
import { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

function Chats() {
	const { user, signOut } = useAuthenticator();
	const store = useContext(StoreContext);
	const [currentChat, setCurrentChat] = useState<Schema['Chat']['type']>();

	const getChat = async (userId: string) => {
		try {
			// Отримуємо UserChat або створюємо новий
			const { data: UserChat } = await client.models.ChatParticipant.get(
				{
					id: store!.currentUser?.id + userId,
				},
				{ authMode: 'apiKey' }
			);

			if (UserChat?.chatId) {
				// Якщо чат існує, завантажуємо його
				const { data: chat } = await client.models.Chat.get(
					{
						id: UserChat.chatId,
					},
					{ authMode: 'apiKey' }
				);
				setCurrentChat(chat!);
			} else {
				// Інакше створюємо новий чат
				const { data: newChat } = await client.models.Chat.create({});
				await client.models.ChatParticipant.create({
					chatId: newChat!.id,
					userId: store!.currentUser!.id,
					id: userId + store!.currentUser?.id,
				});
				await client.models.ChatParticipant.create({
					chatId: newChat!.id,
					userId: userId,
					id: store!.currentUser?.id + userId,
				});
				setCurrentChat(newChat!);
			}
		} catch (error) {
			console.error("Error fetching or creating chat:", error);
		}
	};

	useEffect(() => {
		// Отримуємо інформацію про користувача
		const getUser = async () => {
			if (user && !store?.currentUser) {
				const { data } = await client.models.User.get({ id: user.userId });
				if (data) {
					store!.setCurrentUser(data);
				} else {
					try {
						const { data: newUser } = await client.models.User.create(
							{
								id: user.userId,
								email: user.signInDetails?.loginId || '',
							},
							{ authMode: 'userPool' }
						);
						store!.setCurrentUser(newUser!);
					} catch (error) {
						console.error("Error creating user:", error);
					}
				}
			}
		};
		getUser();
	}, [user, store]);

	return (
		<main>
			<h1>Logged in as {user.signInDetails?.loginId}</h1>

			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				
				{currentChat ? (
					<p>Chat ID: {currentChat.id}</p> // Відображення ID чату
				) : (
					<p>No active chat. Select a chat to start messaging.</p> // Повідомлення про відсутність активного чату
				)}
			</div>

			<button className="signOut__btn" onClick={signOut}>
				Sign out
			</button>
		</main>
	);
}

export default Chats;
*/