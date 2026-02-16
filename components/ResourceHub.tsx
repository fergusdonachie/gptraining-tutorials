
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const ResourceHub: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'referral' | 'explainer' | 'akt' | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tools = [
    { 
        id: 'referral', 
        name: 'Referral Drafter', 
        icon: 'fa-file-signature', 
        desc: 'Turn clinical shorthand into structured referral letters.',
        prompt: 'Draft a professional clinical referral letter based on these notes. Use SBAR format. Ensure medical professionalism.'
    },
    { 
        id: 'explainer', 
        name: 'Patient Explainer', 
        icon: 'fa-comments', 
        desc: 'Translate complex jargon into simple, empathetic talk.',
        prompt: 'Explain this medical condition/result to a patient who has no medical background. Be empathetic, use simple analogies, and avoid jargon.'
    },
    { 
        id: 'akt', 
        name: 'AKT Question Gen', 
        icon: 'fa-graduation-cap', 
        desc: 'Generate mock exam questions for revision.',
        prompt: 'Create one high-yield MRCGP AKT Single Best Answer (SBA) question on this topic. Include 5 options and a detailed explanation of the correct answer.'
    }
  ];

  const handleAITool = async () => {
    if (!input.trim() || isLoading || !activeTool) return;
    setIsLoading(true);
    setOutput('');

    try {
      const tool = tools.find(t => t.id === activeTool);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${tool?.prompt}\n\nNotes/Input: ${input}`,
      });

      setOutput(response.text || 'Synthesis failed.');
    } catch (err) {
      console.error(err);
      setOutput('Error processing request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF5C35] mb-2">Clinical Utilities</h2>
        <h1 className="text-5xl font-black tracking-tighter text-slate-900">Resource Toolkit</h1>
        <p className="mt-4 text-slate-500 max-w-2xl font-medium">
          Professional-grade AI tools to assist with administrative burden and clinical learning.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {tools.map((tool) => (
          <button 
            key={tool.id}
            onClick={() => { setActiveTool(tool.id as any); setInput(''); setOutput(''); }}
            className={`p-8 rounded-[32px] border transition-all text-left flex flex-col items-start gap-4 ${activeTool === tool.id ? 'bg-black border-black text-white shadow-2xl' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTool === tool.id ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}`}>
                <i className={`fa-solid ${tool.icon} text-lg`}></i>
            </div>
            <div>
                <h3 className="font-black text-lg tracking-tight mb-1">{tool.name}</h3>
                <p className={`text-xs font-medium leading-relaxed ${activeTool === tool.id ? 'text-slate-400' : 'text-slate-500'}`}>{tool.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {activeTool && (
        <div className="bg-slate-50 rounded-[40px] p-10 animate-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#FF5C35]">
                    Active Tool: {tools.find(t => t.id === activeTool)?.name}
                </h3>
                <button 
                    onClick={() => setActiveTool(null)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black"
                >
                    Close Tool
                </button>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Input / Clinical Notes</label>
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type or paste rough notes here..."
                        className="w-full bg-white border border-slate-200 rounded-2xl p-6 min-h-[150px] outline-none focus:border-[#FF5C35] transition-all font-medium text-slate-700"
                    />
                </div>

                <button 
                    onClick={handleAITool}
                    disabled={isLoading || !input.trim()}
                    className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.01] transition-all disabled:opacity-50"
                >
                    {isLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-bolt-lightning"></i>}
                    Generate Result
                </button>

                {output && (
                    <div className="space-y-2 animate-up">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                            AI Output
                            <button 
                                onClick={() => { navigator.clipboard.writeText(output); }}
                                className="text-[#FF5C35] hover:underline"
                            >
                                Copy to Clipboard
                            </button>
                        </label>
                        <div className="w-full bg-white border border-slate-100 rounded-3xl p-8 font-medium text-slate-800 leading-relaxed shadow-sm whitespace-pre-line">
                            {output}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* External Resources Quick Links */}
      {!activeTool && (
        <section className="mt-12 animate-up">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 px-4">Exam & Portfolio Hub</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { name: 'RCGP Portfolio', url: 'https://trainee.rcgp.org.uk/' },
                    { name: 'FourteenFish', url: 'https://www.fourteenfish.com/' },
                    { name: 'GP Self-Test', url: 'https://www.rcgp.org.uk/gp-self-test' },
                    { name: 'E-Learning for Health', url: 'https://www.e-lfh.org.uk/' }
                ].map((link, i) => (
                    <a 
                        key={i} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white border border-slate-100 p-6 rounded-2xl text-center hover:border-[#FF5C35] transition-all group"
                    >
                        <p className="text-sm font-bold text-slate-700 group-hover:text-black">{link.name}</p>
                        <i className="fa-solid fa-external-link text-[10px] text-slate-300 mt-2 block"></i>
                    </a>
                ))}
            </div>
        </section>
      )}
    </div>
  );
};

export default ResourceHub;
