import React, { useEffect, useState, useContext } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Schema } from '../../../amplify/data/resource';
import { StoreContext } from '../../Context';
import './Users.css';

const client = generateClient<Schema>();

interface UserProps {
	name?: string;
}

const User: React.FC<UserProps> = ({ name }) => {
	return (
		<div className="user">
			<div className="contentWrapper">
				<div className="name">{name}</div>
			</div>
		</div>
	);
};

const Users: React.FC<{ onUserSelect: (userId: string) => void }> = ({
	onUserSelect,
}) => {
	const { user } = useAuthenticator();
	const store = useContext(StoreContext);
	const [users, setUsers] = useState<
		Array<{ id: string; email: string | null }>
	>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const subscription = client.models.User.observeQuery({
		}).subscribe({
			next(value) {
				const userList = value.items
					.filter((u) => u.id !== user.username) // Виключаємо поточного користувача
					.map((u) => ({ id: u.id, email: u.email || 'No Email' }));
				setUsers(userList);
				setIsLoading(false);
			},
			error(error) {
				console.error('Error fetching users:', error);
				setIsLoading(false);
			},
		});

		return () => subscription.unsubscribe();
	}, [user, store]);

	return (
		<div className="users-container">
			<h3>Users</h3>
			{isLoading ? (
				<p>Loading users...</p>
			) : (
				<ul className="user-list">
					{users.length > 0 ? (
						users.map((user) => (
							<li
								key={user.id}
								className="user-item"
								onClick={() => onUserSelect(user.id)}
							>
								<User name={user.email || 'No Email'} />
							</li>
						))
					) : (
						<p>No users available.</p>
					)}
				</ul>
			)}
		</div>
	);
};

export default Users;
