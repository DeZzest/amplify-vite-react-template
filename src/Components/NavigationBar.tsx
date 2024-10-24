import React from 'react';
import './NavigationBar.css';

interface NavigationBarProps {
  userProfile: { name: string; email: string } | null;
  onSignOut: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ userProfile, onSignOut }) => {
    return (
      <nav className="navigation-bar">
        <div className="nav-brand">My Chat App</div>
        <div className="nav-user-profile">
          {userProfile ? (
            <>
              <span className="user-name">{userProfile.name}</span>
              <button className="sign-out-button" onClick={onSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <button className="sign-in-button">Sign In</button>
          )}
        </div>
      </nav>
    );
  };
  

export default NavigationBar;
