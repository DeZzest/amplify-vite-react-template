import React, { useState } from 'react';
import style from './Message.module.css';
import { getTime } from '../../helpers/getTime';
import ContextMenu from '../ContextMenu/ContextMenu';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

interface MessageProps {
	variant: 'owner' | 'friend';
	msgData: { content: string; createdAt: string; id: string };
	onSaveMessage: (message: string) => void;
}

const Message: React.FC<MessageProps> = ({
	variant,
	msgData,
	onSaveMessage,
}) => {
	const isOwner = variant === 'owner';
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [show, setShow] = useState(false);

	const deleteMsg = async () => {
		await client.models.Message.delete({ id: msgData.id });
	};

	return (
		<div>
			<div
				className={`${style.message} ${isOwner ? style.owner : style.friend}`}
			>
				<div
					onContextMenu={(e) => {
						e.preventDefault();
						setPosition({
							x: isOwner ? e.clientX - 120 : e.clientX,
							y: e.clientY,
						});
						setShow(true);
					}}
					className={style.content}
				>
					<p>{msgData.content}</p>
					<span className={style.time}>{getTime(msgData.createdAt)}</span>
				</div>
			</div>

			{isOwner ? (
				<ContextMenu
					position={position}
					setShow={(value) => setShow(value)}
					show={show}
					save={() => {
						navigator.clipboard.writeText(msgData.content).catch((err) => {
							console.error('Error copying text: ', err);
						});
					}}
					deleteMsg={deleteMsg}
					saveMsg={() => onSaveMessage(msgData.content)}
				/>
			) : (
				<ContextMenu
					position={position}
					setShow={(value) => setShow(value)}
					show={show}
					save={() => {
						navigator.clipboard.writeText(msgData.content).catch((err) => {
							console.error('Error copying text: ', err);
						});
					}}
					saveMsg={() => onSaveMessage(msgData.content)}
				/>
			)}
		</div>
	);
};

export default Message;
