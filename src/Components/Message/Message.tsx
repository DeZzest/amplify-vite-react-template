import React from 'react';
import './Message.css';

interface MessageProps {
	variant: 'owner' | 'friend';
}

const Message: React.FC<MessageProps> = ({ variant }) => {
	const isOwner = variant === 'owner';

	return (
		<div className={`message ${isOwner ? 'message-owner' : 'message-friend'}`}>
			<div className="message-content">
				<p>Message text</p>
				<span className="message-time">13:43</span>
			</div>
		</div>
	);
};

export default Message;
