
import React, { useState } from 'react';
import SidebarInput from './components/SidebarInput';
import ContentCard from './components/ContentCard';
import { ContentIdea, GenerationResult, ProductInput } from './types';
import { generateContentStrategy, generateProductImage, rewritePrompt } from './services/geminiService';
import { buildFinalImagePrompt } from './utils/promptGenerator';
import { composeLogo } from './utils/imageUtils';
import { 
  LucideImage, 
  LucideChevronRight, 
  LucideX, 
  LucideSparkles, 
  LucideLayoutGrid,
  LucideWand 
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broll' | 'ugc' | 'commercial'>('broll');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [currentInputs, setCurrentInputs] = useState<ProductInput | null>(null);
  
  // Regeneration state
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenTargetId, setRegenTargetId] = useState<string | null>(null);
  const [regenStyle, setRegenStyle] = useState('');

  const handleGenerate = async (data: ProductInput) => {
    setIsLoading(true);
    setResults([]);
    setCurrentInputs(data);
    setLoadingStatus('Architecting content strategy...');

    try {
      const strategy = await generateContentStrategy(data);
      setLoadingStatus('Generating high-fidelity visuals...');

      const categories: ('broll' | 'ugc' | 'commercial')[] = ['broll', 'ugc', 'commercial'];
      
      for (const cat of categories) {
        const ideas: ContentIdea[] = strategy[cat] || [];
        for (let i = 0; i < ideas.length; i++) {
          const idea = ideas[i];
          setLoadingStatus(`Rendering ${cat} asset (${i + 1}/${ideas.length})...`);
          
          const finalPrompt = buildFinalImagePrompt(idea.text, cat, data);
          
          const imagesToProvide = [data.productImage];
          if (cat === 'ugc' && data.modelStrategy.photos) {
            data.modelStrategy.photos.forEach(p => imagesToProvide.push(p.b64));
          }
          data.additionalPhotos.forEach(p => imagesToProvide.push(p.b64));

          let imageUrl = await generateProductImage(finalPrompt, imagesToProvide, data.ratio);
          
          if (data.useLogo && data.logo) {
            imageUrl = await composeLogo(imageUrl, data.logo);
          }

          const newResult: GenerationResult = {
            id: `${cat}-${Date.now()}-${i}`,
            category: cat,
            prompt: idea.text,
            imageUrl
          };
          
          setResults(prev => [...prev, newResult]);
        }
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const startRegenerate = (id: string) => {
    setRegenTargetId(id);
    setIsRegenerating(true);
  };

  const processRegeneration = async () => {
    if (!regenTargetId || !regenStyle || !currentInputs) return;
    
    const target = results.find(r => r.id === regenTargetId);
    if (!target) return;

    setIsLoading(true);
    setLoadingStatus('Redefining visual style...');
    
    try {
      const newPromptText = await rewritePrompt(target.prompt, regenStyle);
      const finalPrompt = buildFinalImagePrompt(newPromptText, target.category, currentInputs);
      
      const imagesToProvide = [currentInputs.productImage];
      if (target.category === 'ugc' && currentInputs.modelStrategy.photos) {
        currentInputs.modelStrategy.photos.forEach(p => imagesToProvide.push(p.b64));
      }
      currentInputs.additionalPhotos.forEach(p => imagesToProvide.push(p.b64));

      let imageUrl = await generateProductImage(finalPrompt, imagesToProvide, currentInputs.ratio);
      
      if (currentInputs.useLogo && currentInputs.logo) {
        imageUrl = await composeLogo(imageUrl, currentInputs.logo);
      }

      setResults(prev => prev.map(r => r.id === regenTargetId ? { ...r, imageUrl, prompt: newPromptText } : r));
      setIsRegenerating(false);
      setRegenTargetId(null);
      setRegenStyle('');
    } catch (e: any) {
      alert("Regenerate gagal: " + e.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const filteredResults = results.filter(r => r.category === activeTab);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <SidebarInput onGenerate={handleGenerate} isLoading={isLoading} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Modern Top Header Navigation */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 shrink-0 z-20">
          <div className="flex items-center gap-8 h-full">
            {['broll', 'ugc', 'commercial'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative flex items-center gap-2 h-full px-2 text-[11px] font-extrabold uppercase tracking-widest transition-all ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <span>{tab} Assets</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] ${activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  {results.filter(r => r.category === tab).length}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500">
                <LucideLayoutGrid size={14} />
                Workspace
             </div>
          </div>
        </header>

        {/* Gallery Area */}
        <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar bg-slate-50/50">
          {results.length === 0 && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 border border-slate-50">
                <LucideSparkles size={36} className="text-indigo-600 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-extrabold text-slate-800">Your Creative Studio is Empty</h2>
                <p className="text-sm text-slate-400 font-medium max-w-[300px] mx-auto">Upload your product and let Vantage AI build high-converting marketing assets for you.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
            {filteredResults.map((res) => (
              <ContentCard 
                key={res.id} 
                data={res} 
                inputs={currentInputs!} 
                onRegenerate={startRegenerate}
              />
            ))}
          </div>
        </div>

        {/* Production Loader Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8" />
                <LucideSparkles size={24} className="text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-16px]" />
            </div>
            <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Production Hub</h3>
                <p className="text-sm font-bold text-indigo-500 mt-2 uppercase tracking-widest">{loadingStatus}</p>
                <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                </div>
            </div>
          </div>
        )}

        {/* Modal: Variant Regeneration */}
        {isRegenerating && (
          <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300 relative">
              <button onClick={() => setIsRegenerating(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"><LucideX size={24} /></button>
              
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                    <LucideWand size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Custom Variant</h3>
                <p className="text-sm text-slate-400 font-medium">Re-imagine this asset with a specific artistic direction.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Visual Style / Theme</label>
                  <input 
                    type="text" 
                    value={regenStyle}
                    onChange={e => setRegenStyle(e.target.value)}
                    placeholder="e.g. Midnight City, Sunlight Glow, Soft Pastels..."
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold transition-all shadow-inner"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    {['Cinematic', 'Minimalist', 'High-Key', 'Moody'].map(style => (
                        <button key={style} onClick={() => setRegenStyle(style)} className="py-2.5 px-4 bg-slate-50 rounded-xl text-[10px] font-extrabold text-slate-500 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all uppercase tracking-tight">{style}</button>
                    ))}
                </div>

                <button 
                  onClick={processRegeneration}
                  className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <span className="tracking-widest uppercase text-xs">Execute Rendering</span>
                  <LucideChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
