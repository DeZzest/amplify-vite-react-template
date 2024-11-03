import React, { useEffect, useState, useContext } from 'react';
import Message from '../Message/Message';
import ContextMenu from '../ContextMenu/ContextMenu';
import style from './SavedMessages.module.css';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';
import { StoreContext } from '../../Context';
import { v4 as uuidv4 } from 'uuid';

const client = generateClient<Schema>();

interface MsgData {
    content: string;
    userId: string;
    id: string;
    createdAt: string;
}

const SavedMessages: React.FC = () => {
    const [savedMessages, setSavedMessages] = useState<Array<MsgData>>([]);
    const [isLoadingSavedMessages, setIsLoadingSavedMessages] = useState<boolean>(true);
    const [contextMenu, setContextMenu] = useState<{ show: boolean; position: { x: number; y: number }; msgId: string | null; content: string | null }>({ show: false, position: { x: 0, y: 0 }, msgId: null, content: null });
    const [newMessageContent, setNewMessageContent] = useState<string>('');
    const store = useContext(StoreContext);

    useEffect(() => {
        const fetchSavedMessages = async () => {
            const userId = store?.currentUser?.id; // Отримуємо ID користувача
            if (!userId) {
                setIsLoadingSavedMessages(false);
                return;
            }

            setIsLoadingSavedMessages(true);
            const savedMsgSub = client.models.SavedMessage.observeQuery({
                filter: { userId: { eq: userId } } // Фільтруємо за userId
            }).subscribe({
                next: (data) => {
                    const dbMessages = data.items
                        .map(item => ({
                            content: item.content || '',
                            userId: item.userId || 'Unknown User',
                            id: item.id,
                            createdAt: item.createdAt || new Date().toISOString(),
                        }))
                        .filter(item => item.content !== '');

                    setSavedMessages(dbMessages.sort((a, b) => b.createdAt.localeCompare(a.createdAt))); // Сортуємо за створеним часом
                    setIsLoadingSavedMessages(false);
                },
                error: () => {
                    setIsLoadingSavedMessages(false);
                },
            });

            return () => savedMsgSub.unsubscribe();
        };

        fetchSavedMessages();
    }, [store]);

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>, msgData: MsgData) => {
        event.preventDefault();
        setContextMenu({ show: true, position: { x: event.clientX, y: event.clientY }, msgId: msgData.id, content: msgData.content });
    };

    const handleDeleteMessage = async () => {
        if (contextMenu.msgId) {
            await client.models.SavedMessage.delete({ id: contextMenu.msgId });
            setSavedMessages((prevMessages) => {
                const updatedMessages = prevMessages.filter(msg => msg.id !== contextMenu.msgId);
                return updatedMessages;
            });
        }
        setContextMenu(prev => ({ ...prev, show: false }));
    };

    const handleCopyMessage = () => {
        if (contextMenu.content) {
            navigator.clipboard.writeText(contextMenu.content).then(() => {
                console.log('Message copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy message: ', err);
            });
        }
        setContextMenu(prev => ({ ...prev, show: false }));
    };

    const handleSaveMessage = async () => {
        const userId = store?.currentUser?.id; // Отримуємо ID користувача
        if (!userId || !newMessageContent) {
            return;
        }

        const newMessage: MsgData = {
            id: uuidv4(), // Генеруємо унікальний ID для повідомлення
            content: newMessageContent,
            userId: userId, // Використовуємо userId
            createdAt: new Date().toISOString(),
        };

        await client.models.SavedMessage.create(newMessage); // Зберігаємо повідомлення в базі даних

        setSavedMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, newMessage].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

            return updatedMessages;
        });

        setNewMessageContent('');
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSaveMessage();
    };

    return (
        <div className={style.room} onContextMenu={(e) => e.preventDefault()}>
            <h2 className={style.room_name}>Saved Messages</h2>

            <div className={style.messages}>
                {isLoadingSavedMessages ? (
                    <div>Loading saved messages...</div>
                ) : (
                    savedMessages.length === 0 ? (
                        <p>No saved messages.</p>
                    ) : (
                        savedMessages.map(msgData => (
                            <div key={msgData.id} onContextMenu={(event) => handleContextMenu(event, msgData)}>
                                <Message
                                    variant="owner"
                                    msgData={msgData}
                                    disableContextMenu={true}
                                />
                            </div>
                        ))
                    )
                )}
            </div>

            <form className={style.form} onSubmit={handleSubmit}>
                <input
                    type="text"
                    className={style.input}
                    placeholder="Type your saved message..."
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                />
                <button type="submit" className={style.btn}>
                    Save
                </button>
            </form>

            <ContextMenu
                show={contextMenu.show}
                setShow={(value) => setContextMenu(prev => ({ ...prev, show: value }))}
                position={contextMenu.position}
                deleteMsg={handleDeleteMessage}
                save={handleCopyMessage}
            />
        </div>
    );
};

export default SavedMessages;
