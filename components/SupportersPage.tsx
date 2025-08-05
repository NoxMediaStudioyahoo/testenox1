// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { Users, Award, Gift, Crown, Star, Calendar, TrendingUp, ChevronRight, Search, Filter, SortAsc, SortDesc, RefreshCw, Share2, ExternalLink, Info } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/supporters';

// Tipos para apoiadores
interface Supporter {
    id?: number;
    name: string;
    logo?: string | null;
    amount: number;
    since: string;
    message?: string;
    tier: string;
}

const MOCK_SUPPORTERS: Supporter[] = [];

const SORT_OPTIONS = [
    { value: 'name-asc', label: 'Nome (A-Z)', icon: SortAsc },
    { value: 'name-desc', label: 'Nome (Z-A)', icon: SortDesc },
    { value: 'amount-desc', label: 'Valor (Maior)', icon: SortDesc },
    { value: 'amount-asc', label: 'Valor (Menor)', icon: SortAsc },
    { value: 'date-desc', label: 'Mais Recente', icon: SortDesc },
    { value: 'date-asc', label: 'Mais Antigo', icon: SortAsc }
];

const TIER_DESCRIPTIONS: Record<string, string> = {
    'corporativo': 'Empresas e organizações que apoiam o projeto',
    'premium': 'Apoiadores especiais com benefícios exclusivos',
    'regular': 'Apoiadores mensais comprometidos',
    'básico': 'Novos apoiadores e contribuições menores'
};

// Skeleton Loading Component
const SkeletonCard = () => (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 h-[320px] animate-pulse">
        <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <div className="h-6 bg-slate-700 rounded mb-2 w-3/4"></div>
                <div className="h-8 bg-slate-700 rounded-full w-24"></div>
            </div>
        </div>
        <div className="h-4 bg-slate-700 rounded mb-4 w-32"></div>
        <div className="h-10 bg-slate-700 rounded mb-6 w-40"></div>
        <div className="bg-slate-900/60 rounded-xl p-4 flex-1">
            <div className="space-y-2">
                <div className="h-3 bg-slate-700 rounded w-full"></div>
                <div className="h-3 bg-slate-700 rounded w-4/5"></div>
                <div className="h-3 bg-slate-700 rounded w-3/5"></div>
            </div>
        </div>
    </div>
);

// Tooltip Component
const Tooltip: React.FC<{ children: ReactNode; content: ReactNode }> = ({ children, content }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
            </div>
            {isVisible && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg border border-slate-600 whitespace-nowrap z-50 shadow-xl">
                    {content}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
            )}
        </div>
    );
};

const SupporterCard: React.FC<{ supporter: Supporter; index: number }> = React.memo(({ supporter, index }) => {
    const [isSharing, setIsSharing] = useState(false);

    const getTierBadgeStyle = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case 'corporativo':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
            case 'premium':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
            case 'regular':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
            default:
                return 'bg-green-500/20 text-green-400 border-green-500/40';
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${supporter.name} - Apoiador do NoxMedia Studio`,
                    text: `Conheça ${supporter.name}, um dos nossos apoiadores!`,
                    url: window.location.href
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                // Aqui você poderia mostrar um toast de sucesso
            }
        } catch (error) {
            console.log('Erro ao compartilhar:', error);
        }
        setIsSharing(false);
    };

    const cardStyle = {
        animationDelay: `${index * 50}ms`,
        minHeight: '320px',
        height: '320px'
    };

    return (
        <div
            className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-slate-700/90 group flex flex-col animate-in fade-in slide-in-from-bottom-4"
            style={cardStyle}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                            {supporter.name}
                        </h3>
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-600/50 rounded-full"
                            title="Compartilhar apoiador"
                        >
                            {isSharing ? (
                                <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
                            ) : (
                                <Share2 className="w-4 h-4 text-slate-400 hover:text-blue-400" />
                            )}
                        </button>
                    </div>
                    <Tooltip content={TIER_DESCRIPTIONS[supporter.tier?.toLowerCase()] || 'Apoiador do projeto'}>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border cursor-help ${getTierBadgeStyle(supporter.tier)}`}>
                            <Gift className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{supporter.tier}</span>
                            <Info className="w-3 h-3 opacity-60" />
                        </div>
                    </Tooltip>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>Desde {supporter.since}</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-green-400">R$ {supporter.amount.toLocaleString()}</span>
                    <span className="text-sm text-slate-400">/mês</span>
                </div>
            </div>

            {supporter.message && (
                <div className="bg-slate-900/60 rounded-xl p-4 border-l-4 border-blue-500/60 relative flex-1 overflow-hidden">
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">"</span>
                    </div>
                    <p className="text-sm text-slate-300 italic leading-relaxed line-clamp-4 overflow-hidden">
                        {supporter.message}
                    </p>
                </div>
            )}
        </div>
    );
});

const SUPPORT_TIERS = [
    { id: 'todos', name: 'Apoiadores', icon: Users, count: 0 },
    { id: 'corporativo', name: 'Corporativo', icon: Crown, count: 0 },
    { id: 'premium', name: 'Premium', icon: Star, count: 0 },
    { id: 'regular', name: 'Regular', icon: Gift, count: 0 },
    { id: 'básico', name: 'Básico', icon: Award, count: 0 },
];

const SupportersPage: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<string>('todos');
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('amount-desc');
    const [retryCount, setRetryCount] = useState(0);

    const fetchSupporters = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Falha ao carregar dados');
            const data: Supporter[] = await response.json();
            setSupporters(data);
        } catch (err) {
            console.error('Erro ao buscar apoiadores:', err);
            setSupporters(MOCK_SUPPORTERS);
            if (retryCount < 3) {
                setError(`Usando dados de exemplo. Tentativa ${retryCount + 1}/3`);
            }
        } finally {
            setIsLoading(false);
        }
    }, [retryCount]);

    useEffect(() => {
        fetchSupporters();
    }, [fetchSupporters]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        fetchSupporters();
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Apoiadores do NoxMedia Studio',
                    text: 'Conheça nossos incríveis apoiadores!',
                    url: window.location.href
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
            }
        } catch (error) {
            console.log('Erro ao compartilhar:', error);
        }
    };

    const sortedAndFilteredSupporters = useMemo(() => {
        let filtered = supporters;
        if (searchTerm) {
            filtered = filtered.filter(supporter =>
                supporter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (supporter.message?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
            );
        }
        if (selectedFilter !== 'todos') {
            filtered = filtered.filter(s => s.tier && s.tier.toLowerCase() === selectedFilter);
        }
        filtered = [...filtered];
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'amount-desc':
                    return (b.amount || 0) - (a.amount || 0);
                case 'amount-asc':
                    return (a.amount || 0) - (b.amount || 0);
                case 'date-desc':
                    return new Date(b.since.split('/').reverse().join('-')).getTime() - new Date(a.since.split('/').reverse().join('-')).getTime();
                case 'date-asc':
                    return new Date(a.since.split('/').reverse().join('-')).getTime() - new Date(b.since.split('/').reverse().join('-')).getTime();
                default:
                    return 0;
            }
        });
        return filtered;
    }, [supporters, searchTerm, selectedFilter, sortBy]);

    const stats = useMemo(() => {
        const totalAmount = supporters.reduce((sum, s) => sum + (s.amount || 0), 0);
        const tierCounts: Record<string, number> = {};
        supporters.forEach(s => {
            const tier = s.tier?.toLowerCase() || 'básico';
            tierCounts[tier] = (tierCounts[tier] || 0) + 1;
        });
        const updatedTiers = SUPPORT_TIERS.map(tier => ({
            ...tier,
            count: tier.id === 'todos' ? supporters.length : (tierCounts[tier.id] || 0)
        }));
        return { totalAmount, tierCounts, updatedTiers };
    }, [supporters]);

    const currentSortOption = SORT_OPTIONS.find(option => option.value === sortBy);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-0 via-slate-0 to-slate-0 relative overflow-hidden">
            <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            <div className="relative">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-0 backdrop-blur-xl border-b border-slate-0">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/40 rounded-full px-4 py-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    <span className="text-blue-400 text-sm font-semibold">Projeto Open Source</span>
                                </div>
                                <button
                                    onClick={handleShare}
                                    className="p-2 bg-slate-800/60 hover:bg-slate-700/80 rounded-full border border-slate-700/50 transition-all duration-300"
                                    title="Compartilhar página"
                                >
                                    <Share2 className="w-4 h-4 text-slate-400 hover:text-blue-400" />
                                </button>
                            </div>

                            <h1 className="text-5xl font-extrabold text-white mb-4">
                                Apoiadores do <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">NoxMedia Studio</span>
                            </h1>

                            <div className="space-y-2">
                                <p className="text-xl text-slate-300">
                                    Reconhecimento especial para nossa comunidade de apoiadores.
                                </p>
                                <p className="text-lg text-blue-400 font-semibold">
                                    Obrigado por tornarem este projeto possível!
                                </p>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-400 text-sm flex items-center justify-center gap-2">
                                    <Info className="w-4 h-4" />
                                    {error}
                                    <button
                                        onClick={handleRetry}
                                        className="ml-2 px-2 py-1 bg-yellow-500/20 rounded text-xs hover:bg-yellow-500/30 transition-colors"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="bg-slate-800/30 border-b border-slate-800/50 py-8">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center h-[140px] flex flex-col justify-center hover:bg-slate-700/60 transition-all duration-300">
                                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3 flex-shrink-0" />
                                <div className="text-3xl font-bold text-white mb-1">{supporters.length}</div>
                                <div className="text-sm text-slate-400">Apoiadores</div>
                            </div>

                            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center h-[140px] flex flex-col justify-center hover:bg-slate-700/60 transition-all duration-300">
                                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3 flex-shrink-0" />
                                <div className="text-3xl font-bold text-green-400 mb-1">R$ {stats.totalAmount.toLocaleString()}</div>
                                <div className="text-sm text-slate-400">Mensal</div>
                            </div>

                            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center h-[140px] flex flex-col justify-center hover:bg-slate-700/60 transition-all duration-300">
                                <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3 flex-shrink-0" />
                                <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.tierCounts['corporativo'] || 0}</div>
                                <div className="text-sm text-slate-400">Corporativo</div>
                            </div>

                            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center h-[140px] flex flex-col justify-center hover:bg-slate-700/60 transition-all duration-300">
                                <Star className="w-8 h-8 text-purple-400 mx-auto mb-3 flex-shrink-0" />
                                <div className="text-3xl font-bold text-purple-400 mb-1">{stats.tierCounts['premium'] || 0}</div>
                                <div className="text-sm text-slate-400">Premium</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Sort Controls */}
                <div className="bg-slate-900/50 py-6 border-b border-slate-800/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar apoiadores..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                            </div>

                            {/* Sort */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-slate-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                >
                                    {SORT_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value} className="bg-slate-800">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-slate-900/50 py-8 border-b border-slate-800/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-wrap justify-center gap-4">
                            {stats.updatedTiers.map(tier => {
                                const Icon = tier.icon;
                                return (
                                    <Tooltip key={tier.id} content={TIER_DESCRIPTIONS[tier.id] || 'Faça parte do time de apoiadores!'}>
                                        <button
                                            onClick={() => setSelectedFilter(tier.id)}
                                            className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 border-2 w-[300px] h-[64px] justify-center flex-shrink-0 hover:scale-105 ${selectedFilter === tier.id
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500 shadow-xl scale-105'
                                                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-700/80 hover:text-white hover:border-slate-600 backdrop-blur-sm'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5 flex-shrink-0" />
                                            <span className="truncate text-center flex-1">{tier.name}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 min-w-[28px] h-[24px] flex items-center justify-center ${selectedFilter === tier.id ? 'bg-white/20' : 'bg-slate-700'
                                                }`}>
                                                {tier.count}
                                            </span>
                                        </button>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="py-12 min-h-[600px]">
                    <div className="max-w-7xl mx-auto px-6">
                        {/* Results Info */}
                        {!isLoading && sortedAndFilteredSupporters.length > 0 && (
                            <div className="mb-8 text-center">
                                <p className="text-slate-400">
                                    Mostrando {sortedAndFilteredSupporters.length} de {supporters.length} apoiadores
                                    {searchTerm && ` para "${searchTerm}"`}
                                    {selectedFilter !== 'todos' && ` na categoria ${selectedFilter}`}
                                </p>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, index) => (
                                    <SkeletonCard key={index} />
                                ))}
                            </div>
                        ) : sortedAndFilteredSupporters.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {sortedAndFilteredSupporters.map((supporter, index) => (
                                    <SupporterCard key={supporter.id || `${supporter.name}-${index}`} supporter={supporter} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-32 h-32 bg-slate-800/60 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Users className="w-16 h-16 text-slate-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-300 mb-3">
                                    {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum apoiador encontrado'}
                                </h3>
                                <p className="text-slate-400 text-lg mb-8">
                                    {searchTerm
                                        ? `Não encontramos apoiadores para "${searchTerm}"`
                                        : 'Não há apoiadores para este filtro selecionado.'
                                    }
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                                        >
                                            Limpar busca
                                            <Search className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectedFilter('todos');
                                            setSearchTerm('');
                                        }}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300"
                                    >
                                        Ver todos os apoiadores
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-900/80 border-t border-slate-800/50 py-12">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Quer fazer parte desta lista?
                            </h3>
                            <p className="text-slate-400 text-lg mb-6">
                                Junte-se à nossa comunidade de apoiadores e ajude a manter o NoxMedia Studio crescendo.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
                                    Torne-se um apoiador
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-xl font-semibold text-lg transition-all duration-300 border border-slate-700/50 hover:border-slate-600"
                                >
                                    Compartilhar projeto
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportersPage;