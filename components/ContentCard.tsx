
import React, { useState, useEffect } from 'react';
import { 
  LucideDownload, 
  LucideMic, 
  LucidePlay, 
  LucideCopy,
  LucideType,
  LucideCheck,
  LucideVolume2
} from 'lucide-react';
import { GenerationResult, ProductInput } from '../types';
import { ASPECT_RATIOS, VOICES } from '../constants';
import { generateScript } from '../services/geminiService';

interface ContentCardProps {
  data: GenerationResult;
  inputs: ProductInput;
  onGenerateAudio: (script: string, voice: string) => Promise<void>;
  onUpdateScript: (script: string) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ data, inputs, onGenerateAudio, onUpdateScript }) => {
  const [activeTool, setActiveTool] = useState<'voice' | 'copy' | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = data.imageUrl;
    a.download = `VantagePro-${data.category}-${Date.now()}.png`;
    a.click();
  };

  const createScript = async () => {
    setIsGeneratingScript(true);
    try {
      const res = await generateScript(data.prompt, inputs.productInfo, inputs.lang);
      onUpdateScript(res);
      setActiveTool('voice');
    } catch (e) {
      alert("Gagal membuat naskah");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleCreateAudio = async () => {
    if (!data.script) return alert("Buat naskah dulu!");
    setIsGeneratingAudio(true);
    try {
      await onGenerateAudio(data.script, selectedVoice);
    } catch (e) {
      alert("Gagal membuat audio");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col group animate-content hover:shadow-2xl transition-all duration-500">
      <div className={`relative w-full ${ASPECT_RATIOS[inputs.ratio]?.class || 'aspect-square'} bg-slate-100 overflow-hidden`}>
        <img src={data.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        
        <div className="absolute top-2 left-2 lg:top-6 lg:left-6 px-2 lg:px-4 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] lg:text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm border border-white/50">{data.category}</div>
        
        <div className="absolute bottom-2 right-2 lg:bottom-6 lg:right-6 flex gap-1 lg:gap-2 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300">
          <button onClick={handleDownload} className="w-7 h-7 lg:w-12 lg:h-12 bg-indigo-600 text-white rounded-xl lg:rounded-2xl flex items-center justify-center shadow-xl hover:bg-indigo-700 transition-colors">
            <LucideDownload size={14} className="lg:hidden" />
            <LucideDownload size={20} className="hidden lg:block" />
          </button>
        </div>
      </div>

      <div className="p-2 lg:p-6 space-y-2 lg:space-y-6">
        <div className="flex gap-1 lg:gap-2 bg-slate-50 p-1 rounded-xl lg:rounded-[1.5rem]">
          <button 
            onClick={() => setActiveTool(activeTool === 'copy' ? null : 'copy')}
            className={`flex-1 py-2 lg:py-3 rounded-lg lg:rounded-xl flex flex-col items-center gap-0.5 lg:gap-1 transition-all ${activeTool === 'copy' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
          >
            <LucideType size={14} className="lg:hidden" />
            <LucideType size={18} className="hidden lg:block" />
            <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-tighter">Caption</span>
          </button>
          <button 
            onClick={() => setActiveTool(activeTool === 'voice' ? null : 'voice')}
            className={`flex-1 py-2 lg:py-3 rounded-lg lg:rounded-xl flex flex-col items-center gap-0.5 lg:gap-1 transition-all ${activeTool === 'voice' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
          >
            <LucideMic size={14} className="lg:hidden" />
            <LucideMic size={18} className="hidden lg:block" />
            <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-tighter">AI Voice</span>
          </button>
        </div>

        {activeTool === 'copy' && (
          <div className="bg-slate-50/50 rounded-xl p-2 lg:p-4 border border-slate-100 animate-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-center mb-1.5 lg:mb-3">
              <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Prompt</span>
              <button onClick={() => copyToClipboard(data.prompt)} className="p-1 bg-white rounded-md text-indigo-600 shadow-sm">
                <LucideCopy size={12} />
              </button>
            </div>
            <p className="text-[9px] lg:text-[11px] text-slate-500 font-medium leading-tight lg:leading-relaxed italic line-clamp-3">"{data.prompt}"</p>
          </div>
        )}

        {activeTool === 'voice' && (
          <div className="bg-slate-50/50 rounded-xl p-2 lg:p-4 border border-slate-100 space-y-2 lg:space-y-4 animate-in slide-in-from-top-2 duration-300">
             {!data.script ? (
               <button onClick={createScript} disabled={isGeneratingScript} className="w-full py-2.5 lg:py-4 border border-dashed border-indigo-200 rounded-xl text-[8px] lg:text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 transition-all">
                 {isGeneratingScript ? '...' : 'Generate Script'}
               </button>
             ) : (
               <div className="space-y-2 lg:space-y-4">
                  <textarea 
                    value={data.script} 
                    onChange={e => onUpdateScript(e.target.value)}
                    className="w-full p-2 lg:p-4 text-[9px] lg:text-xs font-bold text-slate-600 bg-white rounded-xl border-none h-16 lg:h-24 resize-none shadow-inner focus:ring-1 focus:ring-indigo-200"
                  />
                  {!data.audioUrl ? (
                    <div className="flex gap-1 lg:gap-2">
                      <select 
                        value={selectedVoice} 
                        onChange={e => setSelectedVoice(e.target.value)}
                        className="flex-1 text-[8px] lg:text-[10px] font-black bg-white border border-slate-200 rounded-xl p-1.5 lg:p-3 outline-none focus:border-indigo-500"
                      >
                        {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      <button 
                        onClick={handleCreateAudio} 
                        disabled={isGeneratingAudio}
                        className="w-8 h-8 lg:w-12 lg:h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 shrink-0"
                      >
                        {isGeneratingAudio ? <div className="w-3 h-3 lg:w-5 lg:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LucidePlay size={14} className="lg:hidden" fill="currentColor" />}
                        {isGeneratingAudio ? null : <LucidePlay size={20} className="hidden lg:block" fill="currentColor" />}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white p-2 lg:p-4 rounded-xl flex flex-col items-center gap-1.5 lg:gap-3 border border-indigo-100">
                       <audio src={data.audioUrl} controls className="w-full h-6 lg:h-8" />
                       <button onClick={() => onGenerateAudio(data.script!, selectedVoice)} className="text-[7px] lg:text-[9px] font-black text-indigo-600 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-md">Regen</button>
                    </div>
                  )}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
