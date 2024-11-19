import { useContext, useState } from 'react';
import style from './ChatAssistantRoom.module.css';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';
import { StoreContext } from '../../Context';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { RichBar } from '../RichBar/RichBar';

const client = generateClient<Schema>();

interface Props {}

const layout: ('row' | 'row-reverse' | 'column' | 'column-reverse')[] = [
	'row',
	'column',
	'column-reverse',
	'row-reverse',
];
const pos: ('start' | 'center' | 'end')[] = ['start', 'center', 'end'];

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
	const [layoutVariant, setLayoutVariant] = useState<number[]>([0]);
	const [posVariant, setPosVariant] = useState<number[]>([0]);
	const store = useContext(StoreContext);

	const sendMessage = async () => {
		const { data, errors } = await client.queries.GptMessage({
			content: value,
		});
		console.log(data, errors);
		if (data) {
			if (data.imgGpt) {
				setMessages((prev) => [
					...prev,
					{ user: 'assistant', img: data.imgGpt!, aiName: 'gpt' },
				]);
				setLayoutVariant([...layoutVariant, 0]);
				setPosVariant([...posVariant, 0]);
			} else if (data.content) {
				setMessages((prev) => [
					...prev,
					{ user: 'assistant', content: data.content!, aiName: 'gpt' },
				]);
				setLayoutVariant([...layoutVariant, 0]);
				setPosVariant([...posVariant, 0]);
			}
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
				{messages.map((item, index) => (
					<li
						className={`${style.message} ${
							item.user === 'user' ? style.owner : style.friend
						}`}
					>
						{item.user === 'user' && (
							<p className={style.content}>{item.content}</p>
						)}
						{item.user === 'assistant' && (
							<p
								className={style.content}
								style={{
									flexDirection: layout[layoutVariant[index]],
									alignItems: pos[posVariant[index]],
								}}
							>
								{item.user === 'assistant' && item.img && (
									<RichBar
										onChange={(layountVariant, posVariant) => {
											setLayoutVariant((prev) => {
												const updatedArray = [...prev];
												updatedArray.splice(index, 1, layountVariant);
												return updatedArray;
											});

											setPosVariant((prev) => {
												const updatedArray = [...prev];
												updatedArray.splice(index, 1, posVariant);
												return updatedArray;
											});

											console.log(posVariant);
										}}
									/>
								)}
								<p style={{ textAlign: pos[posVariant[index]] }}>
									{item.aiName === 'gpt' ? 'GPT ' : 'STABLE '}
								</p>
								{item.img ? (
									<img className={style.photo} src={item.img} />
								) : (
									<p>{item.content}</p>
								)}
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
						setLayoutVariant([...layoutVariant, 0]);
						setPosVariant([...posVariant, 0]);
						sendMessage();
					}}
				>
					send
				</button>
			</div>
		</div>
	);
};
