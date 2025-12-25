
import React, { useState } from 'react';
import { 
  LucideWand, 
  LucideDownload, 
  LucideMic, 
  LucideFileText, 
  LucideVideo, 
  LucidePlay, 
  LucideCopy,
  LucideChevronRight,
  LucideType
} from 'lucide-react';
import { GenerationResult, ProductInput } from '../types';
import { ASPECT_RATIOS, VOICES } from '../constants';
import { generateAudio, generateScript } from '../services/geminiService';

interface ContentCardProps {
  data: GenerationResult;
  inputs: ProductInput;
  onRegenerate: (id: string) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ data, inputs, onRegenerate }) => {
  const [activeTool, setActiveTool] = useState<'motion' | 'voice' | 'copy' | null>(null);
  const [script, setScript] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = data.imageUrl;
    a.download = `VantageAI-${data.category}-${Date.now()}.png`;
    a.click();
  };

  const createScript = async () => {
    setIsGeneratingScript(true);
    try {
      const res = await generateScript(data.prompt, inputs.productInfo, inputs.lang);
      setScript(res);
    } catch (e) {
      alert("Gagal membuat naskah");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const createAudio = async () => {
    if (!script) return alert("Buat naskah dulu!");
    setIsGeneratingAudio(true);
    try {
      const url = await generateAudio(script, selectedVoice);
      setAudioUrl(url);
    } catch (e) {
      alert("Gagal membuat audio");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-all group animate-content">
      {/* Media Preview Section */}
      <div className={`relative w-full ${ASPECT_RATIOS[inputs.ratio]?.class || 'aspect-square'} bg-slate-50 overflow-hidden`}>
        <img src={data.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Generated" />
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold text-indigo-600 shadow-sm uppercase tracking-widest">{data.category}</span>
        </div>

        {/* Hover Controls */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button 
            onClick={() => onRegenerate(data.id)} 
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-800 hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110"
            title="Regenerate"
          >
            <LucideWand size={20} />
          </button>
          <button 
            onClick={handleDownload} 
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-800 hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-110"
            title="Download"
          >
            <LucideDownload size={20} />
          </button>
        </div>
      </div>

      {/* Workspace Panel */}
      <div className="p-4 flex flex-col gap-3">
        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl">
          <button 
            onClick={() => setActiveTool(activeTool === 'copy' ? null : 'copy')} 
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${activeTool === 'copy' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LucideType size={16} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Caption</span>
          </button>
          <button 
            onClick={() => setActiveTool(activeTool === 'voice' ? null : 'voice')} 
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${activeTool === 'voice' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LucideMic size={16} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Audio</span>
          </button>
          <button 
            onClick={() => setActiveTool(activeTool === 'motion' ? null : 'motion')} 
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${activeTool === 'motion' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LucideVideo size={16} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Motion</span>
          </button>
        </div>

        {/* Dynamic Tool Content */}
        {activeTool && (
          <div className="space-y-3 pt-2 animate-in slide-in-from-top-1">
            {activeTool === 'voice' && (
              <div className="space-y-3 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase">Production Script</h4>
                  <button onClick={createScript} disabled={isGeneratingScript} className="text-[10px] text-indigo-600 font-bold hover:underline">
                    {isGeneratingScript ? 'Writing...' : 'Regenerate Script'}
                  </button>
                </div>
                <div className="relative group">
                  <textarea 
                    value={script} 
                    onChange={e => setScript(e.target.value)}
                    className="w-full p-3 text-[11px] border-none rounded-xl bg-white h-24 outline-none resize-none font-medium text-slate-600 shadow-inner" 
                    placeholder="Enter script for VO..."
                  />
                  <button onClick={() => copyToClipboard(script)} className="absolute top-2 right-2 p-1.5 bg-slate-100 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <LucideCopy size={12} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={selectedVoice} 
                    onChange={e => setSelectedVoice(e.target.value)}
                    className="flex-1 text-[11px] font-semibold bg-white border border-slate-100 rounded-xl p-2 outline-none"
                  >
                    {VOICES.map(v => <option key={v.id} value={v.id}>{v.name} ({v.tone})</option>)}
                  </select>
                  <button onClick={createAudio} disabled={isGeneratingAudio} className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                     {isGeneratingAudio ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LucidePlay size={16} fill="white" />}
                  </button>
                </div>
                {audioUrl && (
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <audio controls src={audioUrl} className="w-full h-8" />
                  </div>
                )}
              </div>
            )}

            {activeTool === 'copy' && (
               <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                 <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hook Idea</h4>
                   <button onClick={() => copyToClipboard(data.prompt)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><LucideCopy size={14} /></button>
                 </div>
                 <p className="text-[11px] leading-relaxed text-slate-600 font-medium italic border-l-2 border-indigo-200 pl-3">
                   "{data.prompt.length > 120 ? data.prompt.substring(0, 120) + '...' : data.prompt}"
                 </p>
               </div>
            )}

            {activeTool === 'motion' && (
               <div className="space-y-3 bg-slate-900 rounded-2xl p-4 text-white">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase">Camera Path</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-[10px]">
                      <LucideChevronRight size={10} className="text-indigo-400" />
                      <span><b>Movement:</b> Slow zoom towards product focal point</span>
                    </li>
                    <li className="flex items-center gap-2 text-[10px]">
                      <LucideChevronRight size={10} className="text-indigo-400" />
                      <span><b>Dynamics:</b> 2.4s duration, soft easing</span>
                    </li>
                  </ul>
                  <button className="w-full py-2 bg-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-500 transition-colors">Apply Motion Preset</button>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
