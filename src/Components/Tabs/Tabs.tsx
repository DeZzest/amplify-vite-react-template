import React from 'react';
import style from './Tabs.module.css';

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
				Chats
			</button>
			<button
				className={`${style.tab} ${activeTab === 'user' ? style.active : ''}`}
				onClick={() => setActiveTab('user')}
			>
				Users
			</button>
			<button
				className={`${style.tab} ${activeTab === 'saved' ? style.active : ''}`}
				onClick={() => setActiveTab('saved')}
			>
				Saved Messages
			</button>
		</div>
	);
};

export default Tabs;
