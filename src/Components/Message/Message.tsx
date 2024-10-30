import React from 'react';
import './Message.css';
import { getTime } from '../../helpers/getTime';

interface MessageProps {
	variant: 'owner' | 'friend';
	content: string;
	createdAt: string;
}

const Message: React.FC<MessageProps> = ({ variant, content, createdAt }) => {
	const isOwner = variant === 'owner';

	return (
		<div className={`message ${isOwner ? 'message-owner' : 'message-friend'}`}>
			<div className="message-content">
				<p>{content}</p>
				<span className="message-time">{getTime(createdAt)}</span>
			</div>
		</div>
	);
};

export default Message;
