import { useContext, useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import Tabs from './Components/Tabs/Tabs';
import NavigationBar from './Components/NavigationBar/NavigationBar';
import './App.css';
import { StoreContext } from './Context';
import { Sidebar } from './Components/Sidebar/Sidebar';
import { ChatRoom } from './Components/ChatRoom/ChatRoom';

const client = generateClient<Schema>();

function App() {
	const { user, signOut } = useAuthenticator();
	const [activeTab, setActiveTab] = useState<string>('chat');

	const store = useContext(StoreContext);
	const [currentChat, setCurrentChat] = useState<Schema['Chat']['type']>();

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
	}, [user]);

	const getChat = async (userId: string) => {
		if (!store?.currentUser) {
			console.error('No current user found.');
			return;
		}
		try {
			const { data: ChatParticipant } = await client.models.ChatParticipant.get(
				{
					id: store.currentUser.id + userId,
				}
			);
			if (ChatParticipant?.chatId) {
				const { data: chat } = await client.models.Chat.get({
					id: ChatParticipant.chatId,
				});
				setCurrentChat(chat!);
			} else {
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
			<div className="content">
				<Sidebar activeTab={activeTab} getChat={(userId) => getChat(userId)} />
				{currentChat && <ChatRoom />}
			</div>
			<Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
		</main>
	);
}
export default App;
