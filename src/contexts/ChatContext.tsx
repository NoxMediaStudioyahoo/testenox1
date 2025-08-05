import React, { createContext, useContext, ReactNode } from 'react';
import { useChat } from '../hooks/useChat';

const ChatContext = createContext<ReturnType<typeof useChat> | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const chat = useChat();

    return (
        <ChatContext.Provider value={chat}>
            {children}
        </ChatContext.Provider>
    );
};

export const useGlobalChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useGlobalChat must be used within a ChatProvider');
    }
    return context;
};