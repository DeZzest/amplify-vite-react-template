import React, { useEffect, useState } from 'react';

interface SavedMessagesProps {
	currentUser: string;
}

const SavedMessages: React.FC<SavedMessagesProps> = ({ currentUser }) => {
	const [savedMessages, setSavedMessages] = useState<string[]>([]);

	useEffect(() => {
		const messages = JSON.parse(localStorage.getItem(`savedMessages_${currentUser}`) || '[]');
		setSavedMessages(messages);
	}, [currentUser]);

	const handleDeleteMessage = (msg: string) => {
		const updatedMessages = savedMessages.filter(message => message !== msg);
		setSavedMessages(updatedMessages);
		localStorage.setItem(`savedMessages_${currentUser}`, JSON.stringify(updatedMessages));
	};

	return (
		<div>
			<h2>Saved Messages</h2>
			<ul>
				{savedMessages.map((msg, index) => (
					<li key={index}>
						{msg} <button onClick={() => handleDeleteMessage(msg)}>Delete</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default SavedMessages;
