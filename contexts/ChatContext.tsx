import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'admin' | 'system';
  timestamp: Date;
  quickReplies?: string[];
  isTyping?: boolean;
  isRead?: boolean;
}

export interface ConversationLog {
  id: string;
  type: 'user' | 'bot' | 'admin' | 'system';
  message: string;
  timestamp: Date;
  userId?: string;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (message: Message) => void;
  ticketNumber: string | null;
  setTicketNumber: React.Dispatch<React.SetStateAction<string | null>>;
  conversationLogs: ConversationLog[];
  setConversationLogs: React.Dispatch<React.SetStateAction<ConversationLog[]>>;
  isTyping: boolean;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  awaitingHuman: boolean;
  setAwaitingHuman: React.Dispatch<React.SetStateAction<boolean>>;
  adminAssumiu: boolean;
  setAdminAssumiu: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Carregar do localStorage se existir
  function loadFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      // Corrige datas
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          ...item,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
        })) as any;
      }
      return parsed;
    } catch {
      return fallback;
    }
  }

  const [messages, setMessages] = useState<Message[]>(() => loadFromStorage('noxmedia-messages', []));
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [conversationLogs, setConversationLogs] = useState<ConversationLog[]>(() => loadFromStorage('noxmedia-logs', []));
  const [isTyping, setIsTyping] = useState(false);
  const [awaitingHuman, setAwaitingHuman] = useState(false);
  const [adminAssumiu, setAdminAssumiu] = useState(false);

  // WebSocket ref
  const wsRef = useRef<WebSocket | null>(null);

  // Persistir no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('noxmedia-messages', JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    localStorage.setItem('noxmedia-logs', JSON.stringify(conversationLogs));
  }, [conversationLogs]);

  // WebSocket para mensagens em tempo real
  useEffect(() => {
    // Altere a URL conforme seu backend
    const ws = new window.WebSocket('ws://localhost:8000/ws/chat');
    wsRef.current = ws;

    ws.onopen = () => {
      // Opcional: console.log('WebSocket conectado');
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === 'message' && data.message) {
          // Garante que timestamp é Date
          const msg = {
            ...data.message,
            timestamp: data.message.timestamp ? new Date(data.message.timestamp) : new Date()
          };
          setMessages(prev => [...prev, msg]);
          setConversationLogs(prev => [
            ...prev,
            {
              id: msg.id,
              timestamp: msg.timestamp,
              type: msg.sender === 'bot' ? 'bot' : msg.sender,
              message: msg.text,
              userId: msg.sender === 'user' ? 'user_1' : msg.sender === 'admin' ? 'admin' : undefined
            }
          ]);
        }
      } catch (e) {
        // Ignorar mensagens inválidas
      }
    };
    ws.onerror = () => {
      // Opcional: console.error('WebSocket erro');
    };
    ws.onclose = () => {
      // Opcional: console.log('WebSocket desconectado');
    };
    return () => {
      ws.close();
    };
  }, []);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    setConversationLogs(prev => [
      ...prev,
      {
        id: message.id,
        timestamp: message.timestamp,
        type: message.sender === 'bot' ? 'bot' : message.sender,
        message: message.text,
        userId: message.sender === 'user' ? 'user_1' : message.sender === 'admin' ? 'admin' : undefined
      }
    ]);
    // Envia mensagem pelo WebSocket para o backend
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', message }));
    }
  };

  return (
    <ChatContext.Provider value={{
      messages,
      setMessages,
      addMessage,
      ticketNumber,
      setTicketNumber,
      conversationLogs,
      setConversationLogs,
      isTyping,
      setIsTyping,
      awaitingHuman,
      setAwaitingHuman,
      adminAssumiu,
      setAdminAssumiu,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};