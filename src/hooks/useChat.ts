import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { ChatMessage, ChatSession } from '../types/ChatMessage';

const BACKEND_URL = 'http://localhost:8000/api';

export function useChat() {
    const { authFetch, user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const processedMessageIds = useRef<Set<string>>(new Set());
    const isUnmountedRef = useRef(false);

    // Cleanup processed message IDs periodically
    const cleanupProcessedIds = useCallback(() => {
        // Keep only last 1000 message IDs to prevent memory leak
        if (processedMessageIds.current.size > 1000) {
            const idsArray = Array.from(processedMessageIds.current);
            const recentIds = idsArray.slice(-500); // Keep last 500
            processedMessageIds.current = new Set(recentIds);
        }
    }, []);

    // Initialize WebSocket connection
    const connectWebSocket = useCallback(() => {
        if (!user || isUnmountedRef.current) return;

        // Close existing connection if any
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        const wsUrl = `ws://localhost:8000/ws/chat/${user.id}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setError(null); // Clear connection errors

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = undefined;
            }
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'message' && data.message) {
                    // Check if message has already been processed
                    if (!processedMessageIds.current.has(data.message.id)) {
                        processedMessageIds.current.add(data.message.id);
                        setMessages(prev => [...prev, data.message]);
                        cleanupProcessedIds();
                    }
                }
            } catch (err) {
                console.error('Error processing WebSocket message:', err);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Failed to establish real-time connection');
            setIsConnected(false);
        };

        socket.onclose = (event) => {
            console.log('WebSocket closed', event.code, event.reason);
            setIsConnected(false);

            // Only try to reconnect if not intentionally closed and component is still mounted
            if (event.code !== 1000 && !isUnmountedRef.current && !reconnectTimeoutRef.current) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectTimeoutRef.current = undefined;
                    connectWebSocket();
                }, 5000);
            }
        };

        wsRef.current = socket;
    }, [user, cleanupProcessedIds]);

    // Setup WebSocket connection
    useEffect(() => {
        isUnmountedRef.current = false;
        connectWebSocket();

        return () => {
            isUnmountedRef.current = true;

            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting');
                wsRef.current = null;
            }

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = undefined;
            }

            setIsConnected(false);
        };
    }, [connectWebSocket]);

    // Clear processed message IDs when session changes
    useEffect(() => {
        processedMessageIds.current.clear();
    }, [currentSession?.id]);

    // Fetch chat sessions
    const fetchSessions = useCallback(async () => {
        try {
            const response = await authFetch(`${BACKEND_URL}/chat/sessions`);
            if (!response.ok) throw new Error('Failed to fetch chat sessions');
            const data = await response.json();
            setSessions(data);
            setError(null); // Clear previous errors on successful fetch
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch sessions';
            setError(message);
            console.error('Error fetching sessions:', err);
        }
    }, [authFetch]);

    // Fetch messages for a specific session
    const fetchMessages = useCallback(async (sessionId: string) => {
        try {
            const response = await authFetch(`${BACKEND_URL}/chat/sessions/${sessionId}/messages`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();

            // Add fetched message IDs to processed set
            data.forEach((msg: ChatMessage) => processedMessageIds.current.add(msg.id));
            setMessages(data);
            setError(null); // Clear previous errors on successful fetch
            cleanupProcessedIds();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch messages';
            setError(message);
            console.error('Error fetching messages:', err);
        }
    }, [authFetch, cleanupProcessedIds]);

    // Send a message
    const sendMessage = useCallback(async (sessionId: string, content: string) => {
        try {
            const response = await authFetch(`${BACKEND_URL}/chat/sessions/${sessionId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    timestamp: new Date().toISOString(), // Use ISO string for consistency
                }),
            });

            if (!response.ok) throw new Error('Failed to send message');
            const message = await response.json();

            // Add sent message ID to processed set
            processedMessageIds.current.add(message.id);
            setMessages(prev => [...prev, message]);
            setError(null); // Clear previous errors on successful send

            return message;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to send message';
            setError(message);
            console.error('Error sending message:', err);
            throw err;
        }
    }, [authFetch]);

    // Create a new chat session
    const createSession = useCallback(async (userId: string) => {
        try {
            const response = await authFetch(`${BACKEND_URL}/chat/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    status: 'active',
                }),
            });

            if (!response.ok) throw new Error('Failed to create chat session');
            const session = await response.json();
            setSessions(prev => [...prev, session]);
            setError(null); // Clear previous errors on successful creation

            return session;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create session';
            setError(message);
            console.error('Error creating session:', err);
            throw err;
        }
    }, [authFetch]);

    // Mark messages as read
    const markAsRead = useCallback(async (sessionId: string, messageIds: string[]) => {
        try {
            const response = await authFetch(`${BACKEND_URL}/chat/sessions/${sessionId}/messages/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messageIds }),
            });

            if (!response.ok) throw new Error('Failed to mark messages as read');

            setMessages(prev =>
                prev.map(msg =>
                    messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
                )
            );
            setError(null); // Clear previous errors on successful update
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to mark messages as read';
            setError(message);
            console.error('Error marking messages as read:', err);
        }
    }, [authFetch]);

    // Clear error manually
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        messages,
        sessions,
        currentSession,
        error,
        isConnected,
        setCurrentSession,
        fetchSessions,
        fetchMessages,
        sendMessage,
        createSession,
        markAsRead,
        clearError,
    };
}