
import React, { useState } from 'react';
import { 
  LucideUpload, 
  LucideX, 
  LucideSparkles, 
  LucideChevronRight, 
  LucideChevronLeft,
  LucideUsers,
  LucideCheck,
  LucideImagePlus,
  LucideUserPlus,
  LucideShieldCheck,
  LucideInfo
} from 'lucide-react';
import { AgeGroup, Gender, ModelMode, ModelStrategy, ProductInput } from '../types';
import { compressImage } from '../utils/imageUtils';

interface SidebarInputProps {
  onGenerate: (data: ProductInput) => void;
  isLoading: boolean;
  onClose: () => void;
}

const SidebarInput: React.FC<SidebarInputProps> = ({ onGenerate, isLoading, onClose }) => {
  const [step, setStep] = useState(1);
  
  const [productImage, setProductImage] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [productInfo, setProductInfo] = useState('');
  const [adType, setAdType] = useState('softselling');
  const [ratio, setRatio] = useState('9:16');
  const [lang, setLang] = useState('Indonesia');
  const [modelMode, setModelMode] = useState<ModelMode>(ModelMode.AI);
  const [customModelPhoto, setCustomModelPhoto] = useState<string | null>(null);
  const [aiGender, setAiGender] = useState<Gender>(Gender.FEMALE);
  const [aiAge, setAiAge] = useState<AgeGroup>(AgeGroup.ADULT);
  const [aiHijab, setAiHijab] = useState(false);
  const [useLogo, setUseLogo] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const b64 = await compressImage(e.target.files[0]);
      setProductImage(b64);
    }
  };

  const handleAdditionalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && additionalPhotos.length < 3) {
      const b64 = await compressImage(e.target.files[0]);
      setAdditionalPhotos(prev => [...prev, b64]);
    }
  };

  const handleCustomModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const b64 = await compressImage(e.target.files[0]);
      setCustomModelPhoto(b64);
    }
  };

  const submit = () => {
    onGenerate({
      productImage: productImage!,
      additionalPhotos,
      productInfo,
      adType,
      ratio,
      lang,
      accent: '',
      pose: '',
      modelStrategy: {
        type: modelMode,
        gender: aiGender,
        age: aiAge,
        hijab: aiHijab,
        customModelPhoto: customModelPhoto || undefined
      },
      useLogo,
      logo: logo || undefined
    });
  };

  return (
    <aside className="w-full bg-white border-r border-slate-200 h-full flex flex-col shadow-2xl relative overflow-hidden">
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 z-10"
      >
        <LucideX size={18} />
      </button>

      <div className="p-6 lg:p-8 border-b border-slate-100 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-indigo-100">
          <LucideSparkles size={24} />
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-black text-slate-900 tracking-tighter leading-none">Vantage<span className="text-indigo-600">Pro</span></h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Creative AI Studio</p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-4 bg-slate-50/50 flex items-center gap-3 shrink-0">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex-1 flex items-center gap-2">
            <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-2 border-slate-200 text-slate-300'}`}>
              {step > i ? <LucideCheck size={16} /> : i}
            </div>
            {i < 3 && <div className={`flex-1 h-1 rounded-full ${step > i ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 custom-scrollbar">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-black text-slate-800 mb-1 tracking-tight">Referensi Produk</h2>
            <p className="text-xs text-slate-400 font-medium mb-6">Gunakan foto beresolusi tinggi untuk hasil maksimal.</p>
            
            <div className="space-y-6">
               <div className="relative aspect-video bg-slate-100 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center overflow-hidden hover:border-indigo-400 transition-all cursor-pointer group">
                  <input type="file" onChange={handleMainUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {productImage ? (
                    <img src={productImage} className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-center p-6">
                       <LucideUpload className="mx-auto text-slate-300 mb-2 group-hover:text-indigo-500 transition-colors" size={32} />
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload Foto Utama</p>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-3 gap-3">
                  {additionalPhotos.map((img, idx) => (
                    <div key={idx} className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden group border border-slate-200">
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={() => setAdditionalPhotos(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                        <LucideX size={12} />
                      </button>
                    </div>
                  ))}
                  {additionalPhotos.length < 3 && (
                    <label className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                      <input type="file" onChange={handleAdditionalUpload} className="hidden" />
                      <LucideImagePlus size={20} className="text-slate-300 group-hover:text-indigo-400" />
                      <span className="text-[9px] font-black text-slate-400 mt-1 uppercase">Extra</span>
                    </label>
                  )}
               </div>

               <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <LucideInfo size={12} /> Deskripsi Visual
                 </label>
                 <textarea 
                    value={productInfo}
                    onChange={e => setProductInfo(e.target.value)}
                    className="w-full p-4 text-xs font-bold text-slate-600 bg-slate-100 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 h-28 resize-none shadow-inner placeholder:text-slate-300"
                    placeholder="Warna, tekstur, detail penting..."
                 />
               </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-black text-slate-800 mb-6 tracking-tight">Model & Talent</h2>
            
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
               <button onClick={() => setModelMode(ModelMode.AI)} className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${modelMode === ModelMode.AI ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>AI TALENT</button>
               <button onClick={() => setModelMode(ModelMode.UPLOAD)} className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${modelMode === ModelMode.UPLOAD ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>CUSTOM</button>
            </div>

            {modelMode === ModelMode.AI ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setAiGender(Gender.FEMALE)} className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${aiGender === Gender.FEMALE ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                      <LucideUsers size={24} />
                      <span className="text-[10px] font-black uppercase">Wanita</span>
                   </button>
                   <button onClick={() => setAiGender(Gender.MALE)} className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${aiGender === Gender.MALE ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                      <LucideUsers size={24} />
                      <span className="text-[10px] font-black uppercase">Pria</span>
                   </button>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Usia</label>
                      <div className="grid grid-cols-2 gap-2">
                          {Object.values(AgeGroup).map(a => (
                            <button key={a} onClick={() => setAiAge(a)} className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all ${aiAge === a ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>{a}</button>
                          ))}
                      </div>
                   </div>

                   {aiGender === Gender.FEMALE && (
                      <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <LucideShieldCheck size={20} className="text-indigo-600" />
                           <span className="text-xs font-black text-slate-700 uppercase">Gunakan Hijab</span>
                         </div>
                         <button 
                            onClick={() => setAiHijab(!aiHijab)} 
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${aiHijab ? 'bg-indigo-600' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${aiHijab ? 'left-7' : 'left-1'}`} />
                         </button>
                      </div>
                   )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center overflow-hidden hover:border-indigo-400 transition-all cursor-pointer group">
                  <input type="file" onChange={handleCustomModelUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {customModelPhoto ? (
                    <img src={customModelPhoto} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-8">
                       <LucideUserPlus className="mx-auto text-slate-300 mb-3 group-hover:text-indigo-500 transition-colors" size={40} />
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">Pilih Referensi Wajah Model</p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Pastikan wajah model terlihat jelas dan menghadap kamera.</p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-black text-slate-800 mb-6 tracking-tight">Format Media</h2>
            
            <div className="space-y-6">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ukuran Layar</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {[
                       { id: '9:16', label: '9:16 Portrait', desc: 'TikTok / Reels' },
                       { id: '1:1', label: '1:1 Square', desc: 'Post / Ads' },
                       { id: '4:5', label: '4:5 Portrait', desc: 'Feed / Meta' },
                       { id: '16:9', label: '16:9 Landscape', desc: 'YouTube / Ads' },
                     ].map(r => (
                       <button 
                        key={r.id} 
                        onClick={() => setRatio(r.id)}
                        className={`p-5 rounded-3xl border-2 text-left transition-all ${ratio === r.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                       >
                         <p className={`text-[11px] font-black uppercase tracking-wider ${ratio === r.id ? 'text-indigo-600' : 'text-slate-800'}`}>{r.label}</p>
                         <p className="text-[9px] text-slate-400 font-bold mt-1">{r.desc}</p>
                       </button>
                     ))}
                  </div>
               </div>

               <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LucideCheck size={18} className="text-indigo-600" />
                    <span className="text-xs font-black text-slate-700 uppercase">Bahasa: {lang}</span>
                  </div>
                  <select 
                    value={lang} 
                    onChange={e => setLang(e.target.value)}
                    className="bg-transparent text-[10px] font-black text-indigo-600 border-none outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="Indonesia">INDONESIA</option>
                    <option value="English">ENGLISH</option>
                  </select>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 lg:p-8 border-t border-slate-100 flex gap-3 bg-white shrink-0">
        {step > 1 && (
          <button onClick={() => setStep(step-1)} className="p-4 lg:p-5 bg-slate-100 text-slate-500 rounded-3xl hover:bg-slate-200 transition-all">
            <LucideChevronLeft size={22} />
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => { if(step===1 && !productImage) return alert("Pilih foto produk dulu!"); setStep(step+1); }} className="flex-1 py-4 lg:py-5 bg-slate-900 text-white font-black text-xs lg:text-sm rounded-3xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
            <span>Next</span>
            <LucideChevronRight size={18} />
          </button>
        ) : (
          <button onClick={submit} disabled={isLoading} className="flex-1 py-4 lg:py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black text-xs lg:text-sm rounded-3xl shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
            {isLoading ? <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Render Content</span><LucideSparkles size={18} /></>}
          </button>
        )}
      </div>
    </aside>
  );
};

export default SidebarInput;
