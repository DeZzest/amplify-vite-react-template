import { useContext, useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Chat } from './Components/Chat/Chat';
import Tabs from './Components/Tabs/Tabs';
import SavedMessages from './Components/SavedMessages/SavedMessages';
import NavigationBar from './Components/NavigationBar/NavigationBar';
import './App.css';
import Users from './Components/Users/Users';
import { StoreContext } from './Context'; // new

const client = generateClient<Schema>();

interface Message {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface SavedMessage {
  content: string;
  userId: string;
  id: string;
}

function App() {
  const { user, signOut } = useAuthenticator();
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const [isLoadingSavedMessages, setIsLoadingSavedMessages] = useState<boolean>(true);

	const store = useContext(StoreContext);// new
	const [currentChat, setCurrentChat] = useState<Schema['Chat']['type']>();// new

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
    setIsLoadingMessages(true);
    const msgSub = client.models.Message.observeQuery({ authMode: 'apiKey' }).subscribe({
      next: (data) => {
        const formattedMessages = data.items.map(item => ({
          id: item.id || '',
          content: item.content || '',
          userId: item.userId || 'Unknown User',
          createdAt: item.createdAt || new Date().toISOString(),
        }));
        formattedMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setMessages(formattedMessages);
        setIsLoadingMessages(false);
      },
      error: () => setIsLoadingMessages(false),
    });

    return () => msgSub.unsubscribe();
  }, []);

  useEffect(() => {
    setIsLoadingSavedMessages(true);
    const savedMsgSub = client.models.SavedMessage.observeQuery().subscribe({
      next: (data) => {
        const formattedSavedMessages = data.items.map(item => ({
          content: item.content || '',
          userId: item.userId || 'Unknown User',
          id: item.id || '',
        })).filter(item => item.content !== '');

        setSavedMessages(formattedSavedMessages);
        setIsLoadingSavedMessages(false);
      },
      error: () => setIsLoadingSavedMessages(false),
    });

    return () => savedMsgSub.unsubscribe();
  }, []);

  function createMsg(value: string) {
    if (user) {
      client.models.Message.create(
        { content: value, userId: user.userId },
        { authMode: 'userPool' }
      ).catch((error: Error) => {
        console.error("Error creating message:", error);
      });
    }
  }

  async function clearChat() {
    setMessages([]);
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

  function saveMessage(messageId: string) {
    const messageToSave = messages.find(msg => msg.id === messageId);
    if (messageToSave) {
      createSavedMsg(messageToSave.content);
    }
  }

  async function deleteMessage(messageId: string) {
    try {
      await client.models.Message.delete({ id: messageId });
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }

  async function updateMessage(messageId: string, newContent: string) {
    try {
      await client.models.Message.update({ id: messageId, content: newContent });
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, content: newContent } : msg
        )
      );
    } catch (error) {
      console.error("Error updating message:", error);
    }
  }

  function createSavedMsg(content: string) {
    if (user) {
      client.models.SavedMessage.create({
        content,
        userId: user.signInDetails?.loginId || 'Unknown User',
      }).then(() => {
        setSavedMessages(prev => [
          ...prev,
          { 
            content, 
            userId: user.signInDetails?.loginId || 'Unknown User', 
            id: (new Date()).toISOString() // or unique ID
          }
        ]);
      }).catch((error: Error) => {
        console.error("Error creating saved message:", error);
      });
    }
  }

  function deleteSavedMsg(id: string) {
    client.models.SavedMessage.delete({ id }).then(() => {
      setSavedMessages(prev => prev.filter(msg => msg.id !== id));
    }).catch((error: Error) => {
      console.error("Error deleting saved message:", error);
    });
  }

  function updateSavedMsg(id: string, newContent: string) {
    client.models.SavedMessage.update({ id, content: newContent }).then(() => {
      setSavedMessages(prev => 
        prev.map(msg => msg.id === id ? { ...msg, content: newContent } : msg)
      );
    }).catch((error: Error) => {
      console.error("Error updating saved message:", error);
    });
  }

  const getChat = async (userId: string) => {
    if (!store?.currentUser) {
        console.error("No current user found.");
        return;
    }

    try {
			// Отримуємо ChatParticipant або створюємо новий
			const { data: ChatParticipant } = await client.models.ChatParticipant.get(
        {
            id: store.currentUser.id + userId,
        },
        { authMode: 'apiKey' }
    );
			if (ChatParticipant?.chatId) {
				// Якщо чат існує, завантажуємо його
				const { data: chat } = await client.models.Chat.get(
					{
						id: ChatParticipant.chatId,
					},
					{ authMode: 'apiKey' }
				);
				setCurrentChat(chat!);
			} else {
				// Інакше створюємо новий чат
				const { data: newChat } = await client.models.Chat.create({});
				await client.models.ChatParticipant.create({
					chatId: newChat!.id,
					userId: store!.currentUser!.id,
					id: userId + store!.currentUser?.id,
				});
				await client.models.ChatParticipant.create({
					chatId: newChat!.id,
					userId: userId,
					id: store!.currentUser?.id + userId,
				});
				setCurrentChat(newChat!);
			}
		} catch (error) {
      console.error("Error fetching or creating chat:", error);
  }
};

useEffect(() => {
  const getUser = async () => {
    console.log("error");
    if (user && store) { // Перевіряємо, чи store визначений
      if (!store.currentUser) {
        try {
          const { data } = await client.models.User.get({ id: user.userId });
          if (data) {
            store.setCurrentUser(data);
          } else {
            const { data: newUser } = await client.models.User.create(
              {
                id: user.userId,
                email: user.signInDetails?.loginId || '',
              },
              { authMode: 'userPool' }
            );
            store.setCurrentUser(newUser!);
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      console.error("Store or user is not defined.");
    }
  };

  getUser();
}, [user, store]);


  return (
    <main className="app">
      <NavigationBar userProfile={{ name: user?.signInDetails?.loginId || 'Guest', email: user?.signInDetails?.loginId ? user.signInDetails.loginId : '' }} onSignOut={signOut} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {currentChat ? (
        <p>Chat ID: {currentChat.id}</p>
      ) : (
        <p>No active chat. Select a chat to start messaging.</p>
      )}
    </div>
      <div className="chat-container">
        <div className="chat-body">
          <Users onUserSelect={(userId) => getChat(userId)} />
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {activeTab === 'chat' && (
            isLoadingMessages ? (
              <div>Loading messages...</div>
            ) : (
              <Chat 
                messages={messages} 
                createMsg={createMsg} 
                clearChat={clearChat} 
                currentUserId={user?.userId || ''} 
                saveMessage={saveMessage} 
                deleteMessage={deleteMessage} 
                updateMessage={updateMessage}
              />
            )
          )}
          
          {activeTab === 'saved' && (
            isLoadingSavedMessages ? (
              <div>Loading saved messages...</div>
            ) : (
              <SavedMessages 
                savedMessages={savedMessages}
                deleteSavedMsg={deleteSavedMsg}
                updateSavedMsg={updateSavedMsg}
                createSavedMsg={createSavedMsg} 
              />
            )
          )}
        </div>
      </div>
    </main>
  );
}
export default App;
