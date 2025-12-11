import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Settings, Loader2, Trophy, Globe } from 'lucide-react';
import { Message, Fixture } from './types';
import { sendMessageToGemini } from './services/gemini';
import { fetchFixtures, getFootballApiKey } from './services/footballApi';
import MatchCard from './components/MatchCard';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'Olá! Sou o BetMaster AI. Busco dados atualizados da web (Flashscore, etc) para analisar jogos. Digite "Jogos de hoje" ou peça uma análise específica.',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loadingFixtures, setLoadingFixtures] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // We try to load fixtures for the sidebar if the API key exists, otherwise we leave it empty
    // This allows the sidebar to be a "bonus" feature, while the chat works via Search
    if (getFootballApiKey()) {
      loadTodayFixtures();
    }
  }, []);

  const loadTodayFixtures = async () => {
    setLoadingFixtures(true);
    const today = new Date().toISOString().split('T')[0];
    const data = await fetchFixtures(today);
    const relevantFixtures = data.response?.slice(0, 10) || []; 
    setFixtures(relevantFixtures);
    setLoadingFixtures(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessage: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);
    setProcessingStatus('Pesquisando na web...');

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const responseText = await sendMessageToGemini(history, text, (toolName) => {
        setProcessingStatus(`${toolName}...`);
      });

      const aiMessage: Message = {
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: 'model',
        content: 'Ocorreu um erro ao processar sua solicitação.',
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setProcessingStatus('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const analyzeMatch = (fixture: Fixture) => {
    const prompt = `Busque estatísticas e analise a partida entre ${fixture.teams.home.name} e ${fixture.teams.away.name}.`;
    handleSendMessage(prompt);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar - Matches List */}
      <div className="hidden md:flex flex-col w-80 border-r border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-500 font-bold">
            <Trophy className="w-5 h-5" />
            <span>Lista Rápida</span>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            title="Configurar API-Football (Opcional)"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loadingFixtures ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="w-6 h-6 animate-spin text-green-500" />
            </div>
          ) : fixtures.length > 0 ? (
            fixtures.map((f) => (
              <MatchCard 
                key={f.fixture.id} 
                fixture={f} 
                onClick={() => analyzeMatch(f)}
              />
            ))
          ) : (
             <div className="flex flex-col items-center justify-center text-center text-gray-500 text-sm mt-10 p-6 border border-dashed border-gray-800 rounded-lg space-y-4">
                <Globe className="w-8 h-8 text-gray-600" />
                <p>
                  Para ver a lista automática aqui, configure a chave API-Football. 
                </p>
                <p className="text-xs text-gray-400">
                  Caso contrário, basta perguntar no chat! O Bot buscará os jogos no Flashscore/Google.
                </p>
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-green-500 hover:text-green-400 text-xs font-semibold underline"
                >
                    Configurar API Key
                </button>
             </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header (Mobile Only for settings) */}
        <div className="md:hidden p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
           <h1 className="font-bold text-green-500">BetMaster AI</h1>
           <button onClick={() => setIsSettingsOpen(true)}><Settings className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${msg.role === 'user' ? 'bg-blue-600' : 'bg-green-600'}
              `}>
                {msg.role === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
              </div>
              
              <div className={`
                max-w-[85%] md:max-w-[70%] p-4 rounded-2xl
                ${msg.role === 'user' 
                  ? 'bg-blue-600/10 border border-blue-600/20 text-blue-100 rounded-tr-none' 
                  : 'bg-gray-800/80 border border-gray-700 text-gray-100 rounded-tl-none markdown-content shadow-lg'}
                ${msg.isError ? 'border-red-500/50 bg-red-900/10' : ''}
              `}>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot className="w-6 h-6 text-white" />
               </div>
               <div className="bg-gray-800/80 border border-gray-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                  <span className="text-sm text-gray-400">{processingStatus}</span>
               </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900/80 backdrop-blur border-t border-gray-800">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte: 'Jogos de hoje' ou 'Palpite Real x Barça'"
              className="w-full bg-gray-950 text-white pl-4 pr-12 py-4 rounded-xl border border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-xl transition-all"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 top-2 p-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2 text-xs text-gray-500">
             BetMaster AI usa Google Search para encontrar dados (Flashscore/Web). Sempre verifique as fontes.
          </div>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default App;