
import React, { useState, useEffect } from 'react';
import { 
  LucideDownload, 
  LucideMic, 
  LucidePlay, 
  LucideCopy,
  LucideType,
  LucideAlertCircle,
  LucideVideo,
  LucideFileJson,
  LucideCheck,
  LucideRefreshCcw
} from 'lucide-react';
import { GenerationResult, ProductInput, VideoSpecs, Gender } from '../types';
import { ASPECT_RATIOS, VOICES } from '../constants';
import { generateScript, generateVideoSpecs } from '../services/geminiService';

interface ContentCardProps {
  data: GenerationResult;
  inputs: ProductInput;
  onGenerateAudio: (script: string, voice: string) => Promise<void>;
  onUpdateScript: (script: string) => void;
  onUpdateVideoSpecs: (specs: VideoSpecs) => void;
  onRegenerateImage: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ data, inputs, onGenerateAudio, onUpdateScript, onUpdateVideoSpecs, onRegenerateImage }) => {
  const [activeTool, setActiveTool] = useState<'voice' | 'copy' | 'video' | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-select best voice based on model profile
  useEffect(() => {
    const strategy = inputs.modelStrategy;
    const gender = strategy.gender === Gender.AUTO ? Gender.FEMALE : strategy.gender;
    const age = strategy.age;

    const matchedVoice = VOICES.find(v => 
      v.gender === gender && v.age.includes(age as any)
    ) || VOICES.find(v => v.gender === gender) || VOICES[0];

    setSelectedVoice(matchedVoice.id);
  }, [inputs.modelStrategy]);

  if (data.status === 'loading') {
    return (
      <div className="bg-white rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col animate-pulse">
        <div className={`${ASPECT_RATIOS[inputs.ratio]?.class || 'aspect-square'} bg-slate-100 flex items-center justify-center`}>
           <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-100 rounded-full w-3/4" />
          <div className="h-3 bg-slate-100 rounded-full w-1/2" />
        </div>
      </div>
    );
  }

  if (data.status === 'error') {
    return (
      <div className="bg-red-50 rounded-2xl lg:rounded-[2.5rem] border border-red-100 p-6 flex flex-col items-center justify-center text-center">
        <LucideAlertCircle className="text-red-400 mb-2" size={32} />
        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Gagal Merender</p>
        <p className="text-[9px] text-red-400 mt-1">{data.errorMsg}</p>
        <button onClick={onRegenerateImage} className="mt-4 px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-red-700 transition-all active:scale-95 flex items-center gap-2">
          <LucideRefreshCcw size={14} />
          Coba Lagi
        </button>
      </div>
    );
  }

  const handleCopyJson = () => {
    if (data.videoSpecs) {
      navigator.clipboard.writeText(JSON.stringify(data.videoSpecs, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = data.imageUrl!;
    a.download = `Vantage-UGC-${Date.now()}.png`;
    a.click();
  };

  const handleRegenerateScript = async () => {
    setIsGeneratingScript(true);
    try {
      const s = await generateScript(data.prompt, inputs.productInfo);
      onUpdateScript(s);
    } catch(e) {} finally {
      setIsGeneratingScript(false);
    }
  };

  const handleRegenerateVideoSpecs = async () => {
    setIsGeneratingVideo(true);
    try {
      const v = await generateVideoSpecs(data.prompt, inputs.productInfo, inputs.modelStrategy);
      onUpdateVideoSpecs(v);
    } catch(e) {} finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleRegenerateAudio = async () => {
    setIsGeneratingAudio(true);
    try {
      await onGenerateAudio(data.videoSpecs?.voiceover || data.script!, selectedVoice);
    } catch(e) {} finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col group animate-content hover:shadow-xl transition-all duration-500 relative">
      <div className={`relative w-full ${ASPECT_RATIOS[inputs.ratio]?.class || 'aspect-square'} bg-slate-100 overflow-hidden`}>
        <img src={data.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest shadow-sm z-10">UGC Content</div>
        
        {/* REGENERATE IMAGE BUTTON - Pojok Kanan Atas */}
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={onRegenerateImage} 
            title="Render ulang gambar"
            className="w-10 h-10 bg-white/90 backdrop-blur-md text-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:bg-white transition-all hover:rotate-180 duration-500 active:scale-90"
          >
            <LucideRefreshCcw size={18} />
          </button>
        </div>

        <div className="absolute bottom-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button onClick={handleDownload} className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-indigo-700 transition-colors">
            <LucideDownload size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl lg:rounded-2xl">
          <button onClick={() => setActiveTool(activeTool === 'copy' ? null : 'copy')} className={`flex-1 py-2.5 rounded-lg lg:rounded-xl flex flex-col items-center gap-1 transition-all ${activeTool === 'copy' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
            <LucideType size={16} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Caption</span>
          </button>
          <button onClick={() => setActiveTool(activeTool === 'video' ? null : 'video')} className={`flex-1 py-2.5 rounded-lg lg:rounded-xl flex flex-col items-center gap-1 transition-all ${activeTool === 'video' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
            <LucideVideo size={16} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Video Sync</span>
          </button>
          <button onClick={() => setActiveTool(activeTool === 'voice' ? null : 'voice')} className={`flex-1 py-2.5 rounded-lg lg:rounded-xl flex flex-col items-center gap-1 transition-all ${activeTool === 'voice' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
            <LucideMic size={16} />
            <span className="text-[8px] font-black uppercase tracking-tighter">AI Voice</span>
          </button>
        </div>

        {activeTool === 'copy' && (
          <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 animate-in slide-in-from-top-2 duration-300 space-y-3">
             {!data.script ? (
               <button onClick={handleRegenerateScript} disabled={isGeneratingScript} className="w-full py-3 border border-dashed border-indigo-200 rounded-xl text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 transition-all">
                 {isGeneratingScript ? 'Menulis...' : 'Buat Caption'}
               </button>
             ) : (
               <>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Caption Affiliate</span>
                    <div className="flex gap-1.5">
                      <button onClick={handleRegenerateScript} disabled={isGeneratingScript} title="Regenerate Caption" className="p-1.5 bg-white rounded-md text-indigo-600 shadow-sm hover:bg-indigo-50 disabled:opacity-50 transition-all active:scale-90">
                        <LucideRefreshCcw size={12} className={isGeneratingScript ? 'animate-spin' : ''} />
                      </button>
                      <button onClick={() => navigator.clipboard.writeText(data.script!)} className="p-1.5 bg-white rounded-md text-indigo-600 shadow-sm hover:bg-indigo-50"><LucideCopy size={12} /></button>
                    </div>
                  </div>
                  <textarea value={data.script} onChange={e => onUpdateScript(e.target.value)} className="w-full p-3 text-[10px] font-bold text-slate-600 bg-white rounded-xl border-none h-20 resize-none shadow-inner focus:ring-1 focus:ring-indigo-200" />
               </>
             )}
          </div>
        )}

        {activeTool === 'video' && (
          <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 animate-in slide-in-from-top-2 duration-300 space-y-3">
             {!data.videoSpecs ? (
               <button onClick={handleRegenerateVideoSpecs} disabled={isGeneratingVideo} className="w-full py-3 border border-dashed border-indigo-200 rounded-xl text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 transition-all">
                 {isGeneratingVideo ? 'Menganalisis...' : 'Generate Video Prompt'}
               </button>
             ) : (
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Video JSON Package</span>
                    <div className="flex gap-1.5">
                      <button onClick={handleRegenerateVideoSpecs} disabled={isGeneratingVideo} title="Regenerate Video Sync" className="p-1.5 bg-white rounded-md text-indigo-600 shadow-sm hover:bg-indigo-50 disabled:opacity-50 transition-all active:scale-90">
                        <LucideRefreshCcw size={12} className={isGeneratingVideo ? 'animate-spin' : ''} />
                      </button>
                      <button onClick={handleCopyJson} className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md text-indigo-600 shadow-sm text-[9px] font-black uppercase transition-all active:scale-95">
                        {copied ? <LucideCheck size={12} /> : <LucideFileJson size={12} />}
                        {copied ? 'Copied' : 'Copy JSON'}
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl overflow-hidden">
                    <pre className="text-[9px] text-indigo-300 font-mono overflow-x-auto custom-scrollbar">
                      {JSON.stringify(data.videoSpecs, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visual Instruction</p>
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{data.videoSpecs.video_prompt}</p>
                  </div>
               </div>
             )}
          </div>
        )}

        {activeTool === 'voice' && (
          <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-3 animate-in slide-in-from-top-2 duration-300">
             {!data.videoSpecs?.voiceover && !data.script ? (
                <p className="text-[9px] text-slate-400 font-bold text-center py-4">Generate Caption atau Video Prompt terlebih dahulu.</p>
             ) : (
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Naskah Suara</span>
                    {data.audioUrl && (
                      <button onClick={handleRegenerateAudio} disabled={isGeneratingAudio} title="Regenerate Audio" className="p-1.5 bg-white rounded-md text-indigo-600 shadow-sm hover:bg-indigo-50 disabled:opacity-50 transition-all active:scale-90">
                        <LucideRefreshCcw size={12} className={isGeneratingAudio ? 'animate-spin' : ''} />
                      </button>
                    )}
                  </div>
                  <textarea 
                    value={data.videoSpecs?.voiceover || data.script} 
                    onChange={e => {
                      if (data.videoSpecs) onUpdateVideoSpecs({...data.videoSpecs, voiceover: e.target.value});
                      else onUpdateScript(e.target.value);
                    }} 
                    className="w-full p-3 text-[10px] font-bold text-slate-600 bg-white rounded-xl border-none h-20 resize-none shadow-inner focus:ring-1 focus:ring-indigo-200" 
                  />
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Karakter Suara</label>
                        <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)} className="w-full text-[9px] font-black bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 shadow-sm">
                          {VOICES.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.name} ({v.tone} - {v.gender === 'male' ? 'Pria' : 'Wanita'})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <label className="text-[8px] font-black text-slate-400 uppercase text-center">Action</label>
                        <button onClick={handleRegenerateAudio} disabled={isGeneratingAudio} className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-700 shrink-0 transition-all active:scale-90">
                          {isGeneratingAudio ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LucidePlay size={18} fill="currentColor" />}
                        </button>
                      </div>
                    </div>

                    {data.audioUrl && (
                      <div className="bg-white p-2 rounded-xl border border-indigo-100 animate-in fade-in duration-300">
                         <audio src={data.audioUrl} controls className="w-full h-8" />
                      </div>
                    )}
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
