
import React, { useState } from 'react';
import { 
  LucideUpload, 
  LucidePlus, 
  LucideTrash, 
  LucideSparkles, 
  LucideChevronDown, 
  LucideChevronUp,
  LucideX,
  LucideInfo,
  LucidePackage,
  LucideUsers,
  LucideSettings
} from 'lucide-react';
import { AgeGroup, Gender, ModelMode, ModelStrategy, ProductInput } from '../types';
import { compressImage } from '../utils/imageUtils';

interface SidebarInputProps {
  onGenerate: (data: ProductInput) => void;
  isLoading: boolean;
}

const SidebarInput: React.FC<SidebarInputProps> = ({ onGenerate, isLoading }) => {
  const [openSection, setOpenSection] = useState<string | null>('product');
  
  // State for form
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState('');
  const [adType, setAdType] = useState('softselling');
  const [ratio, setRatio] = useState('9:16');
  const [lang, setLang] = useState('Indonesia');
  const [pose, setPose] = useState('');
  const [modelMode, setModelMode] = useState<ModelMode>(ModelMode.AI);
  const [aiGender, setAiGender] = useState<Gender>(Gender.AUTO);
  const [aiAge, setAiAge] = useState<AgeGroup>(AgeGroup.ADULT);
  const [aiHijab, setAiHijab] = useState(false);
  const [modelPhotos, setModelPhotos] = useState<{ id: string; b64: string }[]>([]);
  const [additionalPhotos, setAdditionalPhotos] = useState<{ id: string; b64: string; desc: string }[]>([]);
  const [useLogo, setUseLogo] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleProductUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await compressImage(e.target.files[0]);
      setProductImage(b64);
    }
  };

  const handleAddModelPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await compressImage(e.target.files[0]);
      setModelPhotos(prev => [...prev, { id: Math.random().toString(), b64 }]);
    }
  };

  const handleAddAdditionalPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await compressImage(e.target.files[0]);
      setAdditionalPhotos(prev => [...prev, { id: Math.random().toString(), b64, desc: '' }]);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await compressImage(e.target.files[0]);
      setLogo(b64);
    }
  };

  const submit = () => {
    if (!productImage) return alert('Silakan upload foto produk utama terlebih dahulu.');
    
    const strategy: ModelStrategy = {
      type: modelMode,
      gender: aiGender,
      age: aiAge,
      hijab: aiHijab,
      photos: modelMode === ModelMode.UPLOAD ? modelPhotos : []
    };

    onGenerate({
      productImage,
      productInfo,
      adType,
      ratio,
      lang,
      accent: '',
      pose,
      modelStrategy: strategy,
      useLogo,
      logo: logo || undefined,
      additionalPhotos
    });
  };

  const SectionHeader = ({ id, icon: Icon, title, desc }: { id: string, icon: any, title: string, desc: string }) => (
    <div 
      className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 ${openSection === id ? 'bg-slate-50/50' : ''}`}
      onClick={() => toggleSection(id)}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${openSection === id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{desc}</p>
        </div>
      </div>
      {openSection === id ? <LucideChevronUp size={16} className="text-slate-400" /> : <LucideChevronDown size={16} className="text-slate-400" />}
    </div>
  );

  return (
    <aside className="w-full md:w-[380px] bg-white border-r border-slate-200 h-full flex flex-col overflow-hidden shadow-2xl relative z-30">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <LucideSparkles size={18} />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Vantage<span className="text-indigo-600">AI</span></h1>
        </div>
        <p className="text-[11px] text-slate-400 font-medium leading-tight">Advanced Creative Suite for Digital Assets</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {/* Section 1: Product */}
        <SectionHeader id="product" icon={LucidePackage} title="Produk Utama" desc="Upload & Info Produk" />
        {openSection === 'product' && (
          <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:border-indigo-300 transition-all text-center">
              <input type="file" onChange={handleProductUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {!productImage ? (
                <div className="py-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <LucideUpload size={24} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Klik untuk upload foto utama</span>
                </div>
              ) : (
                <div className="relative group/preview">
                  <img src={productImage} alt="Main Product" className="max-h-48 w-full object-contain rounded-xl" />
                  <button onClick={(e) => { e.stopPropagation(); setProductImage(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/preview:opacity-100 transition-opacity">
                    <LucideX size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Foto Pendukung</label>
                <LucideInfo size={12} className="text-slate-300" />
              </div>
              <div className="flex flex-wrap gap-2">
                {additionalPhotos.map(p => (
                  <div key={p.id} className="relative w-14 h-14 border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                    <img src={p.b64} className="w-full h-full object-cover" />
                    <button onClick={() => setAdditionalPhotos(prev => prev.filter(item => item.id !== p.id))} className="absolute top-0 right-0 bg-slate-900/40 text-white p-0.5"><LucideX size={10} /></button>
                  </div>
                ))}
                <label className="w-14 h-14 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 cursor-pointer rounded-xl hover:border-indigo-400 hover:text-indigo-400 transition-colors">
                  <input type="file" onChange={handleAddAdditionalPhoto} className="hidden" />
                  <LucidePlus size={20} />
                </label>
              </div>
            </div>

            <textarea 
              value={productInfo}
              onChange={e => setProductInfo(e.target.value)}
              className="w-full p-4 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-400" 
              rows={4} 
              placeholder="Jelaskan detail produk (bahan, fitur unik, USP)..."
            />
          </div>
        )}

        {/* Section 2: Talent */}
        <SectionHeader id="talent" icon={LucideUsers} title="Strategi Talent" desc="AI Model & Karakter" />
        {openSection === 'talent' && (
          <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button onClick={() => setModelMode(ModelMode.AI)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${modelMode === ModelMode.AI ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>AI Model</button>
              <button onClick={() => setModelMode(ModelMode.UPLOAD)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${modelMode === ModelMode.UPLOAD ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Ref. Photo</button>
            </div>

            {modelMode === ModelMode.AI ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Gender</label>
                  <select value={aiGender} onChange={e => setAiGender(e.target.value as Gender)} className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value={Gender.AUTO}>Auto Detect</option>
                    <option value={Gender.FEMALE}>Female</option>
                    <option value={Gender.MALE}>Male</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Age Group</label>
                  <select value={aiAge} onChange={e => setAiAge(e.target.value as AgeGroup)} className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    {Object.values(AgeGroup).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <label htmlFor="hijab" className="text-xs font-semibold text-slate-600">Model with Hijab?</label>
                  <input type="checkbox" checked={aiHijab} onChange={e => setAiHijab(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" id="hijab" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Model Reference</label>
                <div className="flex flex-wrap gap-2">
                   {modelPhotos.map(p => (
                    <div key={p.id} className="relative w-16 h-16 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <img src={p.b64} className="w-full h-full object-cover" />
                      <button onClick={() => setModelPhotos(prev => prev.filter(item => item.id !== p.id))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><LucideX size={10} /></button>
                    </div>
                  ))}
                  <label className="w-16 h-16 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 cursor-pointer rounded-xl hover:border-indigo-400 transition-colors">
                    <input type="file" onChange={handleAddModelPhoto} className="hidden" />
                    <LucidePlus size={20} />
                  </label>
                </div>
              </div>
            )}
            <input 
              value={pose}
              onChange={e => setPose(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="Model action/pose (e.g. Smiling, holding product...)"
            />
          </div>
        )}

        {/* Section 3: Settings */}
        <SectionHeader id="settings" icon={LucideSettings} title="Produksi" desc="Output & Branding" />
        {openSection === 'settings' && (
          <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ratio</label>
                <select value={ratio} onChange={e => setRatio(e.target.value)} className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="9:16">9:16 (Vertical)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:5">4:5 (Portrait)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Language</label>
                <select value={lang} onChange={e => setLang(e.target.value)} className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="Indonesia">Indonesian</option>
                  <option value="English">English</option>
                  <option value="Malaysia">Malay</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label htmlFor="logoToggle" className="text-xs font-semibold text-slate-600">Overlay Brand Logo?</label>
                <input type="checkbox" checked={useLogo} onChange={e => setUseLogo(e.target.checked)} id="logoToggle" className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
              </div>
              
              {useLogo && (
                <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-white text-center">
                  {!logo ? (
                    <label className="text-[11px] text-indigo-600 cursor-pointer font-bold flex items-center justify-center gap-1">
                      <input type="file" onChange={handleLogoUpload} className="hidden" />
                      <LucideUpload size={14} /> Upload PNG Logo
                    </label>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <img src={logo} className="h-6 object-contain" />
                      <button onClick={() => setLogo(null)} className="text-slate-400 hover:text-red-500 transition-colors"><LucideTrash size={14} /></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-slate-100 bg-white">
        <button 
          onClick={submit}
          disabled={isLoading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transform transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="tracking-wide">GENERATE ASSETS</span>
              <LucideSparkles size={18} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default SidebarInput;
