import React from 'react';
import style from './Tabs.module.css';
import { IoChatbox } from 'react-icons/io5';
import { FaUserAlt } from 'react-icons/fa';
import { FiBookmark } from 'react-icons/fi';

interface TabsProps {
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
	return (
		<div className={style.tabs}>
			<button
				className={`${style.tab} ${activeTab === 'chat' ? style.active : ''}`}
				onClick={() => setActiveTab('chat')}
			>
				<p className={style.title}>Chats</p>
				<div className={style.icon}>
					<IoChatbox size={25} />
				</div>
			</button>
			<button
				className={`${style.tab} ${activeTab === 'user' ? style.active : ''}`}
				onClick={() => setActiveTab('user')}
			>
				<p className={style.title}>Users</p>
				<div className={style.icon}>
					<FaUserAlt size={25} />
				</div>
			</button>
			<button
				className={`${style.tab} ${activeTab === 'saved' ? style.active : ''}`}
				onClick={() => setActiveTab('saved')}
			>
				<p className={style.title}>Saved</p>
				<div className={style.icon}>
					<FiBookmark size={25} />
				</div>
			</button>
		</div>
	);
};

export default Tabs;
