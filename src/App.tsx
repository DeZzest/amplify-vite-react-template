import { useContext, useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import Tabs from './Components/Tabs/Tabs';
import NavigationBar from './Components/NavigationBar/NavigationBar';
import './App.css';
import Users from './Components/Users/Users';
import { StoreContext } from './Context'; // new

const client = generateClient<Schema>();

function App() {
	const { user, signOut } = useAuthenticator();
	const [activeTab, setActiveTab] = useState<string>('chat');

	const store = useContext(StoreContext); // new
	const [currentChat, setCurrentChat] = useState<Schema['Chat']['type']>(); // new

	useEffect(() => {
		const getUser = async () => {
			if (user) {
				const { data } = await client.models.User.get({
					id: user.userId,
				});
				if (data?.id) {
					store!.setCurrentUser(data);
				} else {
					const { data: newUser } = await client.models.User.create({
						id: user.userId,
						email: user.signInDetails?.loginId,
					});
					store!.setCurrentUser(newUser!);
				}
			}
		};

		getUser();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	const getChat = async (userId: string) => {
		if (!store?.currentUser) {
			console.error('No current user found.');
			return;
		}

		try {
			// Отримуємо ChatParticipant або створюємо новий
			const { data: ChatParticipant } = await client.models.ChatParticipant.get(
				{
					id: store.currentUser.id + userId,
				},
				{ authMode: 'apiKey' }
			);
			if (ChatParticipant?.chatId) {
				// Якщо чат існує, завантажуємо його
				const { data: chat } = await client.models.Chat.get(
					{
						id: ChatParticipant.chatId,
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
			console.error('Error fetching or creating chat:', error);
		}
	};

	return (
		<main className="app">
			<NavigationBar
				userProfile={{
					name: user?.signInDetails?.loginId || 'Guest',
					email: user?.signInDetails?.loginId ? user.signInDetails.loginId : '',
				}}
				onSignOut={signOut}
			/>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				{currentChat ? (
					<p>Chat ID: {currentChat.id}</p>
				) : (
					<p>No active chat. Select a chat to start messaging.</p>
				)}
			</div>
			<div className="chat-container">
				<div className="chat-body">
					{activeTab === 'user' && (
						<Users onUserSelect={(userId) => getChat(userId)} />
					)}
					<Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
				</div>
			</div>
		</main>
	);
}
export default App;
