import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import EditorView from './components/EditorView';
import DonatePage from './components/DonatePage';
import SupportersPage from './components/SupportersPage';
import AboutPage from './components/AboutPage';
import AdminPanelPage from './components/AdminPanelPage';
import { VideoSource } from './types';
import { LogoIcon } from './components/icons';
import NoxMediaChatbot from './components/NoxMediaChatbot';
import { ChatProvider } from './contexts/ChatContext';

// Sempre use o domínio do ngrok que aponta para o backend (porta 8000)
const BACKEND_URL = 'http://localhost:8000';
type View = 'upload' | 'editing';

const MainApp: React.FC = () => {
  const [view, setView] = useState<View>('upload');
  const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [whisperModels, setWhisperModels] = useState<{ value: string, label: string }[]>([]);
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  // Limpa mensagens do chat no localStorage ao iniciar o app
  useEffect(() => {
    localStorage.removeItem('noxmedia-messages'); // ajuste a chave conforme seu sistema
  }, []);

  // Pré-carrega modelos ao selecionar vídeo
  // handleVideoSelect agora aceita File OU VideoSource
  const handleVideoSelect = useCallback(async (input: File | VideoSource) => {
    if (input instanceof File) {
      if (input.type.startsWith('video/')) {
        const url = URL.createObjectURL(input);
        setVideoSource({ url, filename: input.name });
        setView('editing');
        setError(null);
        // Fetch modelos se ainda não carregados
        if (whisperModels.length === 0) {
          try {
            const res = await fetch(`${BACKEND_URL}/api/models`);
            const data = await res.json();
            if (Array.isArray(data.models)) {
              setWhisperModels(data.models.map((m: string) => ({
                value: m,
                label: m.charAt(0).toUpperCase() + m.replace(/[-_]/g, ' ').slice(1)
              })));
            }
          } catch {
            setWhisperModels([
              { value: 'tiny', label: 'Tiny' },
              { value: 'base', label: 'Base' },
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large-v2', label: 'Large-v2' },
              { value: 'large-v3', label: 'Large-v3' }
            ]);
          }
        }
      } else {
        setError('Invalid file type. Please upload a video file.');
      }
    } else if (input && typeof input.url === 'string') {
      // Caso VideoSource vindo do HeroSection (YouTube)
      setVideoSource(input);
      setView('editing');
      setError(null);
      if (whisperModels.length === 0) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/models`);
          const data = await res.json();
          if (Array.isArray(data.models)) {
            setWhisperModels(data.models.map((m: string) => ({
              value: m,
              label: m.charAt(0).toUpperCase() + m.replace(/[-_]/g, ' ').slice(1)
            })));
          }
        } catch {
          setWhisperModels([
            { value: 'tiny', label: 'Tiny' },
            { value: 'base', label: 'Base' },
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large-v2', label: 'Large-v2' },
            { value: 'large-v3', label: 'Large-v3' }
          ]);
        }
      }
    }
  }, [whisperModels.length]);

  const handleBackToUpload = useCallback(() => {
    if (videoSource) {
      URL.revokeObjectURL(videoSource.url);
    }
    setView('upload');
    setVideoSource(null);
    setError(null);
  }, [videoSource]);

  // Também pré-carrega modelos ao abrir app (opcional, para UX ainda mais rápida)
  useEffect(() => {
    if (whisperModels.length === 0) {
      (async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/models`);
          const data = await res.json();
          if (Array.isArray(data.models)) {
            setWhisperModels(data.models.map((m: string) => ({
              value: m,
              label: m.charAt(0).toUpperCase() + m.replace(/[-_]/g, ' ').slice(1)
            })));
          }
        } catch {
          setWhisperModels([
            { value: 'tiny', label: 'Tiny' },
            { value: 'base', label: 'Base' },
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large-v2', label: 'Large-v2' },
            { value: 'large-v3', label: 'Large-v3' }
          ]);
        }
      })();
    }
  }, [whisperModels.length]);

  return (
    <div className="min-h-screen text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* Renderiza o header/navbar apenas se não estiver na rota /admin */}
      {!isAdmin && (
        <header className="w-full max-w-7xl mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">NoxMedia</h1>
          </div>
          <nav className="flex gap-4">
            <Link to="/" className="text-slate-300 hover:text-purple-400 transition-colors">Home</Link>
            <Link to="/donate" className="text-slate-300 hover:text-purple-400 transition-colors">Donate</Link>
            <Link to="/about" className="text-slate-300 hover:text-blue-400 transition-colors">Sobre</Link>
            {view === 'editing' && (
              <button 
                onClick={handleBackToUpload}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ml-4"
              >
                New Project
              </button>
            )}
          </nav>
        </header>
      )}
      <main className="w-full flex-grow flex items-start justify-center">
        <Routes>
          <Route path="/" element={view === 'upload' ? (
            <HeroSection onVideoSelect={handleVideoSelect} error={error} />
          ) : videoSource ? (
            <EditorView videoSource={videoSource} whisperModels={whisperModels} />
          ) : null} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/supporters" element={<SupportersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
        </Routes>
      </main>
      <NoxMediaChatbot />
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <ChatProvider>
      <MainApp />
    </ChatProvider>
  </Router>
);

export default App;