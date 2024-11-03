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
	onSaveMessage?: (content: string, ) => void;
	disableContextMenu?: boolean;
}

const Message: React.FC<MessageProps> = ({ variant, msgData, onSaveMessage, disableContextMenu = false }) => {
	const isOwner = variant === 'owner';
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [show, setShow] = useState(false);

	const deleteMsg = async () => {
		await client.models.Message.delete({ id: msgData.id });
	};

	const saveMessage = async () => {
		await onSaveMessage!(msgData.content);
	};
	
	return (
		<div>
			<div
				className={`${style.message} ${isOwner ? style.owner : style.friend}`}
			>
				<div
					onContextMenu={(e) => {
						if (!disableContextMenu) {
							e.preventDefault();
							setPosition({ x: e.clientX, y: e.clientY });
							setShow(true);
						}
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
					saveMsg={saveMessage}
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
					saveMsg={saveMessage}
				/>
			)}
		</div>
	);
};

export default Message;
