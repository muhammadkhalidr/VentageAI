
import React, { useState, useEffect, useRef } from 'react';
import SidebarInput from './components/SidebarInput';
import ContentCard from './components/ContentCard';
import { GenerationResult, ProductInput, User } from './types';
import { generateContentStrategy, generateProductImage, generateAudio } from './services/geminiService';
import { buildFinalImagePrompt } from './utils/promptGenerator';
import { composeLogo } from './utils/imageUtils';
import { LucideSparkles, LucideSmile, LucideAlertCircle, LucideX, LucideSettings2, LucideLock, LucideLogOut, LucideUserCheck } from 'lucide-react';

// URL Portal Login Anda
const MY_AUTH_PORTAL_URL = "https://auth.fromzerocreative.com/";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'broll' | 'ugc' | 'commercial'>('broll');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [currentInputs, setCurrentInputs] = useState<ProductInput | null>(null);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  
  // Ref untuk menyimpan instance iframe agar bisa diakses
  const authFrameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('vantage_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuthChecking(false);

    const handleMessage = (event: MessageEvent) => {
      const portalOrigin = new URL(MY_AUTH_PORTAL_URL).origin;
      if (event.origin !== portalOrigin) return;

      const data = event.data;
      
      if (data.type === 'AUTH_SUCCESS') {
        // Cek apakah user baru saja klik logout (mencegah login loop)
        if (localStorage.getItem('vantage_logout_pending') === 'true') {
          console.log("Mendeteksi pesan sukses setelah logout, mengirim perintah SignOut ke Iframe...");
          // Kirim balik pesan logout ke iframe
          if (event.source) {
            (event.source as Window).postMessage({ type: 'LOGOUT_REQUEST' }, event.origin);
          }
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
        setAuthError(null);
      } else if (data.type === 'AUTH_ERROR') {
        setAuthError(data.message || "Gagal melakukan autentikasi.");
        localStorage.removeItem('vantage_logout_pending');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const logout = () => {
    // 1. Set flag agar pesan AUTH_SUCCESS berikutnya dibatalkan
    localStorage.setItem('vantage_logout_pending', 'true');
    
    // 2. Bersihkan state lokal
    localStorage.removeItem('vantage_user');
    setUser(null);
    setAuthError(null);
    
    // TIDAK menggunakan window.location.href untuk menghindari error DNS/Hosting
    console.log("Logout berhasil di sisi klien. Menunggu sinkronisasi Iframe...");
  };

  const handleGenerate = async (data: ProductInput) => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    setIsLoading(true);
    setResults([]);
    setCurrentInputs(data);
    setLoadingStatus('Menganalisis Strategi...');

    try {
      const strategy = await generateContentStrategy(data);
      const categories: ('broll' | 'ugc' | 'commercial')[] = ['broll', 'ugc', 'commercial'];
      
      for (const cat of categories) {
        const ideas = (strategy[cat] || []).slice(0, cat === 'ugc' ? 4 : 2);
        
        for (let i = 0; i < ideas.length; i++) {
          setLoadingStatus(`Merender ${cat} (${i + 1}/${ideas.length})...`);
          try {
            const finalPrompt = buildFinalImagePrompt(ideas[i].text, cat, data);
            const imageUrl = await generateProductImage(finalPrompt, [data.productImage, ...data.additionalPhotos], data.ratio);
            let finalImage = imageUrl;
            if (data.useLogo && data.logo) finalImage = await composeLogo(imageUrl, data.logo);

            setResults(prev => [...prev, {
              id: `${cat}-${Date.now()}-${i}`,
              category: cat,
              prompt: ideas[i].text,
              imageUrl: finalImage
            }]);
          } catch (e) {
            console.error(e);
          }
        }
      }
    } catch (e: any) {
      setErrorLog(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAudioForContent = async (id: string, script: string, voice: string) => {
    try {
      const audioUrl = await generateAudio(script, voice);
      setResults(prev => prev.map(res => res.id === id ? { ...res, audioUrl } : res));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateScriptForContent = (id: string, script: string) => {
    setResults(prev => prev.map(res => res.id === id ? { ...res, script } : res));
  };

  if (!user) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-10 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl mx-auto mb-8">
            <LucideLock size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Vantage AI Studio</h1>
          <p className="text-slate-400 font-medium text-sm mb-10 leading-relaxed">Silakan login untuk mengakses editor.</p>
          
          {authError && (
            <div className="mb-8 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-left">
              <LucideAlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-[11px] font-bold text-red-600 leading-tight">{authError}</p>
            </div>
          )}

          <div className="w-full flex justify-center relative min-h-[70px] bg-slate-50 rounded-2xl p-2 border border-slate-100">
             {isAuthChecking ? (
               <div className="flex items-center gap-3 py-4">
                 <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memeriksa...</span>
               </div>
             ) : (
               <iframe 
                  ref={authFrameRef}
                  src={MY_AUTH_PORTAL_URL} 
                  id="authFrame"
                  title="Google Login"
                  style={{ width: '100%', height: '60px', border: 'none', overflow: 'hidden' }}
                  scrolling="no"
               />
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      <div className={`fixed lg:relative z-[50] h-full transition-all duration-300 shrink-0 ${isSidebarOpen ? 'translate-x-0 w-[85vw] sm:w-[400px] lg:w-[420px]' : '-translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}`}>
        <SidebarInput onGenerate={handleGenerate} isLoading={isLoading} onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
        <header className="h-16 lg:h-20 flex items-center px-4 lg:px-10 border-b border-slate-200 bg-white/80 backdrop-blur-md shrink-0 z-20">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 mr-4 bg-slate-100 rounded-xl text-slate-600">
            {isSidebarOpen && window.innerWidth < 1024 ? <LucideX size={20} /> : <LucideSettings2 size={20} />}
          </button>

          <div className="flex-1 flex justify-center lg:justify-start">
            <div className="flex bg-slate-100 p-1 rounded-full gap-0.5 overflow-x-auto no-scrollbar">
              {['broll', 'ugc', 'commercial'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <p className="text-[10px] font-black text-slate-900 leading-none">{user.name}</p>
                <p className="text-[8px] font-bold text-slate-400 leading-none mt-1">{user.email}</p>
             </div>
             <img src={user.picture} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="profile" />
             <button onClick={logout} title="Logout" className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <LucideLogOut size={18} />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 lg:p-10 custom-scrollbar relative">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-8 max-w-[1400px] mx-auto pb-24">
            {results.filter(res => res.category === activeTab).map((res) => (
              <ContentCard 
                key={res.id} 
                data={res} 
                inputs={currentInputs!} 
                onGenerateAudio={(script, voice) => handleGenerateAudioForContent(res.id, script, voice)} 
                onUpdateScript={(script) => handleUpdateScriptForContent(res.id, script)} 
              />
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            <div className="w-16 h-16 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8" />
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Memproses Konten Pro</h3>
            <div className="px-5 py-2 bg-indigo-50 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest">{loadingStatus}</div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
