import React, { useState, useEffect } from 'react';
import {
    Terminal, Eye, Trash2, Shield, Users, MessageSquare, Settings, Activity,
    Clock, Send, RefreshCw, CheckCircle, XCircle, Zap, TrendingUp, Monitor, Bell
} from 'lucide-react';
import { useChatContext } from '../contexts/ChatContext';
import { Message as ChatMessage, ConversationLog } from '../contexts/ChatContext';
import { getTickets, getTicket, updateTicket, removeTicket } from '../utils/ticketDb';

const AdminPanelPage: React.FC = () => {
    const {
        messages, setMessages, addMessage, ticketNumber, setTicketNumber,
        conversationLogs, setConversationLogs, adminAssumiu, setAdminAssumiu
    } = useChatContext();
    
    const [state, setState] = useState({
        debugMode: false,
        adminMessage: '',
        selectedLogType: 'all',
        autoRefresh: true,
        showNotification: false,
        showActiveUsersModal: false,
        showDebugModal: false,
        debugContent: '',
        selectedTicket: null as string | null,
        sidebarTab: 1,
        showTicketDetails: false,
        searchTicket: '',
    });
    
    const [ticketsDb, setTicketsDb] = useState(() => getTickets());
    const [ticketMessages, setTicketMessages] = useState<any[]>([]);
    const [isOnline, setIsOnline] = useState(true);

    const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));
    const activeTickets = ticketsDb.filter(t => ['pendente', 'em atendimento'].includes(t.status));
    const openTickets = ticketsDb.filter(t => ['pendente', 'em atendimento', 'aberto'].includes(t.status));
    const finishedTickets = ticketsDb.filter(t => ['finalizado', 'fechado'].includes(t.status));

    useEffect(() => {
        if (messages.length > 0) {
            const newLogs: ConversationLog[] = messages.map((message, index) => ({
                id: `log-${message.id || index}`,
                type: message.sender,
                message: message.text,
                timestamp: message.timestamp || new Date(),
                userId: message.sender === 'user' ? 'user_1' : message.sender === 'admin' ? 'admin' : undefined
            }));
            if (JSON.stringify(newLogs) !== JSON.stringify(conversationLogs)) {
                setConversationLogs(newLogs);
            }
        }
    }, [messages, setConversationLogs]);

    useEffect(() => {
        const refreshTickets = () => setTicketsDb(getTickets());
        refreshTickets();
        if (state.autoRefresh) {
            const interval = setInterval(refreshTickets, 2000);
            return () => clearInterval(interval);
        }
    }, [messages, conversationLogs, state.autoRefresh]);

    useEffect(() => {
        const handler = () => setTicketsDb(getTickets());
        window.addEventListener('ticketCreated', handler);
        return () => window.removeEventListener('ticketCreated', handler);
    }, []);

    useEffect(() => {
        if (!state.selectedTicket) {
            setTicketMessages([]);
            return;
        }
        const ticket = getTicket(state.selectedTicket);
        if (ticket?.messages) {
            // Filtra apenas mensagens do usuário e admin
            const msgs = (messages || []).filter(m =>
                ticket.messages.includes(m.id) || ticket.messages.includes(m.id?.toString())
            ).filter(m => m.sender === 'user' || m.sender === 'admin');
            setTicketMessages(msgs);
        } else setTicketMessages([]);
    }, [state.selectedTicket, messages]);

    // --- Actions ---
    const handleTicketSelect = (ticketNum: string | null) => {
        updateState({ selectedTicket: ticketNum, showTicketDetails: !!ticketNum });
        if (ticketNum) setTicketNumber(ticketNum);
    };

    const createMessage = (text: string, sender: string) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text, sender, timestamp: new Date()
    });

    const handleSendAdminMessage = () => {
        if (!state.adminMessage.trim()) return;
        const message: ChatMessage = createMessage(state.adminMessage, 'admin');
        addMessage(message);
        updateState({ adminMessage: '' });
        const ticketNum = state.selectedTicket || ticketNumber;
        if (ticketNum) {
            const ticket = getTicket(ticketNum);
            if (ticket) updateTicket(ticketNum, { messages: [...ticket.messages, message.id] });
        }
        const systemLog: ConversationLog = {
            id: `system-${Date.now()}`, type: 'system',
            message: `Admin enviou: "${state.adminMessage}"`, timestamp: new Date()
        };
        setConversationLogs([...(conversationLogs || []), systemLog]);
    };

    const clearLogs = () => {
        setConversationLogs([]);
        setMessages([]);
        setTicketNumber(null);
        updateState({ selectedTicket: null });
        addMessage(createMessage('Logs limpos pelo admin', 'system'));
    };

    const assumeTicket = () => {
        if (!ticketNumber) return;
        const message: ChatMessage = createMessage(`Atendente assumiu o ticket ${ticketNumber}. Olá! Como posso ajudá-lo?`, 'admin');
        addMessage(message);
        setAdminAssumiu(true);
        updateTicket(ticketNumber, { status: 'em atendimento' });
    };

    const generateTicket = () => {
        const newTicketNumber = `TK${Date.now().toString().slice(-6)}`;
        setTicketNumber(newTicketNumber);
        updateState({ selectedTicket: newTicketNumber, showNotification: true });
        setTimeout(() => updateState({ showNotification: false }), 3000);
        addMessage(createMessage(`Novo ticket: ${newTicketNumber}`, 'system'));
        new Audio('public/sounds/popup.mp3').play().catch(() => { });
    };

    const closeTicket = () => {
        if (!ticketNumber) return;
        updateTicket(ticketNumber, { status: 'finalizado' });
        // Mensagem amigável para o usuário
        const message: ChatMessage = createMessage(
            `✅ Seu atendimento foi finalizado. Caso precise de mais suporte, é só chamar! Obrigado por usar o NoxMedia Studio.`,
            'admin'
        );
        addMessage(message);
        setTicketNumber(null);
        updateState({ selectedTicket: null, showTicketDetails: false });
        setAdminAssumiu(false);
        window.dispatchEvent(new CustomEvent('ticketClosed', { detail: { ticketNumber } }));
        setTicketsDb(getTickets());
    };

    const handleDeleteTicket = (ticketNum: string) => {
        if (!ticketNum) return;
        const ticket = getTicket(ticketNum);
        if (!ticket) return;
        updateTicket(ticketNum, { status: 'finalizado' });
        window.dispatchEvent(new CustomEvent('ticketClosed', { detail: { ticketNumber: ticketNum } }));
        removeTicket(ticketNum);
        setTicketsDb(getTickets());
        if (state.selectedTicket === ticketNum) updateState({ selectedTicket: null, showTicketDetails: false });
        if (ticketNumber === ticketNum) setTicketNumber(null);
        setAdminAssumiu(false);
    };

    const handleFinishUser = (ticketNum: string) => {
        handleDeleteTicket(ticketNum);
        updateState({ showActiveUsersModal: false });
    };

    // --- Render ---
    // Sidebar tickets filtered by search
    const filteredTickets = openTickets.filter(t =>
        state.searchTicket.trim() === '' ||
        t.ticketNumber.toLowerCase().includes(state.searchTicket.trim().toLowerCase()) ||
        t.userName.toLowerCase().includes(state.searchTicket.trim().toLowerCase())
    );

    // --- MODALS ---
    // Usuários Ativos Modal
    const ActiveUsersModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#181A20] rounded-2xl p-8 shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><Users className="w-5 h-5" /> Usuários Ativos</h2>
                <ul className="mb-6">
                    {activeTickets.length === 0 ? (
                        <li className="text-slate-400">Nenhum usuário ativo no momento.</li>
                    ) : (
                        activeTickets.map(t => (
                            <li key={t.ticketNumber} className="mb-2 flex items-center justify-between">
                                <span className="text-white font-medium">{t.userName}</span>
                                <button onClick={() => handleFinishUser(t.ticketNumber)} className="ml-4 px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 text-xs">Finalizar</button>
                            </li>
                        ))
                    )}
                </ul>
                <button onClick={() => updateState({ showActiveUsersModal: false })} className="w-full py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all">Fechar</button>
            </div>
        </div>
    );

    // Debug Modal
    const DebugModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#181A20] rounded-2xl p-8 shadow-2xl w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><Terminal className="w-5 h-5" /> Debug LocalStorage</h2>
                <textarea
                    className="w-full h-60 bg-[#23243a] text-white rounded-xl p-4 mb-4 border border-[#282B33]"
                    value={state.debugContent}
                    readOnly
                />
                <div className="flex gap-2">
                    <button onClick={clearLogs} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all">Limpar Logs</button>
                    <button onClick={() => updateState({ showDebugModal: false })} className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all">Fechar</button>
                </div>
            </div>
        </div>
    );

    // Botão Online/Offline envia evento global
    const handleToggleOnline = () => {
        setIsOnline(v => {
            const novo = !v;
            window.dispatchEvent(new CustomEvent('noxmedia-admin-status', { detail: { isOnline: novo } }));
            return novo;
        });
    };

    return (
        <div className="fixed inset-0 flex flex-col md:flex-row bg-[#0A0B0E] text-slate-100">
            {/* Sidebar */}
            <aside className="w-full md:w-80 flex-shrink-0 bg-[#12141A] border-r border-[#1E2028] flex flex-col py-4 md:py-6 shadow-2xl overflow-hidden">
                {/* Logo section */}
                <div className="px-4 md:px-6 mb-6">
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-white tracking-wide">NoxMedia Admin</span>
                            <span className="text-xs text-purple-400">Painel de Controle</span>
                        </div>
                    </div>
                    
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full px-4 py-3 pl-10 rounded-xl bg-[#1A1D24] text-slate-200 border border-[#282B33] focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            placeholder="Buscar ticket..."
                            value={state.searchTicket}
                            onChange={e => updateState({ searchTicket: e.target.value })}
                        />
                        <Eye className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="px-4 md:px-6 mb-6 grid grid-cols-2 gap-3">
                    <button onClick={() => updateState({ showActiveUsersModal: true })} 
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all">
                        <Users className="w-4 h-4" />
                        <span>Usuários</span>
                    </button>
                    <button onClick={() => updateState({ showDebugModal: true, debugContent: localStorage.getItem('noxmedia-tickets') || 'Vazio' })}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1D24] text-slate-300 font-medium hover:bg-[#23262F] transition-all border border-[#282B33]">
                        <Terminal className="w-4 h-4" />
                        <span>Debug</span>
                    </button>
                </div>

                {/* Tickets List */}
                <div className="flex-1 px-4 md:px-6 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-400">Tickets Ativos</h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-purple-500/10 text-purple-400">{filteredTickets.length}</span>
                    </div>
                    
                    {filteredTickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                            <MessageSquare className="w-8 h-8 mb-2" />
                            <span className="text-sm">Nenhum ticket encontrado</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredTickets.map(ticket => (
                                <div
                                    key={ticket.ticketNumber}
                                    onClick={() => handleTicketSelect(ticket.ticketNumber)}
                                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                                        ${state.selectedTicket === ticket.ticketNumber 
                                            ? 'bg-purple-500/10 border border-purple-500/20' 
                                            : 'hover:bg-[#1A1D24] border border-transparent'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                                        ${state.selectedTicket === ticket.ticketNumber
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'bg-[#1A1D24] text-slate-400 group-hover:bg-[#23262F]'}`}>
                                        <Terminal className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <h4 className="font-semibold text-sm text-slate-200 truncate">{ticket.userName}</h4>
                                            <span className="text-[10px] text-slate-500 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 truncate">
                                            {ticket.ticketNumber}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-[#12141A]/50 backdrop-blur-lg border-b border-[#1E2028]">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">Painel de Controle</h1>
                        <button
                            onClick={handleToggleOnline}
                            className={`hidden md:inline-flex px-3 py-1 rounded-lg border text-sm font-medium transition-all
                                ${isOnline ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                        >
                            {isOnline ? 'Online' : 'Offline'}
                        </button>
                    </div>
                    <button
                        onClick={generateTicket}
                        className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4" />
                        <span className="hidden md:inline">Novo Ticket</span>
                    </button>
                </header>

                {/* Stats Grid - sticky no topo */}
                <section className="sticky top-0 z-10 bg-[#0A0B0E] border-b border-[#1E2028] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-8">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12141A] to-[#1D24] border border-[#282B33] shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-purple-500/10">
                                <Terminal className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Tickets Abertos</h3>
                                <p className="text-sm text-slate-400">Total em atendimento</p>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white">{openTickets.length}</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12141A] to-blue-900 border border-[#282B33] shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/10">
                                <CheckCircle className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Finalizados</h3>
                                <p className="text-sm text-slate-400">Total concluído</p>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white">{finishedTickets.length}</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12141A] to-blue-900 border border-[#282B33] shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/10">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Usuários Ativos</h3>
                                <p className="text-sm text-slate-400">Em tempo real</p>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white">{activeTickets.length}</div>
                    </div>
                </section>

                {/* Chat Section ocupa o restante */}
                <section className="flex-1 p-4 md:px-8 md:pb-8 overflow-hidden flex flex-col">
                    <div className="flex-1 rounded-2xl bg-[#12141A] border border-[#1E2028] shadow-2xl flex flex-col overflow-hidden">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-[#1A1D24] border-b border-[#282B33]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Eye className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Ticket {state.selectedTicket}</h3>
                                    <p className="text-sm text-slate-400">Em atendimento</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={assumeTicket}
                                    className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 font-medium hover:bg-green-500/20 transition-all border border-green-500/20"
                                >
                                    Assumir
                                </button>
                                <button
                                    onClick={closeTicket}
                                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-all border border-red-500/20"
                                >
                                    Finalizar
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {/* Se não houver ticket selecionado, não mostra nada */}
                            {!state.selectedTicket ? null : (
                                ticketMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                        <MessageSquare className="w-12 h-12 mb-3" />
                                        <span className="text-lg font-medium">Nenhuma mensagem neste ticket</span>
                                        <p className="text-sm text-slate-400 mt-2">Inicie a conversa enviando uma mensagem</p>
                                    </div>
                                ) : (
                                    ticketMessages.map((msg, idx) => {
                                        const isAdmin = msg.sender === 'admin';
                                        const isUser = msg.sender === 'user';
                                        return (
                                            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`flex items-end gap-3 max-w-[70%] ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium
                                                        ${isAdmin ? 'bg-purple-500/20 text-purple-400' : 
                                                          isUser ? 'bg-blue-500/20 text-blue-400' : 
                                                          'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {msg.sender.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className={`rounded-2xl px-5 py-3 ${isAdmin
                                                        ? 'bg-purple-500/10 text-purple-100'
                                                        : isUser
                                                            ? 'bg-blue-500/10 text-blue-100'
                                                            : 'bg-yellow-500/10 text-yellow-100'}`}>
                                                        <p className="text-sm">{msg.text}</p>
                                                        <p className="text-[10px] mt-2 opacity-60 font-medium">
                                                            {new Date(msg.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="px-6 py-4 bg-[#1A1D24] border-t border-[#282B33]">
                            <form onSubmit={e => { e.preventDefault(); handleSendAdminMessage(); }} 
                                  className="flex gap-3">
                                <input
                                    type="text"
                                    value={state.adminMessage}
                                    onChange={e => updateState({ adminMessage: e.target.value })}
                                    className="flex-1 px-4 py-3 rounded-xl bg-[#12141A] text-slate-200 border border-[#282B33] focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    maxLength={500}
                                    placeholder="Digite sua mensagem..."
                                />
                                <button
                                    type="submit"
                                    disabled={!state.adminMessage.trim()}
                                    className="px-5 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Enviar</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modals */}
            {state.showActiveUsersModal && <ActiveUsersModal />}
            {state.showDebugModal && <DebugModal />}
        </div>
    );
};

export default AdminPanelPage;