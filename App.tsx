
import React, { useState, useEffect } from 'react';
import SidebarInput from './components/SidebarInput';
import ContentCard from './components/ContentCard';
import { GenerationResult, ProductInput } from './types';
import { generateContentStrategy, generateProductImage, generateAudio } from './services/geminiService';
import { buildFinalImagePrompt } from './utils/promptGenerator';
import { composeLogo } from './utils/imageUtils';
import { LucideSparkles, LucideSmile, LucideAlertCircle, LucideX, LucideSettings2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broll' | 'ugc' | 'commercial'>('broll');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [currentInputs, setCurrentInputs] = useState<ProductInput | null>(null);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Handle auto-open/close on resize for better UX
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        // Keep current state on mobile unless it's a fresh load
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGenerate = async (data: ProductInput) => {
    // Close sidebar ONLY on mobile when generation starts
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    
    setIsLoading(true);
    setErrorLog(null);
    setResults([]);
    setCurrentInputs(data);
    setLoadingStatus('Menganalisis Strategi...');

    try {
      const strategy = await generateContentStrategy(data);
      const categories: ('broll' | 'ugc' | 'commercial')[] = ['broll', 'ugc', 'commercial'];
      
      for (const cat of categories) {
        const rawIdeas = strategy[cat] || [];
        const limit = cat === 'ugc' ? 4 : 2;
        const ideas = rawIdeas.slice(0, limit); 
        
        for (let i = 0; i < ideas.length; i++) {
          setLoadingStatus(`Merender ${cat} visual (${i + 1}/${ideas.length})...`);
          
          try {
            const finalPrompt = buildFinalImagePrompt(ideas[i].text, cat, data);
            const imagesToProvide = [data.productImage, ...data.additionalPhotos];
            
            if (cat === 'ugc' && data.modelStrategy.customModelPhoto) {
               imagesToProvide.push(data.modelStrategy.customModelPhoto);
            }

            const imageUrl = await generateProductImage(finalPrompt, imagesToProvide, data.ratio);
            
            let finalImage = imageUrl;
            if (data.useLogo && data.logo) {
              finalImage = await composeLogo(imageUrl, data.logo);
            }

            setResults(prev => [...prev, {
              id: `${cat}-${Date.now()}-${i}-${Math.random()}`,
              category: cat,
              prompt: ideas[i].text,
              imageUrl: finalImage
            }]);
          } catch (itemError: any) {
            console.error(`Item Error [${cat}]:`, itemError);
            setErrorLog(`Peringatan: Beberapa konten ${cat} dibatasi oleh filter keamanan AI.`);
          }
        }
      }
    } catch (e: any) {
      console.error("Critical Error:", e);
      setErrorLog(e.message || "Gagal memproses strategi konten.");
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleUpdateResult = (id: string, updates: Partial<GenerationResult>) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const generateAudioForResult = async (id: string, scriptText: string, voice: string) => {
    try {
      handleUpdateResult(id, { script: scriptText });
      const url = await generateAudio(scriptText, voice);
      handleUpdateResult(id, { audioUrl: url });
    } catch (e: any) {
      setErrorLog(`Gagal membuat audio: ${e.message}`);
    }
  };

  const filteredResults = results.filter(r => r.category === activeTab);

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      {/* Overlay for mobile sidebar only */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[40] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container: Fixed on mobile, Relative/Push on Desktop */}
      <div 
        className={`fixed lg:relative z-[50] h-full transition-all duration-300 ease-in-out shrink-0 
        ${isSidebarOpen ? 'translate-x-0 w-[85vw] sm:w-[400px] lg:w-[420px]' : '-translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}`}
      >
        <SidebarInput 
          onGenerate={handleGenerate} 
          isLoading={isLoading} 
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
        <header className="h-16 lg:h-20 flex items-center px-4 lg:px-10 border-b border-slate-200 bg-white/80 backdrop-blur-md shrink-0 z-20">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 mr-4 bg-slate-100 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            {isSidebarOpen && window.innerWidth < 1024 ? <LucideX size={20} /> : <LucideSettings2 size={20} />}
          </button>

          <div className="flex-1 flex justify-center lg:justify-start">
            <div className="flex bg-slate-100 p-1 rounded-full gap-0.5 lg:gap-1 overflow-x-auto no-scrollbar">
              {['broll', 'ugc', 'commercial'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`whitespace-nowrap px-4 lg:px-8 py-1.5 lg:py-2 rounded-full text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab === 'broll' ? 'Cinematic' : tab === 'ugc' ? 'UGC' : 'Studio'}
                  <span className="ml-2 opacity-40 font-bold">{results.filter(r => r.category === tab).length}</span>
                </button>
              ))}
            </div>
          </div>
          
          {errorLog && (
            <div className="hidden md:flex ml-auto items-center gap-3 bg-white border border-red-100 px-4 py-2 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2">
              <LucideAlertCircle size={14} className="text-red-500" />
              <p className="text-[10px] font-bold text-red-600 max-w-[150px] truncate">{errorLog}</p>
              <button onClick={() => setErrorLog(null)} className="text-slate-300 hover:text-slate-500"><LucideX size={14} /></button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-3 lg:p-10 custom-scrollbar relative">
          {results.length === 0 && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-xl flex items-center justify-center mb-6">
                <LucideSmile size={32} className="text-indigo-600 lg:hidden" />
                <LucideSmile size={40} className="text-indigo-600 hidden lg:block" />
              </div>
              <h2 className="text-lg lg:text-xl font-black text-slate-800 mb-2 tracking-tight uppercase tracking-tighter">Vantage Creative Lab</h2>
              <p className="text-xs lg:text-sm text-slate-400 font-medium max-w-xs">Mulai kreasikan konten iklan profesional dengan mengupload foto produk di panel kiri.</p>
            </div>
          )}

          {/* Grid changed to grid-cols-2 for mobile with smaller gap */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-8 max-w-[1400px] mx-auto pb-24">
            {filteredResults.map((res) => (
              <ContentCard 
                key={res.id} 
                data={res} 
                inputs={currentInputs!} 
                onGenerateAudio={(script, voice) => generateAudioForResult(res.id, script, voice)}
                onUpdateScript={(script) => handleUpdateResult(res.id, { script })}
              />
            ))}
          </div>
        </div>

        {/* Global Error toast for mobile */}
        {errorLog && (
          <div className="fixed bottom-6 left-6 right-6 md:hidden bg-white border border-red-100 p-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 animate-in slide-in-from-bottom-4">
             <LucideAlertCircle size={18} className="text-red-500 shrink-0" />
             <p className="text-xs font-bold text-red-600 flex-1">{errorLog}</p>
             <button onClick={() => setErrorLog(null)} className="p-1 text-slate-300"><LucideX size={16} /></button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 text-center">
            <div className="w-16 h-16 lg:w-20 lg:h-20 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8" />
            <h3 className="text-xl lg:text-2xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Memproses Konten Pro</h3>
            <div className="px-5 py-2 bg-indigo-50 rounded-full text-[9px] lg:text-[10px] font-black text-indigo-600 uppercase tracking-widest">{loadingStatus}</div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
