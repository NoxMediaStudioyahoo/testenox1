export interface ChatMessage {
    id: string;
    senderId: string;
    senderType: 'user' | 'admin';
    recipientId: string;
    content: string;
    timestamp: Date;
    isRead: boolean;
}

export interface ChatSession {
    id: string;
    userId: string;
    adminId?: string;
    messages: ChatMessage[];
    status: 'active' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}