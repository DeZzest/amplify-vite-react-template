/*
import React, { useContext, useEffect, useState } from 'react';
import style from './ChatRoom.module.scss';
import Message from '../Message/Message'; // Assuming you have a Message component for displaying individual messages
import MessageForm from '../MessageForm/MessageForm'; // Assuming you have a form for sending messages
import { Schema } from '../../../amplify/data/resource'; // Importing your schema types
import { generateClient } from 'aws-amplify/data'; // Importing the client for AWS Amplify
import { StoreContext } from '../../Context'; // Context for accessing user information

const client = generateClient<Schema>();

interface Props {
  currentChat: Schema['Chat']['type'];
}

export const ChatRoom: React.FC<Props> = ({ currentChat }) => {
  const store = useContext(StoreContext);
  const [usersIds, setUsersIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<Array<Schema['Message']['type']>>([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getUserEmail = async () => {
      const { data } = await currentChat.users();

      for (const item of data) {
        const { data: user } = await item.user({ authMode: 'apiKey' });
        setUsersIds((prev) => [...prev, user!.id]);

        if (item.userId !== store!.currentUser!.id) {
          setUserEmail(user!.email);
        }
      }
    };

    getUserEmail();
  }, [currentChat, store]);

  useEffect(() => {
    const sub = client.models.Message.observeQuery({
      authMode: 'userPool',
      filter: {
        chatId: { eq: currentChat.id },
      },
    }).subscribe({
      next(value) {
        const msgs = [...value.items].sort((a, b) => {
          return a.createdAt.localeCompare(b.createdAt);
        });
        setMessages(msgs);
      },
    });

    return () => sub.unsubscribe();
  }, [currentChat]);

  return (
    <div className={`${style.chatRoom}`}>
      <div className={`${style.header}`}>
        <img
          className={`${style.avatar}`}
          src="https://cdn-icons-png.flaticon.com/512/6858/6858504.png"
          alt="User Avatar"
        />
        <div className={`${style.nameWrapper}`}>
          <h1 className={`${style.name}`}>{userEmail}</h1>
          <span className={`${style.status}`}>Online</span>
        </div>
      </div>

      <div className={`${style.messages}`}>
        {messages.map((item) => (
          <Message
            key={item.id}
            msgData={item}
            variant={
              item.userId === store!.currentUser!.id ? 'owner' : 'friend'
            }
          />
        ))}
      </div>

      <MessageForm usersIds={usersIds} currentChat={currentChat} />
    </div>
  );
};
*/

