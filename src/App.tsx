import { useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Chat } from './Components/Chat';
import './App.css';

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();
  const [users, setUsers] = useState<Array<Schema['User']['type']>>([]);
  const [messages, setMessages] = useState<Array<{ content: string; userId: string; createdAt: string }>>([]);

  useEffect(() => {
    if (user) {
      client.models.User.list({
        filter: { id: { eq: user.userId } },
      }).then((result) => {
        if (result.data.length === 0) {
          client.models.User.create({
            id: user.userId,
            email: user.signInDetails?.loginId,
          });
        }
      });
    }
  }, [user]);

  useEffect(() => {
    const sub = client.models.User.observeQuery().subscribe({
      next: (data) => {
        setUsers([...data.items]);
      },
    });

    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const msgSub = client.models.Message.observeQuery().subscribe({
      next: (data) => {
        const formattedMessages = data.items.map(item => ({
          content: item.content || '',
          userId: item.userId || 'Unknown User', // Змінити на 'Unknown User', якщо userId недоступний
          createdAt: item.createdAt || new Date().toISOString(), // Додаємо createdAt
        }));
        // Сортуємо повідомлення за createdAt
        formattedMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setMessages(formattedMessages);
      },
    });

    return () => msgSub.unsubscribe();
  }, []);

  function createMsg(value: string) {
    if (user) {
      client.models.Message.create(
        { content: value, userId: user.userId },
        { authMode: 'userPool' }
      ).catch((error: Error) => {
        console.error(error);
      });
    }
  }

  async function clearChat() {
    setMessages([]); // Очищення локального стану

    try {
      const result = await client.models.Message.list();
      const deletePromises = result.data.map(msg => 
        client.models.Message.delete({ id: msg.id })
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  }

  return (
    <main>
      <div className="chat-container">
        <div className="chat-header">
          <h1 className="chat-title">Logged in as: {user?.signInDetails?.loginId}</h1>
          <button className="sign-out-button" onClick={signOut}>Sign Out</button>
        </div>
        <Chat 
          messages={messages} 
          createMsg={createMsg} 
          clearChat={clearChat} 
          currentUserId={user?.userId || ''} // Передача userId
        />
      </div>
    </main>
  );
}
export default App;
