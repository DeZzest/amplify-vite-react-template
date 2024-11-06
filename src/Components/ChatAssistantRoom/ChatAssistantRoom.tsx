import { useContext, useState } from 'react';
import style from './ChatAssistantRoom.module.css';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';
import { StoreContext } from '../../Context';
import { IoArrowBackCircleSharp } from 'react-icons/io5';

const client = generateClient<Schema>();

interface Props {}

export const ChatAssistantRoom: React.FC<Props> = () => {
	const [messages, setMessages] = useState<
		{
			img?: string;
			aiName?: string;
			content?: string;
			user: 'user' | 'assistant';
		}[]
	>([]);
	const [value, setValue] = useState<string>('');
	const store = useContext(StoreContext);

	const sendMessage = async () => {
		const { data, errors } = await client.queries.GptMessage({
			content: value,
		});
		console.log(data, errors);
		if (data) {
			setMessages((prev) => [
				...prev,
				{ user: 'assistant', img: data.imgGpt, aiName: 'gpt' },
			]);
			setMessages((prev) => [
				...prev,
				{ user: 'assistant', img: data.imgStable, aiName: 'stable' },
			]);
		}

		setValue('');
	};

	return (
		<div className={`${style.room} ${store!.isChatAssistant && style.active}`}>
			<div className={style.header}>
				<div
					onClick={() => store!.setIsChatAssistant(false)}
					className={`${style.btnBack} ${
						store!.isChatAssistant && style.active
					}`}
				>
					<IoArrowBackCircleSharp size={30} color={'white'} />
				</div>
				<h4 className={style.room_name}>Assistant</h4>
			</div>

			<ul className={style.messages}>
				{messages.map((item) => (
					<li
						className={`${style.message} ${
							item.user === 'user' ? style.owner : style.friend
						}`}
					>
						{item.user === 'user' && (
							<p className={style.content}>{item.content}</p>
						)}
						{item.user === 'assistant' && (
							<p className={style.content}>
								<p className={style.content}>{item.aiName === 'gpt' ? 'GPT ' : 'STABLE '}</p>
								<img className={style.photo} src={item.img} />
							</p>
						)}
					</li>
				))}
			</ul>

			<div className={style.form}>
				<input
					className={style.input}
					type="text"
					value={value}
					placeholder="Ask Assistant"
					onChange={(e) => setValue(e.target.value)}
				/>
				<button
					className={`${style.btn} ${value && style.active}`}
					onClick={() => {
						setMessages((prev) => [...prev, { user: 'user', content: value }]);
						sendMessage();
					}}
				>
					send
				</button>
			</div>
		</div>
	);
};
