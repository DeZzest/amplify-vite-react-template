import React from 'react';
import style from './NavigationBar.module.css';

interface NavigationBarProps {
	userProfile: { name: string; email: string } | null;
	onSignOut: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
	userProfile,
	onSignOut,
}) => {
	return (
		<nav className={style.navigation_bar}>
			<div className={style.title}>My Chat App</div>
			<div className={style.user}>
				{userProfile ? (
					<>
						<span className={style.name}>{userProfile.name}</span>
						<button className={style.btn} onClick={onSignOut}>
							Sign Out
						</button>
					</>
				) : (
					<button className={style.btn}>Sign In</button>
				)}
			</div>
		</nav>
	);
};

export default NavigationBar;
