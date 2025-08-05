# 🎬 NoxMedia Studio Frontend

<div align="center">
  
**Interface moderna para a plataforma de legendas automáticas e suporte**

[![Frontend Only](https://img.shields.io/badge/Frontend%20Only-🚧-orange)](https://github.com/PhilippeBoechat/NoxMedia)
[![Open Source](https://img.shields.io/badge/Open%20Source-💚-success)](https://github.com/PhilippeBoechat/NoxMedia)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?logo=vite)](https://vitejs.dev/)

[🚀 Demo Live](https://noxmedia.studio) • [📚 Documentação](https://docs.noxmedia.studio) • [💬 Discord](https://discord.com/invite/VG5hmeGbbj) • [🐛 Report Bug](https://github.com/PhilippeBoechat/NoxMedia/issues)

</div>

---

## ⚠️ **IMPORTANTE - Status do Projeto**

> **🚧 Este repositório contém APENAS o FRONTEND da aplicação NoxMedia Studio**
> 
> **📋 Status Atual:**
> - ✅ **Frontend**: Interface 85% completa e funcional
> - 💬 **Sistema de chat com painel administrativo funcional (85%)**
> - 🚧 **Backend**: Em desenvolvimento ativo (API, IA, processamento de vídeo)
> - 🚧 **Integração**: Algumas funcionalidades simuladas com dados mock
> 
> **🔄 O que funciona agora:**
> - Sistema de chat com painel administrativo (tickets, mensagens, quick replies, fluxo de atendimento)
> - Interface completa e responsiva
> - Navegação entre todas as telas
> - Demonstração visual de funcionalidades avançadas
> - Sistema de estado local (LocalStorage)
> 
> **⏳ Em desenvolvimento (Backend):**
> - Processamento real de vídeos
> - IA para geração automática de legendas
> - Base de dados persistente

---

## ✨ Sobre o Projeto

**NoxMedia Studio Frontend** é a interface moderna e intuitiva da plataforma que **combina** gerenciamento inteligente de tickets de suporte com edição automática de legendas de vídeo alimentada por IA. Este repositório contém **apenas a interface do usuário**, com o backend ainda em desenvolvimento ativo.

### 🎯 Por que NoxMedia?

- **🎨 Interface Moderna**: Design responsivo e experiência mobile-first
- **💬 Chat e Painel Funcionais**: Sistema de chat com tickets, quick replies e painel administrativo já operacionais
- **⚡ Performance**: Construído com Vite + React para máxima velocidade
- **🔓 100% Open Source**: Frontend completo com licença permissiva
- **🚧 Em Desenvolvimento**: Backend com IA avançada sendo finalizado
- **🌍 Visão de Futuro**: Democratizando acessibilidade audiovisual

---

## 🤖 Como este projeto foi desenvolvido

Todo o projeto foi desenvolvido com o auxílio de ferramentas de Inteligência Artificial e IDEs modernas:

- **GitHub Copilot**
- **ChatGPT (OpenAI)**
- **Claude AI (Anthropic)**
- **Google AI Studio (Gemini)**
- **Visual Studio e Visual Studio Code**

Essas ferramentas aceleraram o desenvolvimento, trouxeram sugestões inteligentes de código, revisão automática e otimização de fluxos, tornando o NoxMedia Studio um exemplo de integração entre criatividade humana e IA.

---

## 🎭 Funcionalidades do Frontend

- **Chatbot inteligente**: Responde dúvidas, guia o usuário e encaminha para atendimento humano.
- **Painel administrativo de tickets**: Criação, acompanhamento e finalização de tickets de suporte.
- **Admin Panel**: Visualização de estatísticas, controle de tickets e status de atendentes.
- **Edição de legendas**: Upload de vídeos, geração automática de legendas, edição visual e exportação (SRT, VTT, TXT) *(em breve)*.
- **UX moderna**: Layout responsivo, rolagem automática, quick replies, atalhos de teclado e experiência mobile-friendly.
- **Open Source**: Código aberto, permissivo e pronto para colaboração.

---

## 🛠️ Stack Tecnológica (Frontend)

<div align="center">

| Frontend | Styling | Build | Icons | State |
|----------|---------|-------|-------|-------|
| ![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=for-the-badge&logo=react) | ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss) | ![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite) | ![Lucide](https://img.shields.io/badge/Lucide-Icons-F56565?style=for-the-badge) | ![Context API](https://img.shields.io/badge/Context-API-61DAFB?style=for-the-badge) |

</div>

### Frontend Dependencies
{
  "react": "^18.2.0",
  "typescript": "^5.2.2",
  "vite": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "lucide-react": "^0.263.1"
}
### 🔄 Backend Stack (Em Desenvolvimento)
🚧 Node.js + Express/Fastify
🚧 PostgreSQL/MongoDB 
🚧 Python + OpenAI/Whisper (IA)
🚧 Redis (Cache)
🚧 Docker + Kubernetes
---

## ⚡ Instalação Rápida

### Pré-requisitos
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn**
- **Git** ([Download](https://git-scm.com/))

### Passos de Instalação

1. **Clone o repositório**git clone https://github.com/PhilippeBoechat/NoxMedia.git
cd NoxMedia
2. **Instale as dependências**npm install
# ou
yarn install
3. **Execute em modo desenvolvimento**npm run dev
# ou
   yarn dev
4. **Explore a demo do frontend**🎭 http://localhost:5173
> **💡 Dica**: O sistema de chat e painel já está funcional. Outras funcionalidades avançadas são demonstrações até a integração completa com o backend.

### Scripts Disponíveisnpm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run type-check # Verificação de tipos TypeScript
---

## 🌐 Deploy em Produção

### Deploy Automático

| Plataforma | Status | Configuração |
|------------|--------|--------------|
| [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com) | ✅ Recomendado | Auto-deploy via Git |
| [![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://netlify.com) | ✅ Suportado | Drag & drop ou Git |
| [![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render)](https://render.com) | ✅ Suportado | Static site |

### Configuração Manual
1. **Build do projeto**: `npm run build`
2. **Servir pasta `dist`** com servidor estático
3. **Configurar variáveis de ambiente** (se necessário)

---

## 🤝 Como Contribuir

Adoramos contribuições da comunidade! Aqui está como você pode ajudar:

### 🐛 Reportar Bugs
1. Verifique se o bug já foi reportado em [Issues](https://github.com/PhilippeBoechat/NoxMedia/issues)
2. Crie uma nova issue com template detalhado
3. Inclua screenshots e passos para reproduzir

### ✨ Sugerir Features
1. Abra uma **Feature Request** no GitHub
2. Descreva detalhadamente sua ideia
3. Explique como beneficiaria os usuários

### 💻 Contribuir com Código (Frontend)
1. **Fork** o repositório
2. **Clone** seu fork localmentegit clone https://github.com/seu-usuario/NoxMedia.git3. **Crie uma branch** para sua featuregit checkout -b feature/minha-nova-feature4. **Implemente melhorias** na interface (componentes, UX, responsividade)
5. **Commit** suas mudançasgit commit -m "feat: melhora componente X da interface"6. **Push** para seu forkgit push origin feature/minha-nova-feature7. **Abra um Pull Request** no repositório original

> **🔔 Importante**: Este repositório aceita apenas contribuições relacionadas ao **frontend**. Para contribuições de backend, aguarde a abertura do repositório da API.

### 📋 Padrões de Commit
Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
style: formatação/estilo
refactor: refatoração de código
test: adição de testes
chore: tarefas de manutenção
---

## 📈 Roadmap

### 🎯 Próximas Features (Q1 2025)
- [ ] **🔧 Backend completo** - API REST + IA para legendas
- [ ] **🤖 Integração real com IA** para processamento de vídeo
- [ ] **🔐 Sistema de autenticação** e gerenciamento de usuários
- [ ] **📊 Base de dados persistente** (PostgreSQL/MongoDB)
- [ ] **🚀 Deploy em produção** com frontend + backend integrados

### 🚀 Visão de Longo Prazo (Backend Concluído)
- [ ] **Plugin para WordPress** e editores populares
- [ ] **Suporte a mais idiomas** (50+ línguas) 
- [ ] **Mobile App** (React Native)
- [ ] **Integração com YouTube/Vimeo** automática
- [ ] **Marketplace de templates** da comunidade

---

## 📊 Estatísticas do Projeto

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/PhilippeBoechat/NoxMedia?style=social)
![GitHub forks](https://img.shields.io/github/forks/PhilippeBoechat/NoxMedia?style=social)
![GitHub issues](https://img.shields.io/github/issues/PhilippeBoechat/NoxMedia)
![GitHub contributors](https://img.shields.io/github/contributors/PhilippeBoechat/NoxMedia)
![GitHub last commit](https://img.shields.io/github/last-commit/PhilippeBoechat/NoxMedia)

</div>

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

**Isso significa que você pode:**
- ✅ Usar comercialmente
- ✅ Modificar o código
- ✅ Distribuir
- ✅ Usar em projetos privados

---

## 📞 Suporte e Contato

### 🆘 Precisa de Ajuda?

| Canal | Resposta | Descrição |
|-------|----------|-----------|
| 💬 [Discord](https://discord.com/invite/VG5hmeGbbj) | Tempo real | Chat da comunidade + updates do backend |
| 📧 [Email](mailto:suporte@noxmedia.studio) | 24-48h | Suporte técnico do frontend |
| 🐛 [GitHub Issues](https://github.com/PhilippeBoechat/NoxMedia/issues) | 2-7 dias | Bugs da interface e sugestões |
| 📚 [Documentação](https://docs.noxmedia.studio) | Instantâneo | Guias do frontend |

### 🌟 Conecte-se Conosco

<div align="center">

[![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/invite/VG5hmeGbbj)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/PhilippeBoechat/NoxMedia)
[![Email](https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:suporte@noxmedia.studio)

</div>

---

<div align="center">

**🎬 NoxMedia Studio Frontend** — Interface moderna para democratizar acessibilidade de vídeos

*Frontend feito com* 💙 *pela comunidade • Backend em desenvolvimento ativo* 🚧

⭐ **Gostou da interface? Deixe uma estrela e acompanhe o desenvolvimento do backend!** ⭐

</div>