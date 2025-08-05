// @ts-nocheck
import React, { useState, useReducer, useMemo, useEffect } from 'react';
import { Star, Download, Users, Check, AlertCircle, Heart, Zap, Gift, Target, Sparkles, TrendingUp, Coffee, Award } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import NoxMediaChatbot from './NoxMediaChatbot';

// Função utilitária para gerar BRCode Pix estático (compatível EMVCo)
function emv(id: string, value: string) {
    return id + value.length.toString().padStart(2, '0') + value;
}

function generatePixBRCode({
    pixKey, name, city, amount, description, txid
}: {
    pixKey: string;
    name: string;
    city: string;
    amount: number;
    description?: string;
    txid?: string;
}): string {
    // Limites Pix
    name = name.slice(0, 25).toUpperCase();
    city = city.slice(0, 15).toUpperCase();
    description = description ? description.slice(0, 30) : '';
    txid = txid || ('TXID' + Date.now());

    // Campo 26: Merchant Account Information (Pix)
    const gui = emv('00', 'BR.GOV.BCB.PIX');
    const key = emv('01', pixKey);
    const desc = description ? emv('02', description) : '';
    const merchantAccountInfo = emv('26', gui + key + desc);

    // Campo 52: Merchant Category Code ("0000" para não especificado)
    const merchantCategory = emv('52', '0000');
    // Campo 53: Moeda (986 = BRL)
    const currency = emv('53', '986');
    // Campo 54: Valor
    const amountStr = amount ? emv('54', amount.toFixed(2)) : '';
    // Campo 58: País
    const country = emv('58', 'BR');
    // Campo 59: Nome do recebedor
    const merchantName = emv('59', name);
    // Campo 60: Cidade
    const merchantCity = emv('60', city);
    // Campo 62: Adicionais (TXID)
    const txidField = emv('05', txid);
    const addDataField = emv('62', txidField);

    // Monta o payload EMV
    let payload = [
        emv('00', '01'), // Payload Format Indicator
        merchantAccountInfo,
        merchantCategory,
        currency,
        amountStr,
        country,
        merchantName,
        merchantCity,
        addDataField
    ].filter(Boolean).join('');

    // Adiciona CRC16
    payload += '6304';
    payload += crc16(payload).toUpperCase();
    return payload;
}

// CRC16 para Pix
function crc16(str: string): string {
    let crc = 0xFFFF;
    for (let c of str) {
        crc ^= c.charCodeAt(0) << 8;
        for (let i = 0; i < 8; i++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).padStart(4, '0');
}

// Dados estáticos estáticos
const DONATION_OPTIONS = [
    {
        value: 5,
        label: 'Café do Dev',
        desc: 'Um cafézinho para manter a energia',
        icon: Coffee,
        popular: false
    },
    {
        value: 15,
        label: 'Apoio Regular',
        desc: 'Garante atualizações frequentes',
        icon: Heart,
        popular: true
    },
    {
        value: 30,
        label: 'Apoio Premium',
        desc: 'Acelera novas funcionalidades',
        icon: Zap,
        popular: false
    },
    {
        value: 50,
        label: 'Apoio Corporativo',
        desc: 'Contribuição empresarial',
        icon: Award,
        popular: false
    },
] as const;

const useGitHubStats = () => {
    const [stats, setStats] = useState({
        stars: '0',
        downloads: '0',
        activeUsers: '0',
        monthlyGrowth: '0'
    });

    useEffect(() => {
        let isMounted = true;

        const fetchStats = async () => {
            try {
                const response = await fetch('https://api.github.com/repos/PhilippeBoechat/NoxMedia');
                if (!response.ok) throw new Error('Erro ao buscar dados do GitHub');
                const data = await response.json();

                if (isMounted) {
                    setStats({
                        stars: data.stargazers_count.toString(),
                        downloads: (data.subscribers_count || 0).toString(), // usando subscribers como proxy para downloads
                        activeUsers: (data.watchers_count || 0).toString(), // usando watchers como proxy para usuários ativos
                        monthlyGrowth: (data.network_count || 0).toString() // usando network_count como proxy para crescimento
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar estatísticas:', error);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 60000); // Atualiza a cada minuto

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return stats;
};

// Types
interface DonationState {
    selectedAmount: number;
    customAmount: string;
    donorName: string;
    donorEmail: string;
    message: string;
    isProcessing: boolean;
    showSuccess: boolean;
    error: string | null;
    showThankYou: boolean;
}

type DonationAction =
    | { type: 'SET_SELECTED_AMOUNT'; payload: number }
    | { type: 'SET_CUSTOM_AMOUNT'; payload: string }
    | { type: 'SET_DONOR_NAME'; payload: string }
    | { type: 'SET_DONOR_EMAIL'; payload: string }
    | { type: 'SET_MESSAGE'; payload: string }
    | { type: 'START_PROCESSING' }
    | { type: 'SHOW_SUCCESS' }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'RESET' }
    | { type: 'SHOW_THANK_YOU' };

const donationReducer = (state: DonationState, action: DonationAction): DonationState => {
    switch (action.type) {
        case 'SET_SELECTED_AMOUNT':
            return { ...state, selectedAmount: action.payload, customAmount: '', error: null };
        case 'SET_CUSTOM_AMOUNT':
            return { ...state, customAmount: action.payload, selectedAmount: 0, error: null };
        case 'SET_DONOR_NAME':
            return { ...state, donorName: action.payload };
        case 'SET_DONOR_EMAIL':
            return { ...state, donorEmail: action.payload };
        case 'SET_MESSAGE':
            return { ...state, message: action.payload };
        case 'START_PROCESSING':
            return { ...state, isProcessing: true, error: null };
        case 'SHOW_SUCCESS':
            return { ...state, isProcessing: false, showSuccess: true };
        case 'SET_ERROR':
            return { ...state, isProcessing: false, error: action.payload };
        case 'RESET':
            return { ...state, showSuccess: false, error: null, showThankYou: false };
        case 'SHOW_THANK_YOU':
            return { ...state, showThankYou: true };
        default:
            return state;
    }
};

// Progress indicator
const ProgressIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => {
    const percentage = (current / total) * 100;
    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Meta Mensal</h3>
                <span className="text-sm text-slate-400">{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 mb-3 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-400">R$ {current.toFixed(0)}</span>
                <span className="text-slate-300">R$ {total.toFixed(0)}</span>
            </div>
        </div>
    );
};

// Altere para porta 8000 para unificar backend
const API_URL = 'http://localhost:8000/api/supporters';

const DonatePage: React.FC = () => {
    const [state, dispatch] = useReducer(donationReducer, {
        selectedAmount: 15,
        customAmount: '',
        donorName: '',
        donorEmail: '',
        message: '',
        isProcessing: false,
        showSuccess: false,
        error: null,
        showThankYou: false,
    });
    const [currentGoal, setCurrentGoal] = useState({ current: 0, total: 500 });
    const [recentDonors, setRecentDonors] = useState<any[]>([]);
    const [hoveredDonor, setHoveredDonor] = useState<number|null>(null);
    const githubStats = useGitHubStats();

    // Atualizar o array IMPACT_STATS para usar os valores do hook
    const IMPACT_STATS = [
        { icon: Star, label: 'GitHub Stars', value: githubStats.stars, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
        { icon: Download, label: 'Downloads', value: githubStats.downloads, color: 'text-blue-400', bg: 'bg-blue-500/20' },
        { icon: Users, label: 'Usuários Ativos', value: githubStats.activeUsers, color: 'text-green-400', bg: 'bg-green-500/20' },
        { icon: TrendingUp, label: 'Crescimento Mensal', value: githubStats.monthlyGrowth, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    ];

    // Buscar doações recentes e meta
    async function fetchDonors() {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setRecentDonors(data.slice(-12).reverse());
            setCurrentGoal(goal => ({ ...goal, current: data.reduce((sum: number, d: any) => sum + d.amount, 0) }));
        } catch (e) {
            // fallback: não faz nada
        }
    }

    useEffect(() => { fetchDonors(); }, []);

    const finalAmount = useMemo(() => {
        if (state.customAmount) {
            const custom = parseFloat(state.customAmount);
            return custom > 0 ? custom : 0;
        }
        return state.selectedAmount;
    }, [state.customAmount, state.selectedAmount]);
    const isValidAmount = finalAmount > 0 && finalAmount <= 50000;
    const isValidEmail = state.donorEmail === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.donorEmail);

    // --- NOVA LÓGICA PARA O QR CODE PIX ---
    const pixPayload = useMemo(() => {
        if (!isValidAmount) return '';
        return generatePixBRCode({
            pixKey: 'phdev1313@gmail.com',
            name: 'NoxMedia Studio',
            city: 'BRASILIA',
            amount: finalAmount,
            description: 'Doacao para NoxMedia',
            txid: 'TXID' + Date.now()
        });
    }, [finalAmount, isValidAmount]);

    async function handleDonate() {
        if (!isValidAmount) {
            dispatch({ type: 'SET_ERROR', payload: 'Por favor, insira um valor válido entre R$ 1 e R$ 50.000.' });
            return;
        }
        if (state.donorEmail && !isValidEmail) {
            dispatch({ type: 'SET_ERROR', payload: 'Por favor, insira um email válido.' });
            return;
        }
        dispatch({ type: 'START_PROCESSING' });
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: state.donorName && state.donorName.trim() ? state.donorName : 'Anônimo',
                    amount: Number(finalAmount),
                    message: state.message || '',
                    since: new Date().toLocaleDateString('pt-BR'),
                    tier: 'Doação',
                    logo: null
                })
            });
            const data = await response.json();
            if (!response.ok) {
                dispatch({ type: 'SET_ERROR', payload: data.error || 'Erro ao registrar doação.' });
                return;
            }
            dispatch({ type: 'SHOW_SUCCESS' });
            setTimeout(() => dispatch({ type: 'RESET' }), 1000);
            fetchDonors();
        } catch (e: any) {
            dispatch({ type: 'SET_ERROR', payload: e?.message || 'Erro ao registrar doação.' });
        }
    };
    return (
        <div className="min-h-screen bg-slate-0 relative">
            {/* Header com gradiente */}
            <div className="relative bg-gradient-to-br from-slate-0 via-slate-0 to-slate-900 border-b border-slate-0">
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-blue-400 font-medium">Projeto Open Source</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Apoie o Desenvolvimento do{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                NoxMedia Studio
                            </span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                            Contribua para manter este projeto open source gratuito e em constante evolução.
                            Sua doação nos permite dedicar mais tempo ao desenvolvimento de novas funcionalidades.
                        </p>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 py-12 relative">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Formulário de Doação */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 p-8 shadow-2xl">
                            <div className="flex items-center space-x-3 mb-8">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <Gift className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-semibold text-white">
                                    Fazer uma Contribuição
                                </h2>
                            </div>
                            {/* Opções de Valor */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-300 mb-4">
                                    Selecione um valor de contribuição
                                </label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {DONATION_OPTIONS.map(option => {
                                        const IconComponent = option.icon;
                                        const isSelected = finalAmount === option.value && !state.customAmount;

                                        return (
                                            <button
                                                key={option.value}
                                                className={`relative p-6 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105 ${isSelected
                                                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg'
                                                    : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:bg-slate-700 hover:shadow-lg'
                                                    }`}
                                                onClick={() => dispatch({ type: 'SET_SELECTED_AMOUNT', payload: option.value })}
                                                type="button"
                                            >
                                                {option.popular && (
                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-1 mb-0 bg-gradient-to-r from-green-400 to-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                                        Popular
                                                    </div>
                                                )}
                                                <div className="text-center">
                                                    <div className="w-8 h-8 mx-auto mb-3 text-blue-400">
                                                        <IconComponent className="w-full h-full" />
                                                    </div>
                                                    <div className="text-2xl font-bold text-white mb-2">
                                                        R$ {option.value}
                                                    </div>
                                                    <div className="text-sm font-medium text-blue-400 mb-1">
                                                        {option.label}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {option.desc}
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute -top-3 -left-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2 shadow-lg">
                                                        <Check className="w-2 h-2 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Valor Personalizado */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-300 mb-3">
                                    Ou digite um valor personalizado
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">
                                        R$
                                    </span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50000"
                                        step="1"
                                        placeholder="Digite um valor..."
                                        className="w-full pl-12 pr-4 py-4 bg-slate-700/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={state.customAmount}
                                        onChange={e => dispatch({ type: 'SET_CUSTOM_AMOUNT', payload: e.target.value })}
                                    />
                                </div>
                                {state.customAmount && finalAmount > 0 && (
                                    <p className="text-green-400 text-sm mt-2 flex items-center">
                                        <Check className="w-4 h-4 mr-1" />
                                        Valor personalizado: R$ {finalAmount.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            {/* Informações do Doador */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Nome completo (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={state.donorName}
                                        onChange={e => dispatch({ type: 'SET_DONOR_NAME', payload: e.target.value })}
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Email (opcional)
                                    </label>
                                    <input
                                        type="email"
                                        className={`w-full px-4 py-3 bg-slate-700/80 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${!isValidEmail ? 'border-red-500 focus:ring-red-500' : 'border-slate-600'
                                            }`}
                                        value={state.donorEmail}
                                        onChange={e => dispatch({ type: 'SET_DONOR_EMAIL', payload: e.target.value })}
                                        placeholder="seu@email.com"
                                    />
                                    {!isValidEmail && (
                                        <p className="text-red-400 text-sm mt-1 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            Email inválido
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Mensagem */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Mensagem de apoio (opcional)
                                </label>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                                    value={state.message}
                                    onChange={e => dispatch({ type: 'SET_MESSAGE', payload: e.target.value })}
                                    placeholder="Deixe uma mensagem de apoio para a equipe..."
                                />
                                <p className="text-slate-400 text-xs mt-2">
                                    Sua mensagem pode ser exibida publicamente (opcional)
                                </p>
                            </div>

                            {/* Mensagem de Erro */}
                            {state.error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                    <div className="flex items-center space-x-2 text-red-400">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="text-sm font-medium">{state.error}</span>
                                    </div>
                                </div>
                            )}

                            {/* Botão de Doação */}
                            <div className="border-t border-slate-700 pt-6">
                                <button
  className="w-full py-4 px-6 rounded-xl font-semibold text-lg bg-slate-600 text-slate-300 opacity-50 text-center select-none cursor-not-allowed"
  disabled
  type="button"
>
  Apenas QRCode funcionando
</button>

                                <div className="text-center text-sm text-slate-400 mt-4 space-y-1 flex flex-col items-center">
                                    <div className="flex items-center gap-2 justify-center">
                                        <Zap className="w-4 h-4 text-blue-400" />
                                        <span>Pagamento seguro via PIX • Recibo enviado por email</span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center">
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span>Processamento instantâneo • Suporte 24/7</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Impacto do Projeto - agora na vertical, logo abaixo do formulário */}
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                                <Target className="w-5 h-5 text-purple-400" />
                                <span>Impacto do Projeto</span>
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {IMPACT_STATS.map((stat, index) => {
                                    const IconComponent = stat.icon;
                                    return (
                                        <div key={index} className="text-center p-4 bg-slate-700/30 rounded-lg">
                                            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                                <IconComponent className={`w-5 h-5 ${stat.color}`} />
                                            </div>
                                            <div className="font-bold text-white text-lg">{stat.value}</div>
                                            <div className="text-xs text-slate-400">{stat.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* QR Code PIX */}
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-xl">
                            <h3 className="text-lg font-semibold text-white mb-4 text-center flex items-center justify-center space-x-2">
                                <Zap className="w-5 h-5 text-blue-400" />
                                <span>Pagamento Instantâneo</span>
                            </h3>
                            <div className="flex justify-center mb-4">
                                <div className="p-2 bg-white rounded-xl border-2 border-blue-500 shadow-lg">
                                    {isValidAmount ? (
                                        <QRCodeSVG
                                            value={pixPayload}
                                            size={152}
                                            bgColor={"#ffffff"}
                                            fgColor={"#000000"}
                                            level={"L"}
                                            includeMargin={false}
                                        />
                                    ) : (
                                        <div className="w-[152px] h-[152px] flex flex-col items-center justify-center bg-gray-100 text-slate-500 text-center p-2">
                                            <AlertCircle className="w-8 h-8 mb-2" />
                                            <span className="text-sm font-medium">Selecione um valor válido para gerar o QR Code</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-slate-400">Escaneie com seu banco</span>
                                </div>
                                <div className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text">
                                    R$ {finalAmount.toFixed(2)}
                                </div>
                            </div>
                        </div>
                        {/* Progress */}
                        <ProgressIndicator current={currentGoal.current} total={currentGoal.total} />
                        {/* Doações Recentes com animação de scroll suave via CSS */}
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 p-6 h-[741px] flex flex-col">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                                <Users className="w-5 h-5 text-green-400" />
                                <span>Doações Recentes</span>
                            </h3>
                            <div className="relative flex-1 overflow-hidden">
                                <div
                                    className={
                                        recentDonors.length > 6 ? "animate-scroll absolute w-full" : "absolute w-full"
                                    }
                                    style={recentDonors.length > 6 ? undefined : { position: 'static' }}
                                >
                                    {recentDonors.map((donor, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 mb-3 bg-slate-700/50 rounded-lg transform transition-transform hover:scale-[1.02] hover:bg-slate-700/70 relative"
                                            onMouseEnter={() => setHoveredDonor(index)}
                                            onMouseLeave={() => setHoveredDonor(null)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">
                                                        {donor.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{donor.name}</p>
                                                    <p className="text-xs text-slate-400">{donor.since}</p>
                                                </div>
                                            </div>
                                            <span className="text-green-400 font-semibold">R$ {donor.amount}</span>
                                            {hoveredDonor === index && donor.message && (
                                                <div
                                                    className="fixed left-1/2 z-50 px-4 py-2 min-w-[180px] max-w-xs max-h-40 bg-slate-900 text-slate-100 text-xs rounded-lg shadow-2xl border border-blue-500 pointer-events-none overflow-y-auto break-words"
                                                    style={{top: 'auto', bottom: '20px', transform: 'translateX(-50%)'}}
                                                >
                                                    {donor.message}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <style>{`
                                @keyframes scroll {
                                    0% {
                                        transform: translateY(0);
                                    }
                                    100% {
                                        transform: translateY(-50%);
                                    }
                                }
                                .animate-scroll {
                                    animation: scroll 30s linear infinite;
                                }
                                .animate-scroll:hover {
                                    animation-play-state: paused;
                                }
                            `}</style>
                        </div>
                    </div>
                </div>
                {/* Seção Benefícios de Contribuir */}
                <div className="mt-16 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 p-8 shadow-2xl">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
                                <Gift className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-purple-400 font-medium">Benefícios de Contribuir</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                                Contribua e Receba Benefícios Exclusivos
                            </h2>
                            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                                Ao apoiar o NoxMedia Studio, você não só ajuda a manter o projeto vivo, mas também recebe vantagens e reconhecimento pela sua contribuição. Veja como você pode se beneficiar:
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-400" />
                                    Reconhecimento Público
                                </h3>
                                <p className="text-slate-300 mb-4">
                                    Seu nome pode aparecer na página de apoiadores, mostrando seu apoio à comunidade e ao projeto. Destaque-se como um colaborador essencial para o futuro do NoxMedia Studio.
                                </p>
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-400" />
                                    Acesso Antecipado
                                </h3>
                                <p className="text-slate-300 mb-4">
                                    Apoiadores têm acesso antecipado a novas funcionalidades, testes beta e novidades do projeto antes de todos.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-pink-400" />
                                    Participação em Decisões
                                </h3>
                                <p className="text-slate-300 mb-4">
                                    Participe de enquetes e votações para definir prioridades de desenvolvimento e sugerir melhorias diretamente para a equipe.
                                </p>
                                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-green-400" />
                                    Comunidade Exclusiva
                                </h3>
                                <p className="text-slate-300">
                                    Tenha acesso a um canal exclusivo para apoiadores, networking com outros contribuidores e suporte prioritário.
                                </p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Download className="w-5 h-5 text-purple-400" />
                                Como Receber os Benefícios
                            </h3>
                            <p className="text-slate-300 mb-6">
                                Após contribuir, você receberá um e-mail com instruções para acessar os benefícios. Fique atento à sua caixa de entrada e, caso tenha dúvidas, entre em contato pelo suporte do projeto.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 mt-6">
                                <a href="https://discord.gg/VG5hmeGbbj" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-medium transition">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.211.375-.444.864-.608 1.249a18.524 18.524 0 0 0-5.487 0 12.51 12.51 0 0 0-.617-1.249.07.07 0 0 0-.073-.035A19.736 19.736 0 0 0 3.677 4.369a.064.064 0 0 0-.03.027C.533 9.09-.32 13.579.099 18.021a.08.08 0 0 0 .031.056c2.052 1.507 4.042 2.422 5.992 3.029a.077.077 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.104c-.652-.247-1.27-.549-1.872-.892a.077.077 0 0 1-.008-.127c.126-.094.252-.192.371-.291a.07.07 0 0 1 .073-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .073.009c.12.099.245.197.372.291a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.892.076.076 0 0 0-.04.105c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.951-1.522 6.003-3.029a.077.077 0 0 0 .03-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/></svg>
                                    Discord
                                </a>
                                <a href="https://github.com/PhilippeBoechat/NoxMedia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium border border-slate-600 transition">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.123-.303-.535-1.527.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.649.241 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                                    GitHub
                                </a>
                                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.53 6.477 13.06 12.001l4.545 5.522h-1.09l-4.13-5.018-4.13 5.018h-1.09l4.545-5.522-4.47-5.524h1.09l3.955 4.98 3.955-4.98h1.09Zm-5.53 5.522Zm0 0Z"/></svg>
                                    X (ex-Twitter) - Breve
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonatePage;
