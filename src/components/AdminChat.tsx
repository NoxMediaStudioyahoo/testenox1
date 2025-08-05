import React, { useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { ChatSession } from '../types/ChatMessage';

export const AdminChat: React.FC = () => {
    const { user } = useAuth();
    const {
        messages,
        sessions,
        currentSession,
        setCurrentSession,
        fetchSessions,
        fetchMessages,
        sendMessage,
        markAsRead,
    } = useChat();
    const [messageInput, setMessageInput] = useState('');

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchSessions();
        }
    }, [user, fetchSessions]);

    useEffect(() => {
        if (currentSession) {
            fetchMessages(currentSession.id);
        }
    }, [currentSession, fetchMessages]);

    const handleSessionSelect = (session: ChatSession) => {
        setCurrentSession(session);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSession || !messageInput.trim()) return;

        try {
            await sendMessage(currentSession.id, messageInput);
            setMessageInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleMarkAsRead = (messageIds: string[]) => {
        if (currentSession) {
            markAsRead(currentSession.id, messageIds);
        }
    };

    if (!user || user.role !== 'admin') {
        return <div>Unauthorized</div>;
    }

    return (
        <div className="admin-chat-container">
            <div className="sessions-list">
                <h2>Active Sessions</h2>
                {sessions.map(session => (
                    <div
                        key={session.id}
                        className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                        onClick={() => handleSessionSelect(session)}
                    >
                        <span>User: {session.userId}</span>
                        <span>Status: {session.status}</span>
                    </div>
                ))}
            </div>

            <div className="chat-window">
                {currentSession ? (
                    <>
                        <div className="messages-container">
                            {messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`message ${message.senderType === 'admin' ? 'sent' : 'received'}`}
                                >
                                    <div className="message-content">{message.content}</div>
                                    <div className="message-timestamp">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="message-input-form">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button type="submit">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="no-session-selected">
                        Select a chat session to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};