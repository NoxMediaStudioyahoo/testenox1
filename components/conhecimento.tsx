export interface ConhecimentoItem {
    keywords: string[];
    response: string;
    quickReplies?: string[];
}

// As funções auxiliares permanecem as mesmas
const levenshteinDistance = (a: string, b: string): number => {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i += 1) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j += 1) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j += 1) {
        for (let i = 1; i <= a.length; i += 1) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator,
            );
        }
    }
    return matrix[b.length][a.length];
};

const removerAcentos = (s: string): string =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const conhecimentoNoxMedia: Record<string, ConhecimentoItem> = {
    // ====== CONVERSAÇÃO ======
    saudacao: {
        keywords: ['oi', 'ola', 'bom', 'dia', 'tarde', 'noite', 'eai', 'opa', 'blz', 'saudacoes', 'hello', 'hey'],
        response: `# Olá! 👋 

Bem-vindo ao **NoxMedia Studio**! 

Sou seu assistente virtual e estou aqui para te ajudar com:
- ✨ Geração automática de legendas
- 🎬 Edição e sincronização
- 📤 Exportação em vários formatos
- 🔧 Resolução de problemas

**Como posso te ajudar hoje?**`,
        quickReplies: ['🚀 Como usar?', '📁 Formatos suportados', '💰 É gratuito?', '👨‍💻 Falar com humano']
    },

    tudoBem: {
        keywords: ['tudo', 'bem', 'bom', 'vai', 'como', 'esta', 'voce'],
        response: `## Tudo ótimo por aqui! 😊

Estou funcionando perfeitamente e pronto para te ajudar com qualquer dúvida sobre o **NoxMedia Studio**.

**Em que posso ser útil?**`,
        quickReplies: ['⬆️ Problemas com upload', '⬇️ Problemas com download', '📏 Limite de tamanho', '💡 Sobre o projeto']
    },

    despedida: {
        keywords: ['tchau', 'adeus', 'mais', 'logo', 'falou', 'flw', 'xau', 'abraco', 'bye'],
        response: `## Até mais! 👋

Foi um prazer te ajudar hoje. Se precisar de alguma coisa, estarei sempre por aqui!

**Lembre-se:** O NoxMedia Studio está sempre disponível para você. 💙`,
        quickReplies: ['❤️ Apoiar projeto', '🔓 GitHub', '💬 Discord']
    },

    agradecimento: {
        keywords: ['obrigado', 'obrigada', 'valeu', 'vlw', 'agradecido', 'grato', 'show', 'obg', 'thanks'],
        response: `## De nada! 😊

Fico muito feliz em poder ajudar. É isso que fazemos de melhor aqui no **NoxMedia Studio**!

**Sempre que precisar, pode contar comigo.** 🚀`,
        quickReplies: ['🤝 Como contribuir', '🗺️ Roadmap', '🏠 Voltar ao início']
    },

    bot: {
        keywords: ['voce', 'robo', 'bot', 'maquina', 'humano', 'quem', 'es'],
        response: `## Sobre mim 🤖

Sou o **assistente virtual** do NoxMedia Studio, treinado especificamente para te ajudar com:

- 💬 Respostas rápidas sobre a plataforma
- 🔧 Soluções para problemas comuns  
- 📚 Guias e tutoriais
- 🎯 Direcionamento para recursos

**Para questões mais complexas,** você sempre pode falar diretamente com nossa equipe humana!`,
        quickReplies: ['👨‍💻 Falar com humano', '💡 Sobre o projeto', '🏠 Voltar']
    },

    // ====== FUNCIONALIDADES E PROBLEMAS ======
    upload: {
        keywords: ['upload', 'subir', 'enviar', 'carregar', 'erro', 'falha', 'problema', 'funciona', 'nao', 'consegue'],
        response: `# ⬆️ Problemas de Upload

## ✅ Requisitos
- **Formatos aceitos:** MP4, MOV, AVI, MKV
- **Tamanho máximo:** 500MB por arquivo
- **Conexão:** Internet estável obrigatória

## 🔧 Soluções comuns
1. **Verifique o formato** do seu arquivo
2. **Confirme o tamanho** (máx. 500MB)
3. **Limpe o cache** do navegador
4. **Teste outro navegador** se necessário
5. **Aguarde** e tente novamente

> 💡 **Dica:** MP4 é o formato mais recomendado para melhor compatibilidade.

**Ainda com problemas?** Nossa equipe está pronta para ajudar!`,
        quickReplies: ['📁 Formatos suportados', '📏 Limite de tamanho', '👨‍💻 Falar com humano', '🏠 Voltar']
    },

    download: {
        keywords: ['download', 'baixar', 'salvar', 'obter', 'exportar', 'erro', 'falha', 'problema', 'nao', 'funciona'],
        response: `# ⬇️ Problemas de Download

## 🔧 Soluções rápidas

### 1. **Bloqueadores de Pop-up**
- Desative temporariamente
- Permita pop-ups para noxmedia.studio

### 2. **Conexão e Navegador**
- Verifique sua conexão à internet
- Tente usar outro navegador
- Limpe cache e cookies

### 3. **Aguarde e Tente Novamente**
- Às vezes o servidor pode estar ocupado
- Aguarde alguns minutos

> ⚠️ **Persistindo o problema?** Entre em contato com nossa equipe técnica!`,
        quickReplies: ['📁 Formatos suportados', '👨‍💻 Falar com humano', '🏠 Voltar']
    },

    formatos: {
        keywords: ['formato', 'formatos', 'suportado', 'extensao', 'compativel', 'tipo', 'arquivo', 'aceita'],
        response: `# 📁 Formatos Suportados

## 🎬 **Vídeos (Upload)**
| Formato | Recomendação | Compatibilidade |
|---------|--------------|-----------------|
| **MP4** | ⭐ Altamente recomendado | Excelente |
| **MOV** | ✅ Suportado | Boa |
| **AVI** | ✅ Suportado | Boa |
| **MKV** | ✅ Suportado | Boa |

## 📝 **Legendas (Exportação)**
- **SRT** - Formato universal (recomendado)
- **VTT** - Para web players
- **TXT** - Texto simples

> 💡 **Dica Pro:** Use MP4 + SRT para máxima compatibilidade em todas as plataformas!`,
        quickReplies: ['📏 Limite de tamanho', '🚀 Como usar?', '🏠 Voltar']
    },

    tamanho: {
        keywords: ['limite', 'tamanho', 'maximo', 'grande', 'pesado', 'arquivo', 'mb', 'gb', 'quota'],
        response: `# 📏 Limites da Plataforma

## 📊 **Especificações atuais**

### 💾 **Tamanho de arquivo**
- **Máximo:** 500MB por vídeo
- **Recomendado:** Até 200MB para upload mais rápido

### 🎥 **Vídeo**
- **Duração:** Sem limite específico
- **Resolução:** Até 4K suportada
- **Taxa de bits:** Flexível

### ⚡ **Performance**
- Arquivos menores = Processamento mais rápido
- Qualidade HD já é suficiente para legendas precisas

> 🚀 **Precisa de mais espaço?** Entre em contato para soluções personalizadas!`,
        quickReplies: ['👨‍💻 Falar com humano', '📁 Formatos suportados', '🏠 Voltar']
    },

    comoUsar: {
        keywords: ['como', 'usar', 'funciona', 'tutorial', 'passo', 'comecar', 'guia', 'instruções'],
        response: `# 🚀 Como Usar o NoxMedia Studio

## 📋 **Processo simples em 4 passos**

### 1️⃣ **Upload do Vídeo**
- Faça upload do arquivo **OU**
- Cole o link do YouTube

### 2️⃣ **Processamento Automático**
- Nossa IA processa o áudio
- Legendas são geradas automaticamente
- Aguarde alguns minutos

### 3️⃣ **Edição (Opcional)**
- Revise o texto gerado
- Ajuste timing se necessário
- Use o editor visual

### 4️⃣ **Exportação**
- Escolha o formato (SRT, VTT, TXT)
- Faça o download
- Use onde precisar!

> ✨ **É isso!** Simples, rápido e totalmente gratuito.`,
        quickReplies: ['📁 Formatos suportados', '✏️ Editar legendas', '❤️ Apoiar projeto', '🏠 Voltar']
    },

    editarLegenda: {
        keywords: ['editar', 'edicao', 'ajustar', 'corrigir', 'alterar', 'mudar', 'timeline', 'sincronizar', 'texto'],
        response: `# ✏️ Editor de Legendas

## 🎯 **Recursos de edição**

### ✍️ **Editar Texto**
- Clique sobre qualquer legenda na timeline
- Digite suas alterações
- Pressione **Enter** para confirmar

### ⏱️ **Ajustar Timing**
- Arraste as barras de início/fim
- Use os controles de tempo precisos
- Visualize em tempo real

### ⌨️ **Atalhos Úteis**
- **Ctrl + S** - Salvar alterações
- **Espaço** - Play/Pause
- **← →** - Navegar entre legendas

### 👀 **Prévia em Tempo Real**
- Veja as mudanças instantaneamente
- Teste a sincronização
- Garanta a qualidade

> 💾 **Importante:** Sempre salve antes de exportar!`,
        quickReplies: ['📤 Exportar legendas', '⌨️ Atalhos do teclado', '🏠 Voltar']
    },

    gratuito: {
        keywords: ['preco', 'gratuito', 'gratis', 'pagar', 'custo', 'valor', 'plano', 'monetizacao', 'free'],
        response: `# 💰 Totalmente Gratuito!

## 🎉 **Zero custos**
- ✅ **Uso pessoal** - Gratuito
- ✅ **Uso comercial** - Gratuito  
- ✅ **Sem limites** de uso
- ✅ **Sem pegadinhas**
- ✅ **Sem anúncios** intrusivos

## 🌟 **Nossa filosofia**
> *"Ferramentas de acessibilidade devem ser livres e abertas para todos."*

Acreditamos que **legendas** tornam o conteúdo acessível a milhões de pessoas. Por isso, mantemos tudo gratuito.

## ❤️ **Quer ajudar?**
Se o projeto te ajudou, considere fazer uma doação voluntária. Cada contribuição nos permite manter o serviço rodando!`,
        quickReplies: ['❤️ Apoiar projeto', '💡 Sobre', '🏠 Voltar']
    },

    // ====== SUPORTE E CONTATO ======
    contato: {
        keywords: ['contato', 'falar', 'suporte', 'ajuda', 'humano', 'equipe', 'atendimento', 'email', 'support'],
        response: `# 📞 Fale Conosco

## 🎯 **Canais de suporte**

### 📧 **E-mail oficial**
**suporte@noxmedia.studio**
- Dúvidas técnicas
- Problemas específicos
- Sugestões de melhoria

### 💬 **Discord** (Resposta mais rápida)
**Comunidade ativa 24/7**
- Suporte em tempo real
- Ajuda da comunidade
- Chat direto com devs

### 🐛 **GitHub Issues**
**Para bugs e melhorias técnicas**
- Reporte problemas
- Acompanhe correções
- Contribua com código

> ⚡ **Resposta rápida:** Discord é nossa opção mais ágil!`,
        quickReplies: ['💬 Discord', '🔓 GitHub', '🏠 Voltar']
    },

    equipe: {
        keywords: ['equipe', 'quem', 'faz', 'desenvolve', 'criou', 'criador', 'desenvolvedor', 'team'],
        response: `# 👥 Nossa Equipe

## 🧑‍💻 **Core Team**

### **Philippe Boechat** - *Lead Developer*
- Fundador e desenvolvedor principal
- Especialista em IA e processamento de áudio
- Visionário por trás do projeto

## 🌍 **Comunidade**
- **Desenvolvedores** contribuindo com código
- **Designers** melhorando a interface
- **Tradutores** expandindo idiomas
- **Beta testers** garantindo qualidade

## 🤝 **Projeto colaborativo**
> Um projeto **feito pela comunidade, para a comunidade**

Cada pessoa que usa, reporta bugs ou espalha a palavra faz parte da nossa equipe!`,
        quickReplies: ['🔓 GitHub', '🤝 Como contribuir', '🗺️ Roadmap', '🏠 Voltar']
    },

    roadmap: {
        keywords: ['roadmap', 'futuro', 'novidades', 'planejado', 'funcionalidades', 'atualizacoes', 'features'],
        response: `# 🗺️ Roadmap do Projeto

## 🚀 **Próximas funcionalidades**

### 🔌 **API Pública**
- Integração com outras ferramentas
- Automação de workflows
- Acesso programático

### 🌐 **Expansão de Idiomas**
- Mais idiomas suportados
- Melhor precisão regional
- Detecção automática

### 📱 **Integrações**
- YouTube Studio
- Plataformas de streaming
- Editores de vídeo populares

### ⚡ **Performance**
- Processamento mais rápido
- Interface mais responsiva
- Otimizações de servidor

### 📱 **Mobile**
- App nativo
- Interface otimizada para touch

> 🔗 **Acompanhe:** [GitHub Projects](https://github.com/PhilippeBoechat/NoxMedia/projects)`,
        quickReplies: ['🔓 GitHub', '🤝 Como contribuir', '❤️ Apoiar projeto', '🏠 Voltar']
    },

    apoio: {
        keywords: ['apoio', 'apoiar', 'doacao', 'doar', 'ajudar', 'contribuicao', 'pix', 'suporte', 'financeiro'],
        response: `# ❤️ Apoie o NoxMedia Studio

## 💰 **Doação financeira**
**PIX:** noxmediaoficial@gmail.com
- Qualquer valor ajuda
- 100% investido no projeto
- Melhores servidores = melhor experiência

## 🌟 **Outras formas de apoiar**

### ⭐ **GitHub Star**
- Dê uma estrela no repositório
- Aumenta nossa visibilidade

### 🐛 **Reporte & Sugira**
- Encontrou um bug? Nos avise!
- Tem uma ideia? Compartilhe!

### 📢 **Espalhe a Palavra**
- Conte para outros criadores
- Compartilhe nas redes sociais
- Recomende para amigos

> 🙏 **Toda ajuda é muito bem-vinda e faz diferença real!**`,
        quickReplies: ['🔓 GitHub', '💬 Discord', '🤝 Como contribuir', '🏠 Voltar']
    },

    discord: {
        keywords: ['discord', 'comunidade', 'chat', 'grupo', 'server'],
        response: `# 💬 Discord - Nossa Comunidade

## 🔗 **Link de convite**
**https://discord.com/invite/VG5hmeGbbj**

## 🎯 **O que você encontra**

### 🆘 **Suporte em tempo real**
- Tire dúvidas instantaneamente
- Ajuda da comunidade ativa
- Resposta rápida dos devs

### 📢 **Novidades em primeira mão**
- Anúncios de atualizações
- Prévia de novas funcionalidades
- Changelog detalhado

### 🔄 **Feedback direto**
- Converse diretamente com os devs
- Influencie o desenvolvimento
- Teste recursos em beta

### 🤝 **Networking**
- Conecte-se com outros criadores
- Troque experiências
- Colaborações e parcerias

> 🎉 **Venha fazer parte da nossa família!**`,
        quickReplies: ['🤝 Como contribuir', '❤️ Apoiar projeto', '🏠 Voltar']
    },

    github: {
        keywords: ['github', 'codigo', 'fonte', 'open', 'source', 'repositorio', 'projeto', 'code'],
        response: `# 🔓 Open Source no GitHub

## 🔗 **Repositório oficial**
**https://github.com/PhilippeBoechat/NoxMedia**

## ✨ **Por que Open Source?**

### 🔍 **Transparência total**
- Todo código disponível
- Audite nossa segurança
- Veja como funciona por dentro

### 🤝 **Contribuições bem-vindas**
- Pull requests aceitos
- Issues para bugs/melhorias
- Documentação colaborativa

### 📜 **Licença permissiva**
- Use como base para seus projetos
- Modifique conforme necessário
- Compartilhe suas melhorias

### 🛠️ **Para desenvolvedores**
- Setup completo documentado
- Guias de contribuição
- Padrões de código definidos

> 💡 **Transparência** é um dos nossos valores fundamentais!`,
        quickReplies: ['🤝 Como contribuir', '🗺️ Roadmap', '❤️ Apoiar projeto', '🏠 Voltar']
    },

    contribuir: {
        keywords: ['contribuir', 'colaborar', 'ajudar', 'pull', 'request', 'issue', 'bug', 'melhorar'],
        response: `# 🤝 Como Contribuir

## 🎯 **Maneiras de ajudar**

### 🐛 **Reportar Bugs**
- [Abra uma issue](https://github.com/PhilippeBoechat/NoxMedia/issues)
- Descreva o problema detalhadamente
- Inclua screenshots se possível

### 💡 **Sugerir Melhorias**
- Compartilhe suas ideias
- Proponha novas funcionalidades
- Discuta com a comunidade

### 👨‍💻 **Contribuir com Código**
- Fork o repositório
- Implemente sua melhoria
- Envie um Pull Request

### 📝 **Documentação**
- Melhore guias existentes
- Crie tutoriais
- Traduza para outros idiomas

### 🎨 **Design & UX**
- Sugira melhorias na interface
- Crie mockups e protótipos
- Teste usabilidade

> 🌟 **Toda contribuição, grande ou pequena, é valiosa!**`,
        quickReplies: ['🔓 GitHub', '💬 Discord', '🏠 Voltar']
    },

    // ====== PROBLEMAS TÉCNICOS ======
    problemasAcesso: {
        keywords: ['acessar', 'conecta', 'carrega', 'abre', 'site', 'plataforma', 'fora', 'ar', 'offline', 'indisponivel'],
        response: `# 🔧 Problemas de Acesso

## ⚠️ **Site não carrega?**

### 1️⃣ **Limpeza básica**
- Limpe **cache e cookies**
- Recarregue a página (Ctrl+F5)
- Feche e abra o navegador

### 2️⃣ **Teste outro navegador**
- Chrome, Firefox, Safari, Edge
- Use modo **anônimo/incógnito**
- Desative **extensões temporariamente**

### 3️⃣ **Conexão**
- Verifique sua internet
- Teste outros sites
- Reinicie o roteador se necessário

### 4️⃣ **Status do serviço**
- Consulte nosso **Discord** por avisos
- Verifique se há manutenção programada

> 🆘 **Ainda com problemas?** Entre em contato conosco imediatamente!`,
        quickReplies: ['👨‍💻 Falar com humano', '💬 Discord', '🏠 Voltar']
    },

    sobre: {
        keywords: ['sobre', 'noxmedia', 'missao', 'visao', 'objetivo', 'projeto', 'historia'],
        response: `# 🏢 Sobre o NoxMedia Studio

## 🎯 **Nossa missão**
> *Democratizar a criação de legendas com tecnologia de ponta*

Tornamos a **acessibilidade** uma realidade para criadores de conteúdo do mundo todo.

## 🌟 **Nossos valores**

### ♿ **Acessibilidade primeiro** 
Legendas conectam pessoas e derrubam barreiras

### 🔓 **Open Source**
Transparência e colaboração movem o progresso

### 💚 **Gratuito para todos**
Ferramentas essenciais não devem ter custo

### 🚀 **Inovação constante**
Sempre buscando formas melhores de servir

## 📈 **Impacto**
- Milhares de vídeos legendados
- Comunidade global ativa
- Desenvolvedores contribuindo
- Acessibilidade expandida

> ❤️ **Feito with love pela comunidade, para a comunidade**`,
        quickReplies: ['👥 Equipe', '🔓 GitHub', '🗺️ Roadmap', '🏠 Voltar']
    },

    legendar: {
        keywords: ['legenda', 'legendas', 'caption', 'gerar', 'criar', 'fazer', 'transcrever', 'transcricao', 'automatico'],
        response: `# 🎬 Geração Automática de Legendas

## 🤖 **IA Avançada**
Utilizamos tecnologia de ponta para transcrever seu conteúdo com **alta precisão**.

## 🌍 **Suporte multilíngue**
- Português (Brasil)
- Inglês 
- Espanhol
- E mais idiomas em desenvolvimento

## ⚡ **Processo rápido**
1. **Upload** do vídeo
2. **Processamento** automático da IA
3. **Legendas** prontas em minutos
4. **Edição** opcional para ajustes

## 🎯 **Precisão alta**
- Reconhecimento de voz otimizado
- Pontuação automática
- Timing sincronizado
- Menos trabalho manual

> ✨ **Resultado:** Legendas profissionais em uma fração do tempo tradicional!`,
        quickReplies: ['🚀 Como usar?', '📁 Formatos suportados', '✏️ Editar legendas', '🏠 Voltar']
    },

    comandos: {
        keywords: ['comando', 'comandos', 'atalho', 'atalhos', 'teclado', 'shortcuts', 'teclas'],
        response: `# ⌨️ Comandos e Atalhos

## 🎬 **No Editor de Legendas**

### 💾 **Salvamento**
- **Ctrl + S** - Salvar alterações rapidamente

### ▶️ **Reprodução**
- **Espaço** - Play/Pause do vídeo
- **← →** - Navegar entre legendas
- **↑ ↓** - Ajustar volume

### ✏️ **Edição**
- **Enter** - Confirmar edição
- **Esc** - Cancelar edição
- **Tab** - Próxima legenda

## 💡 **Dicas de produtividade**
- Use **cliques duplos** para edição rápida
- **Arraste** as bordas para ajustar timing
- **Ctrl + Z** funciona para desfazer ações

> 🚀 **Domine os atalhos** e seja mais produtivo!`,
        quickReplies: ['🏠 Voltar', '🚀 Como usar?', '✏️ Editar legendas']
    },

    // ====== FALLBACK PARA CASOS NÃO ENCONTRADOS ======
    naoEncontrado: {
        keywords: [], // Não usado, mas mantido para consistência
        response: `# 🤔 Hmm, não entendi bem...

Parece que sua pergunta não está na minha base de conhecimento atual.

## 🎯 **Posso te ajudar com:**
- ⬆️ Upload de vídeos
- ✏️ Edição de legendas  
- 📁 Formatos suportados
- 🔧 Problemas técnicos
- 💡 Informações sobre o projeto

## 💬 **Para perguntas específicas:**
Recomendo entrar em contato com nossa equipe humana - eles vão poder te ajudar melhor!`,
        quickReplies: ['👨‍💻 Falar com humano', '💬 Discord', '🏠 Menu principal']
    }
};

/**
 * Função de busca melhorada com sistema de pontuação para encontrar a resposta mais relevante.
 * Mais precisa para frases complexas e resistente a palavras irrelevantes.
 */
export const buscarRespostaComScore = (mensagem: string): { response: string, quickReplies?: string[] } | null => {
    const msgNormalizada = removerAcentos(mensagem.toLowerCase().trim());
    const palavrasInput = msgNormalizada.split(/\s+/);

    const scores: { key: string; score: number }[] = [];

    // Itera sobre cada item na base de conhecimento
    for (const [key, item] of Object.entries(conhecimentoNoxMedia)) {
        let currentScore = 0;

        // Compara cada palavra da mensagem do usuário com cada palavra-chave do item
        for (const keyword of item.keywords) {
            for (const inputWord of palavrasInput) {
                const distance = levenshteinDistance(keyword, inputWord);

                // Lógica de Pontuação
                if (distance === 0) {
                    // Match perfeito: +10 pontos + bônus pelo tamanho da keyword
                    currentScore += 10 + keyword.length;
                } else {
                    // Match por aproximação (com erro de digitação)
                    const threshold = keyword.length > 8 ? 2 : 1;
                    if (distance <= threshold) {
                        // +5 pontos por um match "fuzzy"
                        currentScore += 5;
                    }
                }
            }
        }

        if (currentScore > 0) {
            scores.push({ key, score: currentScore });
        }
    }

    // Se nenhum item pontuou, retorna a resposta padrão
    if (scores.length === 0) {
        return {
            response: conhecimentoNoxMedia.naoEncontrado.response,
            quickReplies: conhecimentoNoxMedia.naoEncontrado.quickReplies,
        };
    }

    // Ordena os itens pela maior pontuação
    scores.sort((a, b) => b.score - a.score);

    // Pega a chave do item com maior pontuação
    const bestMatchKey = scores[0].key;
    const bestMatch = conhecimentoNoxMedia[bestMatchKey];

    // Retorna a resposta encontrada
    return {
        response: bestMatch.response,
        quickReplies: bestMatch.quickReplies,
    };
};