import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '../../contexts/ChatContext.js';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import type { Message } from '../../contexts/ChatContext.js';

export const UserChat: React.FC = () => {
    const {
        messages,
        addMessage,
        isTyping,
        setIsTyping
    } = useChatContext();
    const [input, setInput] = useState('');
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Scroll para última mensagem
    const scrollToBottom = (force = false) => {
        if (!chatContainerRef.current || !messagesEndRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        if (force || isAtBottom) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Detecta se usuário está no topo ou meio do chat
    const [userIsAtBottom, setUserIsAtBottom] = useState(true);
    useEffect(() => {
        const onScroll = () => {
            if (!chatContainerRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const atBottom = scrollHeight - scrollTop - clientHeight < 50;
            setUserIsAtBottom(atBottom);
            if (atBottom) setUnread(0);
        };
        const ref = chatContainerRef.current;
        if (ref) ref.addEventListener('scroll', onScroll);
        return () => { if (ref) ref.removeEventListener('scroll', onScroll); };
    }, []);

    // Só autoscroll se usuário está no final
    useEffect(() => {
        if (userIsAtBottom) {
            scrollToBottom();
            setUnread(0);
        } else {
            setUnread(unread + 1);
        }
        // eslint-disable-next-line
    }, [messages]);

    // Quick replies (exemplo)
    const quickReplies = [
        'Sobre o projeto',
        'Falar com Humano',
        'Ajuda',
        'Discord',
    ];

    // Envio de mensagem
    const handleSend = () => {
        if (!input.trim() || isTyping) return;
        addMessage({
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date(),
        });
        setInput('');
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1200);
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    // Quick reply handler
    const handleQuickReply = (reply: string) => {
        setInput(reply);
        handleSend();
    };
    // Renderiza links estilizados
    const renderText = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, i) =>
            urlRegex.test(part) ? (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 bg-blue-50 rounded px-1 mx-0.5 underline">{part}</a>
            ) : (
                <React.Fragment key={i}>{part}</React.Fragment>
            )
        );
    };
    // Renderiza balão de mensagem
    const MessageBubble = ({ msg }: { msg: Message }) => {
        const isUser = msg.sender === 'user';
        return (
            <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                        <Bot className="w-4 h-4" />
                    </div>
                )}
                <div className={`relative max-w-[80%] px-4 py-2 rounded-2xl shadow ${isUser ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-50 text-gray-900 rounded-bl-sm'} flex flex-col`}>
                    <span className="text-sm break-words">{renderText(msg.text)}</span>
                    <span className="text-xs text-gray-400 mt-1 self-end">{msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {/* Cauda do balão */}
                    <span className={`absolute ${isUser ? 'right-[-8px] bottom-2 border-l-8 border-l-blue-600' : 'left-[-8px] bottom-2 border-r-8 border-r-gray-50'} border-t-8 border-b-8 border-t-transparent border-b-transparent`}></span>
                </div>
                {isUser && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        <User className="w-4 h-4" />
                    </div>
                )}
            </div>
        );
    };
    // Indicador de digitação
    const TypingIndicator = () => (
        <div className="flex items-center gap-2 px-4 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-xs text-blue-400">Digitando...</span>
        </div>
    );
    // Botão ir para última mensagem
    const GoToLast = () => (
        <button onClick={() => scrollToBottom(true)} className="absolute right-4 bottom-20 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-all">
            ↓
        </button>
    );
    // Header
    const Header = () => (
        <div className="flex items-center gap-3 p-4 border-b bg-white rounded-t-2xl shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                <Bot className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-gray-900">NoxMedia Bot</span>
                <span className="text-xs text-green-500">Online</span>
            </div>
        </div>
    );
    // Quick replies + Falar com Humano
    const QuickReplies = () => (
        <div className="flex flex-wrap gap-2 p-2 overflow-x-auto">
            {quickReplies.map((reply) => (
                <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="rounded-md bg-gray-50 border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:shadow hover:bg-blue-50 transition-all"
                >
                    {reply}
                </button>
            ))}
            <button
                onClick={() => handleQuickReply('Falar com Humano')}
                className="rounded-md bg-blue-600 text-white px-4 py-2 ml-2 font-semibold shadow hover:bg-blue-700 transition-all"
            >
                Falar com Humano
            </button>
        </div>
    );
    // Input
    const InputBar = () => (
        <div className="relative flex items-center gap-2 p-4 bg-white border-t rounded-b-2xl shadow-inner">
            <input
                type="text"
                className="flex-1 px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-gray-50"
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
            />
            <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all disabled:opacity-50"
                aria-label="Enviar"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
    );
    return (
        <div className="w-full h-full max-w-md mx-auto flex flex-col rounded-2xl shadow-2xl bg-white overflow-hidden relative">
            <Header />
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto scroll-smooth p-4 space-y-3 bg-gray-50">
                {messages.map((msg: Message) => <MessageBubble key={msg.id} msg={msg} />)}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>
            <QuickReplies />
            <InputBar />
            {unread > 0 && <GoToLast />}
        </div>
    );
};