import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../Context';
import style from './Chats.module.css';

const client = generateClient<Schema>();

interface ChatProps {
	onUserSelect: (userId: string) => void;
}

export const Chats: React.FC<ChatProps> = ({ onUserSelect }) => {
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
	}, [store]);
	return (
		<div>
			<ul>
				<li className={style.chat}>GPT Assistant</li>

				{chats.map((item) => (
					<li className={style.chat} onClick={() => onUserSelect(item.id)}>
						{item.email}
					</li>
				))}
			</ul>
		</div>
	);
};
