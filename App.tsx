
import React, { useState, useEffect, useRef } from 'react';
import SidebarInput from './components/SidebarInput';
import ContentCard from './components/ContentCard';
import { GenerationResult, ProductInput, User, VideoSpecs } from './types';
import { generateContentStrategy, generateProductImage, generateAudio } from './services/geminiService';
import { buildFinalImagePrompt } from './utils/promptGenerator';
import { composeLogo } from './utils/imageUtils';
import { LucideSparkles, LucideAlertCircle, LucideX, LucideSettings2, LucideLock, LucideLogOut } from 'lucide-react';

const MY_AUTH_PORTAL_URL = "https://auth.fromzerocreative.com/";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [currentInputs, setCurrentInputs] = useState<ProductInput | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  
  const authFrameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('vantage_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setIsAuthChecking(false);

    const handleMessage = (event: MessageEvent) => {
      const portalOrigin = new URL(MY_AUTH_PORTAL_URL).origin;
      if (event.origin !== portalOrigin) return;
      const data = event.data;
      
      if (data.type === 'AUTH_SUCCESS') {
        if (localStorage.getItem('vantage_logout_pending') === 'true') {
          if (event.source) (event.source as Window).postMessage({ type: 'LOGOUT_REQUEST' }, event.origin);
          localStorage.removeItem('vantage_logout_pending');
          return;
        }
        const userData: User = {
          email: data.email,
          name: data.displayName || data.email.split('@')[0],
          picture: `https://ui-avatars.com/api/?name=${data.displayName || data.email}&background=6366f1&color=fff`
        };
        setUser(userData);
        localStorage.setItem('vantage_user', JSON.stringify(userData));
      } else if (data.type === 'AUTH_ERROR') {
        setAuthError(data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const logout = () => {
    localStorage.setItem('vantage_logout_pending', 'true');
    localStorage.removeItem('vantage_user');
    setUser(null);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleGenerate = async (data: ProductInput) => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    setIsLoadingStrategy(true);
    setResults([]);
    setCurrentInputs(data);

    try {
      const concepts = await generateContentStrategy(data);
      const placeholders: GenerationResult[] = concepts.map((concept, idx) => ({
        id: `ugc-${Date.now()}-${idx}`,
        category: 'ugc',
        prompt: concept,
        status: 'loading'
      }));
      setResults(placeholders);
      setIsLoadingStrategy(false);

      for (let i = 0; i < concepts.length; i++) {
        const concept = concepts[i];
        const resultId = placeholders[i].id;
        
        if (i > 0 && i % 2 === 0) {
          await delay(1500);
        }

        renderSingleImage(resultId, concept, data);
      }

    } catch (e: any) {
      alert("Gagal menganalisis produk.");
      setIsLoadingStrategy(false);
    }
  };

  const renderSingleImage = async (id: string, prompt: string, inputs: ProductInput) => {
    setResults(prev => prev.map(res => res.id === id ? { ...res, status: 'loading' } : res));
    try {
      const finalPrompt = buildFinalImagePrompt(prompt, 'ugc', inputs);
      const referenceImages = [inputs.productImage, ...inputs.additionalPhotos];
      if (inputs.modelStrategy.type === 'upload' && inputs.modelStrategy.customModelPhoto) {
        referenceImages.push(inputs.modelStrategy.customModelPhoto);
      }

      const imageUrl = await generateProductImage(finalPrompt, referenceImages, inputs.ratio);
      let finalImage = imageUrl;
      if (inputs.useLogo && inputs.logo) finalImage = await composeLogo(imageUrl, inputs.logo);

      setResults(prev => prev.map(res => 
        res.id === id ? { ...res, imageUrl: finalImage, status: 'success' } : res
      ));
    } catch (e: any) {
      setResults(prev => prev.map(res => 
        res.id === id ? { ...res, status: 'error', errorMsg: "Kuota penuh atau filter aktif." } : res
      ));
    }
  };

  const handleRegenerateImage = (id: string) => {
    const result = results.find(r => r.id === id);
    if (result && currentInputs) {
      renderSingleImage(id, result.prompt, currentInputs);
    }
  };

  const handleGenerateAudioForContent = async (id: string, script: string, voice: string) => {
    try {
      const audioUrl = await generateAudio(script, voice);
      setResults(prev => prev.map(res => res.id === id ? { ...res, audioUrl } : res));
    } catch (e) {}
  };

  const handleUpdateScriptForContent = (id: string, script: string) => {
    setResults(prev => prev.map(res => res.id === id ? { ...res, script } : res));
  };

  const handleUpdateVideoSpecsForContent = (id: string, videoSpecs: VideoSpecs) => {
    setResults(prev => prev.map(res => res.id === id ? { ...res, videoSpecs } : res));
  };

  if (!user) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center animate-in fade-in zoom-in">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl mx-auto mb-8">
            <LucideLock size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Vantage AI Studio</h1>
          <p className="text-slate-400 font-medium text-sm mb-10 leading-relaxed">Login pro untuk mulai berkarya.</p>
          <iframe ref={authFrameRef} src={MY_AUTH_PORTAL_URL} id="authFrame" style={{ width: '100%', height: '60px', border: 'none' }} scrolling="no" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      <div className={`fixed lg:relative z-[50] h-full transition-all duration-300 shrink-0 ${isSidebarOpen ? 'translate-x-0 w-[85vw] sm:w-[400px] lg:w-[420px]' : '-translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}`}>
        <SidebarInput onGenerate={handleGenerate} isLoading={isLoadingStrategy} onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
        <header className="h-16 lg:h-20 flex items-center px-4 lg:px-10 border-b border-slate-200 bg-white/80 backdrop-blur-md shrink-0 z-20">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 mr-4 bg-slate-100 rounded-xl text-slate-600">
            {isSidebarOpen && window.innerWidth < 1024 ? <LucideX size={20} /> : <LucideSettings2 size={20} />}
          </button>

          <div className="flex-1">
             <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">6 Interior UGC Concepts</h2>
          </div>

          <div className="ml-auto flex items-center gap-3">
             <img src={user.picture} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="profile" />
             <button onClick={logout} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><LucideLogOut size={18} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar relative">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8 max-w-[1400px] mx-auto pb-24">
            {results.map((res) => (
              <ContentCard 
                key={res.id} 
                data={res} 
                inputs={currentInputs!} 
                onGenerateAudio={(script, voice) => handleGenerateAudioForContent(res.id, script, voice)} 
                onUpdateScript={(script) => handleUpdateScriptForContent(res.id, script)} 
                onUpdateVideoSpecs={(specs) => handleUpdateVideoSpecsForContent(res.id, specs)}
                onRegenerateImage={() => handleRegenerateImage(res.id)}
              />
            ))}
            {results.length === 0 && !isLoadingStrategy && (
               <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-slate-300">
                  <LucideSparkles size={64} className="mb-4 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">Siap merender 6 konten affiliate?</p>
               </div>
            )}
          </div>
        </div>

        {isLoadingStrategy && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Merancang 6 Konsep Interior...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
