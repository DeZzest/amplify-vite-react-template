import React from 'react';
import MessageForm from '../MessageForm/MessageForm';
import Message from '../Message/Message';
import './ChatRoom.css'

export const ChatRoom = () => {
	return (
		<div className='chat_room'>
			<h4>User Name</h4>

			<Message variant="owner" />
			<Message variant="friend" />
			<Message variant="friend" />
			<Message variant="owner" />
			<Message variant="friend" />
			<MessageForm />
		</div>
	);
};
