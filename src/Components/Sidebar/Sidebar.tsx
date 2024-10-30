import React from 'react';
import './Sidebar.css';
import Users from '../Users/Users';
import { Chats } from '../Chats/Chats';

interface Props {
	activeTab: string;
	getChat: (id: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, getChat }) => {
	return (
		<div className="sidebar">
			{activeTab === 'user' && (
				<Users onUserSelect={(userId) => getChat(userId)} />
			)}
			{activeTab === 'chat' && <Chats />}
		</div>
	);
};
