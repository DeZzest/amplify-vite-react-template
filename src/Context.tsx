import React, { createContext, useState } from 'react';
import { Schema } from '../amplify/data/resource';

interface Props {
	children: JSX.Element;
}

interface StoreI {
	currentUser: Schema['User']['type'] | null;
	setCurrentUser: React.Dispatch<
		React.SetStateAction<Schema['User']['type'] | null>
	>;

	selectedUserId: string;
	setSelectedUserId: React.Dispatch<React.SetStateAction<string>>;
}

export const StoreContext = createContext<StoreI | null>(null);

export const Context: React.FC<Props> = ({ children }) => {
	const [currentUser, setCurrentUser] = useState<Schema['User']['type'] | null>(
		null
	);
	const [selectedUserId, setSelectedUserId] = useState('');

	const store: StoreI = {
		currentUser,
		setCurrentUser,

		selectedUserId,
		setSelectedUserId,
	};

	return (
		<StoreContext.Provider value={store}>{children}</StoreContext.Provider>
	);
};