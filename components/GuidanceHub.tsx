
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const GuidanceHub: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: { title: string; uri: string }[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize clinical guidance for: "${query}". Focus on UK standards like NICE, CKS, and SIGN.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "I couldn't find definitive guidance for that query.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const sources = chunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title || "Clinical Source",
          uri: chunk.web.uri
        }));

      setResult({ text, sources });
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const clinicalResources = [
    { name: "NICE CKS", desc: "Common primary care conditions", url: "https://cks.nice.org.uk/", icon: "fa-stethoscope", color: "bg-emerald-50 text-emerald-600" },
    { name: "GP Notebook", desc: "Fast clinical reference", url: "https://gpnotebook.com/", icon: "fa-book-medical", color: "bg-blue-50 text-blue-600" },
    { name: "Patient.info Pro", desc: "Professional resource hub", url: "https://patient.info/pro", icon: "fa-user-md", color: "bg-purple-50 text-purple-600" },
    { name: "BMJ Best Practice", desc: "Evidence-based pathways", url: "https://bestpractice.bmj.com/", icon: "fa-microscope", color: "bg-slate-50 text-slate-600" }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-12">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF5C35] mb-2">Clinical Reference</h2>
        <h1 className="text-5xl font-black tracking-tighter text-slate-900">Guidance Hub</h1>
        <p className="mt-4 text-slate-500 max-w-2xl font-medium">
          Search verified clinical standards or access quick-reference tools for GP consultations.
        </p>
      </div>

      {/* AI Clinical Search */}
      <div className="bg-black rounded-[40px] p-10 mb-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5C35] rounded-full blur-[120px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        
        <form onSubmit={handleSearch} className="relative z-10">
          <label className="block text-white/50 text-xs font-black uppercase tracking-widest mb-4">Search Guidelines (NICE/CKS)</label>
          <div className="flex gap-4">
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. NICE criteria for 2WW lung cancer..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#FF5C35] transition-all text-white placeholder:text-white/20 font-medium"
            />
            <button 
              type="submit"
              disabled={isSearching || !query.trim()}
              className="bg-[#FF5C35] text-white px-8 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSearching ? 'Grounding...' : 'Fetch Guidance'}
            </button>
          </div>
        </form>

        {isSearching && (
          <div className="mt-8 flex items-center justify-center gap-4 text-[#FF5C35]">
            <i className="fa-solid fa-spinner animate-spin"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Searching UK Medical Databases...</span>
          </div>
        )}

        {result && (
          <div className="mt-10 animate-up">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                {result.text.split('\n').map((line, i) => (
                  <p key={i} className="mb-4">{line}</p>
                ))}
              </div>
              
              {result.sources.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Verified Sources</h4>
                  <div className="flex flex-wrap gap-3">
                    {result.sources.map((source, i) => (
                      <a 
                        key={i}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-[#FF5C35] transition-all flex items-center gap-2"
                      >
                        <i className="fa-solid fa-link"></i>
                        {source.title.substring(0, 30)}...
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Resources */}
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 px-4">Core GP Toolkit</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {clinicalResources.map((resource, i) => (
          <a 
            key={i}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white border border-slate-100 p-8 rounded-3xl hover:border-[#FF5C35] hover:shadow-xl transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl ${resource.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
              <i className={`fa-solid ${resource.icon} text-lg`}></i>
            </div>
            <h4 className="text-lg font-black tracking-tight mb-2 group-hover:text-[#FF5C35] transition-colors">{resource.name}</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">{resource.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default GuidanceHub;
