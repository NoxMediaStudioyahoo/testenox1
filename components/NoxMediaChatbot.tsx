import React, { useReducer, useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, MoreVertical, Paperclip, ChevronDown } from 'lucide-react';
import { useChatContext, Message as ChatMessage } from '../contexts/ChatContext.tsx';
import { addTicket, updateTicket, getTicket } from '../utils/ticketDb.ts';
import { buscarRespostaComScore } from "./conhecimento.tsx";
import ReactMarkdown from 'react-markdown';

// Estados possíveis do fluxo
const CHAT_STATES = {
    IDLE: 'IDLE',
    ASKING_NAME: 'ASKING_NAME',
    AWAITING_PROBLEM_DESCRIPTION: 'AWAITING_PROBLEM_DESCRIPTION',
    TICKET_ACTIVE: 'TICKET_ACTIVE',
    ADMIN_CONTROLLING: 'ADMIN_CONTROLLING',
};

// Ações possíveis
const ACTIONS = {
    OPEN_CHAT: 'OPEN_CHAT',
    ASK_FOR_HUMAN: 'ASK_FOR_HUMAN',
    SUBMIT_NAME: 'SUBMIT_NAME',
    SUBMIT_PROBLEM: 'SUBMIT_PROBLEM',
    CREATE_TICKET: 'CREATE_TICKET',
    CLOSE_TICKET: 'CLOSE_TICKET',
    ADMIN_LOGIN: 'ADMIN_LOGIN',
    ADMIN_LOGOUT: 'ADMIN_LOGOUT',
    RESET: 'RESET',
};

// Estado inicial
const initialChatState = {
    chatState: CHAT_STATES.IDLE,
    userName: null,
    ticketNumber: null,
    adminAuth: false,
    adminPanel: false,
    debugMode: false,
    lastClosedTicket: null,
};

// Adicione o chatReducer antes do useReducer
function chatReducer(state: typeof initialChatState, action: { type: string; payload?: any }): typeof initialChatState {
    switch (action.type) {
        case ACTIONS.OPEN_CHAT:
            return { ...state, chatState: CHAT_STATES.IDLE };
        case ACTIONS.ASK_FOR_HUMAN:
            return { ...state, chatState: CHAT_STATES.ASKING_NAME };
        case ACTIONS.SUBMIT_NAME:
            return { ...state, chatState: CHAT_STATES.AWAITING_PROBLEM_DESCRIPTION, userName: action.payload };
        case ACTIONS.SUBMIT_PROBLEM:
            return { ...state, chatState: CHAT_STATES.TICKET_ACTIVE };
        case ACTIONS.CREATE_TICKET:
            return { ...state, chatState: CHAT_STATES.TICKET_ACTIVE, ticketNumber: action.payload };
        case ACTIONS.CLOSE_TICKET:
            return { ...state, chatState: CHAT_STATES.IDLE, ticketNumber: null, userName: null, lastClosedTicket: state.ticketNumber };
        case ACTIONS.ADMIN_LOGIN:
            return { ...state, adminAuth: true, chatState: CHAT_STATES.ADMIN_CONTROLLING };
        case ACTIONS.ADMIN_LOGOUT:
            return { ...state, adminAuth: false, adminPanel: false, chatState: CHAT_STATES.IDLE };
        case ACTIONS.RESET:
            return { ...initialChatState };
        default:
            return state;
    }
}

const NoxMediaChatbot: React.FC = () => {
    // Estado e dispatch do reducer no início do componente
    const [chatFlow, dispatch] = useReducer(chatReducer, initialChatState);

    const {
        messages,
        setMessages,
        addMessage,
        ticketNumber,
        isTyping,
        setIsTyping,
        awaitingHuman
    } = useChatContext();

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [adminPanel, setAdminPanel] = useState(false);
    const [adminAuth, setAdminAuth] = useState(false);
    const [lastMessageCount, setLastMessageCount] = useState(0);
    const [autoRefresh] = useState(true);
    const [adminAssumiu, setAdminAssumiu] = useState(false);
    const [userIsAtBottom, setUserIsAtBottom] = useState(true);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    // Adicione o ref do input
    const inputRef = useRef<HTMLInputElement>(null);

    // --- Pausa e retoma foco do input ao copiar mensagem ---
    const [pauseInputFocus, setPauseInputFocus] = useState(false);
    // Foco permanente no input: sempre que o chat estiver aberto, força o foco no campo de digitar
    useEffect(() => {
        if (!isOpen || pauseInputFocus) return;
        const focusInput = () => {
            if (inputRef.current) inputRef.current.focus();
        };
        focusInput();
        // Foca a cada 300ms enquanto o chat estiver aberto
        const interval = setInterval(focusInput, 300);
        return () => clearInterval(interval);
    }, [isOpen, pauseInputFocus]);

    // Refina o autoscroll para comportamento WhatsApp
    const SCROLL_TOLERANCE = 40; // px
    const scrollToBottom = (force = false) => {
        if (!chatContainerRef.current || !messagesEndRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < SCROLL_TOLERANCE;
        if (force || isAtBottom) {
            window.requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            });
        }
    };

    // Detecta se usuário está no final e controla seta
    useEffect(() => {
        const onScroll = () => {
            if (!chatContainerRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const atBottom = scrollHeight - scrollTop - clientHeight < SCROLL_TOLERANCE;
            setUserIsAtBottom(atBottom);
            setShowScrollDown(!atBottom && scrollTop > 100);
        };
        const ref = chatContainerRef.current;
        if (ref) ref.addEventListener('scroll', onScroll);
        return () => { if (ref) ref.removeEventListener('scroll', onScroll); };
    }, []);

    // Autoscroll WhatsApp-like: só rola se usuário está no final
    useEffect(() => {
        // Aguarda renderização para garantir scroll correto
        setTimeout(() => {
            // Só rola automaticamente se o usuário está no final E a última mensagem foi adicionada pelo bot OU pelo usuário
            if (messages.length === 1 || (isOpen && messages.length === 0)) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                return;
            }
            if (userIsAtBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 0);
    }, [messages.length, userIsAtBottom, isOpen]);

    // Sempre rola para o final ao abrir nova conversa ou reiniciar
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setTimeout(() => scrollToBottom(true), 100);
        }
    }, [isOpen, messages.length]);

    // Atualiza userIsAtBottom corretamente ao abrir o chat
    useEffect(() => {
        if (isOpen && chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            setUserIsAtBottom(scrollHeight - scrollTop - clientHeight < SCROLL_TOLERANCE);
        }
    }, [isOpen]);

    // Sincronizar logs com mensagens
    useEffect(() => {
        setLastMessageCount(messages.length);
    }, [messages, lastMessageCount]);

    // Recebe prop isOnline do painel admin (via window/global)
    const [isOnline, setIsOnline] = useState(true);

    // Sincroniza status online/offline com painel admin
    useEffect(() => {
        function handleStatusChange(e: any) {
            if (typeof e.detail?.isOnline === 'boolean') setIsOnline(e.detail.isOnline);
        }
        window.addEventListener('noxmedia-admin-status', handleStatusChange);
        return () => window.removeEventListener('noxmedia-admin-status', handleStatusChange);
    }, []);

    // Função centralizada para mensagem inicial do bot
    function getInitialBotMessage() {
        return {
            text: "Olá! Sou o assistente do NoxMedia Studio. Como posso ajudar?",
            quickReplies: [
                "Apoiar projeto",
                "Discord",
                "Legendas",
                isOnline ? "Falar com humano" : "Falar com humano (indisponível no momento)"
            ]
        };
    }

    useEffect(() => {
        if (isOpen && messages.length === 0 && !adminAssumiu) {
            setTimeout(() => {
                const initial = getInitialBotMessage();
                addBotMessage(initial.text, initial.quickReplies);
            }, 500);
        }
        // Reseta o estado quando o chat é fechado
        if (!isOpen) {
            dispatch({ type: ACTIONS.RESET });
        }
    }, [isOpen, messages.length, adminAssumiu]);

    // Habilitar admin auth com comando especial
    useEffect(() => {
        if (inputValue === '/admin' && !adminAuth) {
            setAdminAuth(true);
            setInputValue('');
            addSystemMessage('Modo administrador ativado');
        }
    }, [inputValue, adminAuth]);

    // Adiciona ticket ao banco local ao criar
    const createTicketInDb = (ticketNumber: string) => {
        const ticket = {
            ticketNumber,
            createdAt: new Date().toISOString(),
            status: 'pendente' as 'pendente',
            userName: chatFlow.userName || 'Usuário',
            messages: []
        };
        addTicket(ticket);
        // Notifica painel admin
        window.dispatchEvent(new CustomEvent('ticketCreated', { detail: ticket }));
        // Toca som de novo ticket
        new Audio('public/sounds/popup.mp3').play().catch(() => {});
        setAdminAssumiu(false);
        setAdminAuth(false);
        return ticket;
    };

    // Adiciona id da mensagem ao ticket
    const addMessageToTicket = (ticketNumber: string, messageId: string) => {
        const ticket = getTicket(ticketNumber);
        if (ticket) {
            updateTicket(ticketNumber, { messages: [...ticket.messages, messageId] });
        }
    };

    const addBotMessage = (text: string, quickReplies?: string[]) => {
        // Não envia mensagens automáticas se admin assumiu
        if (adminAssumiu) return;
        // Não envia se o ticket está em atendimento por humano
        if (ticketNumber) {
            const ticket = getTicket(ticketNumber);
            if (ticket && ticket.status === 'em atendimento') return;
        }
        const message: ChatMessage = {
            id: Date.now().toString(),
            text,
            sender: 'bot',
            timestamp: new Date(),
            quickReplies
        };
        addMessage(message);
        if (ticketNumber) addMessageToTicket(ticketNumber, message.id);
    };

    const addSystemMessage = (text: string) => {
        const message: ChatMessage = {
            id: Date.now().toString(),
            text,
            sender: 'system',
            timestamp: new Date()
        };
        addMessage(message);
        if (ticketNumber) addMessageToTicket(ticketNumber, message.id);
    };

    // Remover função não utilizada
    // const closeTicketWithMessage = () => {
    //     if (chatFlow.ticketNumber) {
    //         updateTicket(chatFlow.ticketNumber, { status: 'finalizado' });
    //         addSystemMessage(`Ticket #${chatFlow.ticketNumber} foi finalizado. Obrigado por conversar conosco! Se precisar de mais ajuda, estamos à disposição.`);
    //         addAdminMessage('✅ Seu atendimento foi finalizado. Caso precise de mais suporte, é só chamar!');
    //         dispatch({ type: ACTIONS.CLOSE_TICKET });
    //         setAdminAssumiu(false);
    //         setAdminPanel(false);
    //         setTimeout(() => {
    //             setMessages([]);
    //             const initial = getInitialBotMessage();
    //             addBotMessage(initial.text, initial.quickReplies);
    //         }, 500);
    //     }
    // };

    // Modifique o AdminPanel para usar o novo painel
    // const AdminPanel = () => <AdminPanelPage />;

    // Autorefresh: atualiza mensagens a cada 2 segundos
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            // Aqui você pode buscar as mensagens do backend/localStorage
            // Exemplo: se usar localStorage
            const stored = localStorage.getItem('noxmedia-messages');
            if (stored) {
                try {
                    const msgs = JSON.parse(stored);
                    if (Array.isArray(msgs)) setMessages(msgs);
                } catch {}
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [autoRefresh, setMessages]);

    // Sincronizar status do ticket
    useEffect(() => {
        function closeChatbotTicket(ticketNum: string) {
            // Só envia se não foi enviado para esse ticket
            if (chatFlow.ticketNumber === ticketNum && chatFlow.lastClosedTicket !== ticketNum) {
                dispatch({ type: ACTIONS.CLOSE_TICKET });
                setAdminAssumiu(false);
                setAdminPanel(false);
                const systemMsg = `Ticket #${ticketNum} foi finalizado pelo administrador. Iniciando nova conversa.`;
                addSystemMessage(systemMsg);
                setTimeout(() => {
                    const botMsg = "Como posso ajudar você hoje?";
                    const quickReplies = ["Apoiar projeto", "Discord", "Legendas", "Falar com humano"];
                    addBotMessage(botMsg, quickReplies);
                }, 500);
            }
        }
        
        // Verifica o ticket atual
        if (chatFlow.ticketNumber) {
            const ticket = getTicket(chatFlow.ticketNumber);
            if (!ticket || ticket.status === 'finalizado' || ticket.status === 'fechado') {
                closeChatbotTicket(chatFlow.ticketNumber);
            }
        }
        
        // Listener para evento de fechamento de ticket
        const handleTicketClosed = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail && customEvent.detail.ticketNumber) {
                closeChatbotTicket(customEvent.detail.ticketNumber);
            }
        };
        
        window.addEventListener('ticketClosed', handleTicketClosed);
        return () => {
            window.removeEventListener('ticketClosed', handleTicketClosed);
        };
    }, [chatFlow.ticketNumber, chatFlow.lastClosedTicket, adminPanel, adminAssumiu, addSystemMessage, addBotMessage]);

    // Message handlers
    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const messageText = inputValue.trim();
        setInputValue('');
        // Foca o input após limpar
        setTimeout(() => { inputRef.current?.focus(); }, 0);

        // Add user message
        const message: ChatMessage = {
            id: Date.now().toString(),
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        };
        addMessage(message);
        if (chatFlow.ticketNumber) addMessageToTicket(chatFlow.ticketNumber, message.id);
        scrollToBottom(true);

        // Handle commands or get bot response
        if (messageText.startsWith('/')) {
            // Command handling is already in place
            return;
        }

        if (adminAssumiu) return;

        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            // Get and add bot response
            const response = getBotResponse(messageText, chatFlow);
            addBotMessage(response.text, response.quickReplies);
            // Despacha ações do fluxo conforme o tipo retornado
            switch (response.type) {
                case ACTIONS.ASK_FOR_HUMAN:
                    dispatch({ type: ACTIONS.ASK_FOR_HUMAN });
                    break;
                case ACTIONS.SUBMIT_NAME:
                    dispatch({ type: ACTIONS.SUBMIT_NAME, payload: response.payload });
                    break;
                case ACTIONS.CREATE_TICKET:
                    dispatch({ type: ACTIONS.CREATE_TICKET, payload: response.payload });
                    createTicketInDb(response.payload);
                    break;
                case ACTIONS.ADMIN_LOGIN:
                    dispatch({ type: ACTIONS.ADMIN_LOGIN });
                    setAdminPanel(true);
                    break;
                default:
                    break;
            }
            scrollToBottom(true);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Substituir handleQuickReply para envio automático
    const handleQuickReply = (reply: string) => {
        if (isTyping) return;
        setInputValue('');
        setTimeout(() => { inputRef.current?.focus(); }, 0);
        const message: ChatMessage = {
            id: Date.now().toString(),
            text: reply,
            sender: 'user',
            timestamp: new Date()
        };
        addMessage(message);
        if (chatFlow.ticketNumber) addMessageToTicket(chatFlow.ticketNumber, message.id);
        scrollToBottom(true);
        if (adminAssumiu) return;
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            const response = getBotResponse(reply, chatFlow);
            addBotMessage(response.text, response.quickReplies);
            // Corrigido: não force tipo de resposta, apenas use switch(response.type)
            switch (response.type) {
                case ACTIONS.ASK_FOR_HUMAN:
                    dispatch({ type: ACTIONS.ASK_FOR_HUMAN });
                    break;
                case ACTIONS.SUBMIT_NAME:
                    dispatch({ type: ACTIONS.SUBMIT_NAME, payload: response.payload });
                    break;
                case ACTIONS.CREATE_TICKET:
                    dispatch({ type: ACTIONS.CREATE_TICKET, payload: response.payload });
                    createTicketInDb(response.payload);
                    break;
                case ACTIONS.ADMIN_LOGIN:
                    dispatch({ type: ACTIONS.ADMIN_LOGIN });
                    setAdminPanel(true);
                    break;
                default:
                    break;
            }
            scrollToBottom(true);
        }, 1500);
    };

    // Salvar nome do usuário em localStorage e associar aos tickets
    useEffect(() => {
        if (chatFlow.userName) {
            localStorage.setItem('noxmedia-username', chatFlow.userName);
            if (ticketNumber) {
                const ticket = getTicket(ticketNumber);
                if (ticket) {
                    updateTicket(ticketNumber, { userName: chatFlow.userName });
                }
            }
        }
    }, [chatFlow.userName, ticketNumber]);

    // Nova função getBotResponse sem efeitos colaterais
    function getBotResponse(message: string, chatFlowState: typeof initialChatState): {
        type: string;
        text: string;
        quickReplies?: string[];
        payload?: any;
    } {
        const msg = message.trim().toLowerCase();
        // SUPREMO: Cancelar
        if (msg === 'cancelar') {
            dispatch({ type: ACTIONS.RESET });
            setMessages([]);
            setInputValue('');
            setIsTyping(false);
            setAdminPanel(false);
            setAdminAuth(false);
            setAdminAssumiu(false);
            return {
                type: 'RESET',
                text: 'Fluxo cancelado. Você pode começar uma nova conversa quando quiser.',
                quickReplies: [
                    'Como usar?',
                    'Formatos suportados',
                    'Falar com humano',
                    'Comandos'
                ]
            };
        }
        // ADMIN: comando especial para abrir modal
        if (msg === '/admin') {
            return {
                type: ACTIONS.ADMIN_LOGIN,
                text: 'Deseja abrir o painel administrativo? Confirme para continuar.',
                quickReplies: ['Sim, abrir painel', 'Cancelar']
            };
        }
        // Abrir chat
        if (chatFlowState.chatState === CHAT_STATES.IDLE && (msg === 'oi' || msg === 'olá' || msg === 'ola')) {
            return {
                type: ACTIONS.OPEN_CHAT,
                ...getInitialBotMessage()
            };
        }
        // Solicitação de humano
        if (
            msg.includes('falar com humano') ||
            msg.includes('humano') ||
            msg.includes('atendente') ||
            msg.includes('suporte humano')
        ) {
            if (!isOnline) {
                return {
                    type: 'INFO',
                    text: 'No momento não há atendentes disponíveis. Tente novamente mais tarde ou envie um e-mail para suporte@noxmedia.studio.',
                    quickReplies: ['Voltar', 'Discord']
                };
            }
            if (chatFlowState.chatState === CHAT_STATES.TICKET_ACTIVE) {
                return {
                    type: 'INFO',
                    text: 'Você já possui um ticket ativo nesta sessão. Aguarde o atendimento ou finalize o ticket antes de abrir outro.',
                    quickReplies: ['Voltar']
                };
            }
            if (chatFlowState.chatState === CHAT_STATES.IDLE) {
                return {
                    type: ACTIONS.ASK_FOR_HUMAN,
                    text: 'Você será atendido por um humano. Para agilizar, informe seu nome:',
                    quickReplies: []
                };
            }
        }
        // Recebe nome do usuário
        if (chatFlowState.chatState === CHAT_STATES.ASKING_NAME && !msg.startsWith('/')) {
            if (isValidName(message)) {
                return {
                    type: ACTIONS.SUBMIT_NAME,
                    text: `Obrigado, ${message.trim()}! Agora, descreva brevemente seu problema para que possamos direcionar o atendimento.`,
                    payload: message.trim(),
                    quickReplies: []
                };
            } else {
                return {
                    type: 'ASK_NAME_AGAIN',
                    text: 'Por favor, digite seu nome (não use comandos ou opções rápidas).',
                    quickReplies: []
                };
            }
        }
        // Recebe descrição do problema e cria ticket
        if (chatFlowState.chatState === CHAT_STATES.AWAITING_PROBLEM_DESCRIPTION && !msg.startsWith('/')) {
            const newTicket = `TK${Date.now().toString().slice(-6)}`;
            return {
                type: ACTIONS.CREATE_TICKET,
                text: `Seu ticket foi criado e encaminhado para nossa equipe!\n\nTicket: #${newTicket}\n\nAguarde, um atendente irá responder por aqui em breve. Se preferir, envie e-mail para suporte@noxmedia.studio ou acesse nosso Discord.`,
                payload: newTicket,
                quickReplies: ['Voltar']
            };
        }
        // Busca na base de conhecimento institucional/técnica
        const respostaConhecimento = buscarRespostaComScore(message);
        if (respostaConhecimento && typeof respostaConhecimento.response === 'string') {
            return {
                type: 'KNOWLEDGE',
                text: respostaConhecimento.response,
                quickReplies: respostaConhecimento.quickReplies || ['Voltar', 'Falar com humano']
            };
        }
        // Fallback melhorado
        return {
            type: 'FALLBACK',
            text: '🤔 Ainda não sei responder essa pergunta específica, mas estou sempre aprendendo!\n\nTente usar as opções abaixo ou descreva sua dúvida de outra forma. Se precisar de ajuda específica, posso conectá-lo com nossa equipe.',
            quickReplies: ['Como usar?', 'Formatos suportados', 'Falar com humano', 'Comandos']
        };
    };

    // --- NOVO VISUAL ESTILO FIN ---
    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-[#23243a] rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center z-50 border border-[#23243a]/60"
                    aria-label="Abrir chat"
                >
                    <MessageCircle className="w-6 h-6 text-white" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[370px] max-w-[98vw] h-[600px] max-h-[90vh] bg-[#181A20] rounded-2xl shadow-2xl border border-[#23243a] flex flex-col z-50 overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-[#181A20] border-b border-[#23243a]">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#23243a] flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-white text-base">NoxMedia Bot</span>
                                <span className="text-xs text-gray-400">A equipe também pode ajudar</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-2 hover:bg-[#23243a] rounded-lg transition-colores" title="Mais opções"><MoreVertical className="w-5 h-5 text-gray-300" /></button>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-[#23243a] rounded-lg transition-colores"><X className="w-5 h-5 text-gray-300" /></button>
                        </div>
                    </div>

                    {/* Mensagens */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#181A20] custom-scrollbar relative">
                        {/* Seta para descer */}
                        {showScrollDown && (
                            <button
                                className="fixed z-50 right-8 bottom-32 bg-[#23243a] hover:bg-[#23243a]/80 text-white rounded-full shadow-lg p-2 border border-[#23243a]/60 transition-all animate-fade-in"
                                style={{ boxShadow: '0 2px 8px #0003' }}
                                onClick={() => {
                                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                                }}
                                aria-label="Descer para o final"
                            >
                                <ChevronDown className="w-6 h-6" />
                            </button>
                        )}
                        {messages.map((message: ChatMessage) => {
                            const isUser = message.sender === 'user';
                            const isBot = message.sender === 'bot';
                            return (
                                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end group`}>
                                    {/* Balão */}
                                    <div className={`relative max-w-[80%] px-5 py-3 rounded-2xl ${isUser ? 'bg-white text-[#23243a]' : 'bg-[#23243a] text-white'} flex flex-col shadow-none`}
                                        onMouseDown={e => {
                                            if (window.getSelection) {
                                                setPauseInputFocus(true);
                                            }
                                        }}
                                        onMouseUp={e => {
                                            setTimeout(() => setPauseInputFocus(false), 300);
                                        }}
                                    >
                                        <span className="text-[15px] leading-relaxed break-words">
                                            <ReactMarkdown
                                                components={{
                                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                                                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                    strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                                                    a: ({node, ...props}) => (
                                                        <a
                                                            className="inline-block text-blue-400 underline hover:text-blue-300 transition-colors bg-blue-400/10 rounded px-2 py-1 cursor-pointer font-medium break-all border border-blue-400/20 shadow-sm"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            {...props}
                                                        />
                                                    ),
                                                    p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                                    code: ({node, ...props}) => <code className="bg-gray-800 text-yellow-200 px-1 rounded" {...props} />,
                                                }}
                                            >
                                                {message.text}
                                            </ReactMarkdown>
                                        </span>
                                        <span className="text-[11px] text-gray-400 mt-2 self-end">{message.timestamp && new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {/* Quick Replies */}
                                        {message.quickReplies && isBot && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {message.quickReplies.map((reply: string, index: number) => {
                                                    let colorClass = "bg-white text-black border-gray-200 hover:bg-gray-100";
                                                    if (/falar com humano|humano|atendente/i.test(reply)) colorClass = "bg-yellow-400 text-gray-900 border-yellow-400 hover:bg-yellow-300 font-bold";
                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleQuickReply(reply)}
                                                            className={`px-4 py-1.5 rounded-2xl font-medium text-sm border transition-all duration-150 shadow-sm ${colorClass}`}
                                                        >
                                                            {reply}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && (
                            <div className="flex items-center gap-2 px-4 py-2 animate-pulse">
                                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                <span className="text-xs text-gray-400">Digitando...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="relative p-4 bg-[#181A20] border-t border-[#23243a] flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-white transition-colores" tabIndex={-1} type="button" aria-label="Anexo"><Paperclip className="w-5 h-5" /></button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={awaitingHuman ? "Descreva seu problema..." : "Envie uma mensagem..."}
                            className="flex-1 px-4 py-3 rounded-2xl bg-[#23243a] text-white border-none focus:outline-none focus:ring-2 focus:ring-[#23243a] transition-all text-base placeholder:text-gray-400 shadow-inner"
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="p-2 bg-[#23243a] text-white rounded-2xl shadow-none hover:bg-[#23243a]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Enviar"
                        >
                            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                    <style>{`
                        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: #23243a; border-radius: 8px; }
                        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #23243a #181A20; }
                        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
                        .animate-fade-in { animation: fade-in 0.4s cubic-bezier(.4,0,.2,1); }
                    `}</style>
                </div>
            )}
        </>
    );
};

// Nova função para validar nome do usuário
function isValidName(input: string) {
    const invalids = [
        'falar com humano', 'humano', 'voltar', 'discord', 'apoio', 'ajuda', 'menu', 'comandos', 'cancelar', 'admin', 'atendente', 'suporte', 'projeto', 'legendas', 'como usar?', 'formatos suportados', 'apoiar projeto', 'como contribuir', 'roadmap', 'github', 'contribuir', 'equipe', 'sobre', 'problema', 'upload', 'download', 'editar legendas', 'exportar legendas', 'atalhos', 'voltar ao início', 'menu principal'
    ];
    const clean = input.trim().toLowerCase();
    return clean.length > 1 && !invalids.some(i => clean === i);
}

export default NoxMediaChatbot;