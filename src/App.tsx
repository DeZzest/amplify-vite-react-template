import { useContext, useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import Tabs from './Components/Tabs/Tabs';
import NavigationBar from './Components/NavigationBar/NavigationBar';
import style from './App.module.css';
import { StoreContext } from './Context';
import { Sidebar } from './Components/Sidebar/Sidebar';
import { ChatRoom } from './Components/ChatRoom/ChatRoom';
import { ChatRoomHolder } from './Components/ChatRoomHolder/ChatRoomHolder';
import { ChatAssistantRoom } from './Components/ChatAssistantRoom/ChatAssistantRoom';

const client = generateClient<Schema>();

function App() {
	const { user, signOut } = useAuthenticator();
	const [activeTab, setActiveTab] = useState<string>('chat');

	const store = useContext(StoreContext);
	const [currentChat, setCurrentChat] = useState<{
		chatId: string;
		email: string;
	} | null>();

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
						email: user!.signInDetails!.loginId!,
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
		store!.setIsChatAssistant(false);
		try {
			const { data: ChatParticipant } = await client.models.ChatParticipant.get(
				{
					id: store.currentUser.id + userId,
				}
			);
			if (ChatParticipant?.chatId) {
				const { data: chat } = await client.models.Chat.get(
					{
						id: ChatParticipant.chatId,
					},
					{
						selectionSet: [
							'id',
							'chatParticipants.user.email',
							'chatParticipants.user.id',
						],
					}
				);
				const userEmail = chat?.chatParticipants.filter(
					(item) => item.user.id !== store.currentUser?.id
				);

				setCurrentChat({ chatId: chat!.id!, email: userEmail![0].user.email });
			} else {
				const { data: newChat } = await client.models.Chat.create({});
				await client.models.ChatParticipant.create({
					chatId: newChat!.id,
					userId: store!.currentUser!.id,
					id: userId + store!.currentUser?.id,
				});
				const { data } = await client.models.ChatParticipant.create(
					{
						chatId: newChat!.id,
						userId: userId,
						id: store!.currentUser?.id + userId,
					},
					{ selectionSet: ['user.email'] }
				);
				setCurrentChat({ chatId: newChat!.id!, email: data!.user!.email! });
			}
		} catch (error) {
			console.error('Error fetching or creating chat:', error);
		}
	};

	return (
		<main className={style.wrapper}>
			<div className={style.app}> 
				<NavigationBar
					userProfile={{
						name: user?.signInDetails?.loginId || 'Guest',
						email: user?.signInDetails?.loginId
							? user.signInDetails.loginId
							: '',
					}}
					onSignOut={signOut}
				/>
				<div className={style.content}>
					<Sidebar
						activeTab={activeTab}
						getChat={(userId) => getChat(userId)}
					/>

					{store!.isChatAssistant ? (
						<ChatAssistantRoom />
					) : currentChat ? (
						<ChatRoom
							setCurrentChat={() => setCurrentChat(null)}
							currentChat={currentChat}
						/>
					) : (
						<ChatRoomHolder />
					)}
				</div>
				<Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
			</div>
		</main>
	);
}
export default App;
