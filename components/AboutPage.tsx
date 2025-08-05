import { useState, useEffect, ReactNode } from 'react';
import {
    Code,
    Heart,
    Users,
    Star,
    Github,
    Coffee,
    Zap,
    Globe,
    Award,
    MessageCircle,
    Rocket,
    Workflow,
    Smartphone,
    MonitorCheck,
    Target,
    ListChecks
} from 'lucide-react';

// Configurações e dados
const CONFIG = {
    GITHUB_API_URL: 'https://api.github.com/repos/PhilippeBoechat/NoxMedia',
    GITHUB_REPO_URL: 'https://github.com/PhilippeBoechat/NoxMedia',
    DONATE_URL: '/donate'
};

const STATS_DATA = [
    { icon: Users, value: "1", label: "Desenvolvedores Ativos" },
    { icon: Star, value: "-", label: "Stars no GitHub", dynamic: true },
    { icon: Globe, value: "1", label: "Países Alcançados" },
    { icon: Rocket, value: "0", label: "Projetos Criados" }
];

const FEATURES_DATA = [
    {
        icon: Zap,
        title: "Performance Otimizada",
        description: "Ferramentas construídas para máxima eficiência e velocidade de desenvolvimento."
    },
    {
        icon: Heart,
        title: "Comunidade Ativa",
        description: "Uma comunidade vibrante sempre pronta para ajudar e colaborar."
    },
    {
        icon: Code,
        title: "Open Source",
        description: "Código aberto, transparente e desenvolvido colaborativamente."
    },
    {
        icon: MessageCircle,
        title: "Qualidade Premium",
        description: "Padrões rigorosos de qualidade em cada linha de código."
    }
];

const ROADMAP_DATA = [
    {
        id: 1,
        title: "Sistema de ChatBot",
        description: "Adição do Painel Admin",
        progress: 80,
        status: "in-progress" as const,
        icon: MessageCircle
    },
    {
        id: 2,
        title: "Backend",
        description: "Finalizando APIs e integrações",
        progress: 70,
        status: "in-progress" as const,
        icon: Workflow
    },
    {
        id: 3,
        title: "Mobile App",
        description: "Aplicativo móvel nativo",
        progress: 0,
        status: "future" as const,
        icon: Smartphone
    },
    {
        id: 4,
        title: "Desktop App",
        description: "Aplicação desktop multiplataforma",
        progress: 0,
        status: "future" as const,
        icon: MonitorCheck
    }
];

// Hook personalizado para buscar stars do GitHub
const useGitHubStars = () => {
    const [stars, setStars] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchStars = async () => {
            try {
                const response = await fetch(CONFIG.GITHUB_API_URL);
                if (!response.ok) throw new Error('Erro ao buscar estrelas do GitHub');
                const data = await response.json();
                if (isMounted) setStars(data.stargazers_count);
            } catch {
                if (isMounted) setStars(null);
            }
        };

        fetchStars();
        const interval = setInterval(fetchStars, 30000); // Atualiza a cada 30s

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return stars;
};

// Tipos para componentes
interface BadgeProps {
    icon: React.ElementType;
    text: string;
    className?: string;
}
const Badge = ({ icon: Icon, text, className = "" }: BadgeProps) => (
    <div className={`inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 ${className}`}>
        <Icon className="w-4 h-4 text-purple-400" />
        <span className="text-sm text-purple-400 font-medium">{text}</span>
    </div>
);

interface StatCardProps {
    icon: React.ElementType;
    value: string;
    label: string;
}
const StatCard = ({ icon: Icon, value, label }: StatCardProps) => (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-800/60 transition-all duration-300">
        <Icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-slate-400">{label}</div>
    </div>
);

interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
}
const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
    <div className="group bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/60 transition-all duration-300 hover:border-purple-500/30">
        <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                <Icon className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-slate-300 leading-relaxed">{description}</p>
    </div>
);

interface RoadmapItemType {
    id: number;
    title: string;
    description: string;
    progress: number;
    status: 'completed' | 'in-progress' | 'future';
    icon: React.ElementType;
}
interface RoadmapItemProps {
    item: RoadmapItemType;
}
const RoadmapItem = ({ item }: RoadmapItemProps) => {
    const { icon: Icon, title, description, progress, status } = item;

    const getStatusConfig = (status: string) => {
        const configs = {
            'completed': {
                bgColor: 'bg-green-500/20',
                borderColor: 'border-green-500',
                textColor: 'text-green-400',
                iconColor: 'text-green-400',
                badgeStyle: 'bg-green-500/10 border-green-500/30 text-green-400',
                label: 'Concluído'
            },
            'in-progress': {
                bgColor: 'bg-yellow-500/20',
                borderColor: 'border-yellow-500',
                textColor: 'text-yellow-400',
                iconColor: 'text-yellow-400',
                badgeStyle: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
                label: 'Em Progresso'
            },
            'future': {
                bgColor: 'bg-purple-500/20',
                borderColor: 'border-purple-500',
                textColor: 'text-purple-400',
                iconColor: 'text-purple-400',
                badgeStyle: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
                label: 'Futuro'
            }
        };
        return configs[status as keyof typeof configs] || configs.future;
    };

    const statusConfig = getStatusConfig(status);

    return (
        <div className="flex items-center space-x-4 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <div className={`flex items-center justify-center w-12 h-12 ${statusConfig.bgColor} border-2 ${statusConfig.borderColor} rounded-full`}>
                <Icon className={`w-6 h-6 ${statusConfig.iconColor}`} />
            </div>
            <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h4 className="text-lg font-semibold text-white">{title}</h4>
                        <p className="text-slate-400">{description}</p>
                    </div>
                    <span className={`px-3 py-1 border rounded-full text-sm font-medium ${statusConfig.badgeStyle}`}>
                        {statusConfig.label}
                    </span>
                </div>
                {progress > 0 && (
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-400">Progresso</span>
                            <span className="text-sm font-medium text-white">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface InfoSectionProps {
    icon: React.ElementType;
    title: string;
    children: ReactNode;
    className?: string;
}
const InfoSection = ({ icon: Icon, title, children, className = "" }: InfoSectionProps) => (
    <div className={`bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 ${className}`}>
        <div className="flex items-center mb-6">
            <div className="w-8 h-8 text-yellow-400 mr-3 flex items-center justify-center">
                <Icon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        {children}
    </div>
);

// Seções principais
const HeroSection = ({ isVisible }) => (
    <section className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Badge icon={Code} text="Sobre o NoxMedia Studio" className="mb-8" />

        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Junte-se a Nós na Construção de um Futuro Melhor!
        </h1>

        <p className="text-lg text-slate-300 max-w-4xl mx-auto leading-relaxed">
            O NoxMedia Studio é mais do que apenas uma ferramenta - é um movimento para capacitar desenvolvedores e comunidades em todo o mundo. Ao contribuir com este projeto, você está ajudando a criar oportunidades, promover aprendizagem e democratizar o acesso à tecnologia.
        </p>
    </section>
);

const StatsSection = ({ stars }) => {
    const statsWithStars = STATS_DATA.map(stat => ({
        ...stat,
        value: stat.dynamic && stars !== null ? stars.toString() : stat.value
    }));

    return (
        <section className="mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statsWithStars.map((stat, index) => (
                    <StatCard key={index} icon={stat.icon} value={stat.value} label={stat.label} />
                ))}
            </div>
        </section>
    );
};

const ContentGrid = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        <InfoSection icon={Target} title="Nossa Missão">
            <p className="text-slate-300 leading-relaxed mb-4">
                Acreditamos que a tecnologia deve ser acessível a todos, independentemente de sua origem ou situação financeira. Nosso objetivo é desenvolver ferramentas poderosas e fáceis de usar que ajudem desenvolvedores a criarem projetos incríveis e impactantes.
            </p>
            <p className="text-slate-300 leading-relaxed">
                Sua contribuição nos ajuda a manter esse projeto gratuito e em constante evolução, beneficiando assim toda a comunidade de desenvolvedores.
            </p>
        </InfoSection>

        <InfoSection icon={ListChecks} title="Nossos Objetivos">
            <div className="space-y-4">
                {[
                    {
                        title: "Desenvolvimento Contínuo:",
                        desc: "Manter e aprimorar o NoxMedia Studio com novas funcionalidades e melhorias constantes."
                    },
                    {
                        title: "Suporte à Comunidade:",
                        desc: "Oferecer suporte ativo e recursos educacionais para ajudar os usuários a aproveitarem ao máximo o NoxMedia Studio."
                    },
                    {
                        title: "Expansão do Acesso:",
                        desc: "Aumentar o alcance do NoxMedia Studio para desenvolvedores em todo o mundo, especialmente em regiões sub-representadas."
                    }
                ].map((obj, index) => (
                    <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                            <span className="font-medium text-white">{obj.title}</span>
                            <span className="text-slate-300"> {obj.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
        </InfoSection>
    </div>
);

const HelpSection = () => (
    <section className="mb-20">
        <InfoSection icon={Users} title="Como Você Pode Ajudar">
            <p className="text-slate-300 leading-relaxed">
                Você pode contribuir de várias formas: doando, divulgando o projeto, enviando feedbacks ou colaborando com código e documentação no GitHub. Toda ajuda é bem-vinda!
            </p>
        </InfoSection>
    </section>
);

const FeaturesSection = () => (
    <section className="mb-20">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Por Que Escolher o NoxMedia Studio?</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                Descubra os diferenciais que fazem do NoxMedia Studio a escolha ideal para desenvolvedores
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES_DATA.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
            ))}
        </div>
    </section>
);

const RoadmapSection = () => (
    <section className="mb-20">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Roadmap 2025-2026</h2>
            <p className="text-slate-300 text-lg">
                Acompanhe nossos próximos marcos e desenvolvimentos
            </p>
        </div>

        <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
                {ROADMAP_DATA.map((item) => (
                    <RoadmapItem key={item.id} item={item} />
                ))}
            </div>
        </div>
    </section>
);

const CallToActionSection = () => (
    <section className="text-center">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-12">
            <h2 className="text-3xl font-bold text-white mb-6">
                Pronto para Fazer a Diferença?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Sua contribuição pode impactar milhares de desenvolvedores ao redor do mundo.
                Junte-se à nossa missão de democratizar a tecnologia!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                    href={CONFIG.DONATE_URL}
                    className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                    <Coffee className="w-5 h-5" />
                    <span>Apoiar com Doação</span>
                </a>
                <a
                    href={CONFIG.GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg border border-slate-600 transition-colors duration-200"
                >
                    <Github className="w-5 h-5" />
                    <span>Contribuir no GitHub</span>
                </a>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-6 text-slate-400 text-sm">
                <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Suporte 24/7</span>
                </div>
                <div className="w-1 h-4 bg-slate-600 rounded-full"></div>
                <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span>Feito com amor</span>
                </div>
                <div className="w-1 h-4 bg-slate-600 rounded-full"></div>
                <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Comunidade global</span>
                </div>
            </div>
        </div>
    </section>
);

// Componente principal
const AboutPage = () => {
    const [isVisible, setIsVisible] = useState(false);
    const stars = useGitHubStars();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#0F101A' }}>
            <div className="flex-1 flex flex-col max-w-6xl mx-auto px-6 py-16 w-full">
                <HeroSection isVisible={isVisible} />
                <StatsSection stars={stars} />
                <ContentGrid />
                <HelpSection />
                <FeaturesSection />
                <RoadmapSection />
                <CallToActionSection />
            </div>
        </div>
    );
};

export default AboutPage