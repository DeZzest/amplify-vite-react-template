import React from 'react';
import style from './Sidebar.module.css';
import Users from '../Users/Users';
import { Chats } from '../Chats/Chats';

interface Props {
	activeTab: string;
	getChat: (id: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, getChat }) => {

	return (
		<div className={`${style.sidebar}`}>

			{activeTab === 'user' && (
				<Users onUserSelect={(userId) => getChat(userId)} />
			)}
			{(activeTab === 'chat' || activeTab === 'saved') && <Chats onUserSelect={(userId) => getChat(userId)} /> }
		</div>
	);
};
