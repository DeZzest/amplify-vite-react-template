import { generateClient } from 'aws-amplify/api';
import './Chats.css';
import { Schema } from '../../../amplify/data/resource';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../Context';

const client = generateClient<Schema>();

interface ChatProps {}

export const Chats: React.FC<ChatProps> = () => {
	const [chats, setChats] = useState<{ id: string; email: string }[]>([]);
	const store = useContext(StoreContext);

	useEffect(() => {
		const sub = client.models.ChatParticipant.observeQuery({
			filter: {
				id: { beginsWith: store!.currentUser?.id },
			},
			selectionSet: ['user.email', 'user.id'],
		}).subscribe({
			next(value) {
				const chats = value.items.map((item) => ({
					email: item.user.email!,
					id: item.user.id,
				}));
				setChats(chats);
			},
			error(value) {
				console.log(value);
			},
		});

		return () => sub.unsubscribe();
	}, []);
	return (
		<div className="chat-container">
			{chats.map((item) => (
				<li>{item.email}</li>
			))}
		</div>
	);
};
