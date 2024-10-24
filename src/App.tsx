import { useEffect, useState } from 'react';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Chat } from './Components/Chat';
import Tabs from './Components/Tabs';
import SavedMessages from './Components/SavedMessages';
import NavigationBar from './Components/NavigationBar';
import './App.css';

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();
  const [messages, setMessages] = useState<Array<{ id: string; content: string; userId: string; createdAt: string }>>([]);
  const [savedMessages, setSavedMessages] = useState<Array<{ content: string; userId: string; id: string }>>([]);
  const [activeTab, setActiveTab] = useState<string>('chat');

  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const [isLoadingSavedMessages, setIsLoadingSavedMessages] = useState<boolean>(true);

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
    const msgSub = client.models.Message.observeQuery().subscribe({
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

  function replyToMessage(messageId: string) {
    console.log("Replying to message:", messageId);
    // Implement the reply functionality here
  }

  function attachMessage(messageId: string) {
    console.log("Attaching message:", messageId);
    // Implement the attach functionality here
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
            id: (new Date()).toISOString() // або унікальний id
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

  function replyToSavedMsg(messageId: string) {
    console.log("Replying to saved message:", messageId);
    // Implement reply functionality here
  }

  function attachSavedMsg(messageId: string) {
    console.log("Attaching saved message:", messageId);
    // Implement attach functionality here
  }

  return (
    <main className="app">
      <NavigationBar userProfile={{ name: user?.signInDetails?.loginId || 'Guest', email: user?.signInDetails?.loginId ? user.signInDetails.loginId : '' }} onSignOut={signOut} />

      <div className="chat-container">
        <div className="chat-body">
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
                replyToMessage={replyToMessage}
                attachMessage={attachMessage}  
              />
            )
          )}
          
          {activeTab === 'saved' && (
            isLoadingSavedMessages ? (
              <div>Loading saved messages...</div>
            ) : (
              <SavedMessages 
                savedMessages={savedMessages} 
                createSavedMsg={createSavedMsg}
                deleteSavedMsg={deleteSavedMsg}
                updateSavedMsg={updateSavedMsg}
                replyToSavedMsg={replyToSavedMsg}
                attachSavedMsg={attachSavedMsg}
              />
            )
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
