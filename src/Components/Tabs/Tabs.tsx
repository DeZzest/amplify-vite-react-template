import React from 'react';

interface TabsProps {
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
	return (
		<div className="tabs">
			<button
				className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
				onClick={() => setActiveTab('chat')}
			>
				Chats
			</button>
			<button
				className={`tab ${activeTab === 'user' ? 'active' : ''}`}
				onClick={() => setActiveTab('user')}
			>
				Users
			</button>
			<button
				className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
				onClick={() => setActiveTab('saved')}
			>
				Saved Messages
			</button>
		</div>
	);
};

export default Tabs;