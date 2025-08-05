import React, { useState } from 'react';
import { UserChat } from './UserChat';
import ChatFeedbackModal from './ChatFeedbackModal';
import '../styles/chat.css';

const NoxMediaChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackData, setFeedbackData] = useState<any>(null);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setShowFeedback(true);
    const handleFeedbackClose = () => {
        setShowFeedback(false);
        setIsOpen(false);
    };
    const handleFeedbackSubmit = (data: any) => {
        setFeedbackData(data);
        setShowFeedback(true); // Mostra confirmação de fim
    };
    const handleFeedbackSkip = () => {
        setShowFeedback(false);
        setIsOpen(false);
    };

    return (
        <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
            <button 
                onClick={handleOpen}
                className="chat-toggle-button"
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? '×' : '💬'}
            </button>
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>NoxSub Chat</h3>
                        <button onClick={handleClose} className="close-button">×</button>
                    </div>
                    <UserChat />
                </div>
            )}
            <ChatFeedbackModal
                open={showFeedback}
                onClose={handleFeedbackClose}
                onSubmit={handleFeedbackSubmit}
                onSkip={handleFeedbackSkip}
            />
        </div>
    );
};

export default NoxMediaChatbot;