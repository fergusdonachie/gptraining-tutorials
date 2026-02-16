
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

// Callout Component
interface CalloutProps {
  type: 'ok' | 'note' | 'warning';
  title?: string;
  children: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({ type, title, children }) => {
  const styles = {
    ok: "bg-emerald-50/40 border-emerald-200 text-emerald-900",
    note: "bg-slate-50 border-slate-200 text-slate-800",
    warning: "bg-amber-50/40 border-amber-200 text-amber-900",
  };

  const icons = {
    ok: "fa-circle-check text-emerald-500",
    note: "fa-circle-info text-slate-400",
    warning: "fa-triangle-exclamation text-amber-500",
  };

  const processBoldText = (text: React.ReactNode) => {
    if (typeof text !== 'string') return text;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`my-8 p-8 border rounded-2xl ${styles[type]}`}>
      {title && (
        <div className="flex items-center gap-3 mb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
          <i className={`fa-solid ${icons[type]} text-base`}></i>
          {title}
        </div>
      )}
      <div className="text-lg leading-relaxed font-medium opacity-90 whitespace-pre-line">
        {processBoldText(children)}
      </div>
    </div>
  );
};

// Case Component
interface StepData {
  title: string;
  content: string;
  open?: boolean;
}

interface CaseProps {
  title: string;
  steps: StepData[];
  patientProfile?: {
    age?: string;
    sex?: string;
  };
}

export const Case: React.FC<CaseProps> = ({ title, steps, patientProfile }) => {
  const [revealedIndex, setRevealedIndex] = useState(0);
  const [reasoningInput, setReasoningInput] = useState('');
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [hint, setHint] = useState('');

  const handleNext = () => {
    if (revealedIndex < steps.length - 1) {
      setRevealedIndex(revealedIndex + 1);
      setReasoningInput('');
      setHint('');
    }
  };

  const processBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const getPeerOpinion = async () => {
    if (isGettingHint) return;
    setIsGettingHint(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentStep = steps[revealedIndex];
      const prompt = `You are a clinical mentor for GP trainees. A trainee is managing a case of "${title}". 
      Step Findings: "${currentStep.content}"
      Trainee thoughts: "${reasoningInput}"
      
      Give a short, 2-sentence piece of clinical guidance. Be subtle, professional, and do not give the diagnosis away.`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setHint(result.text || "Ensure all red flags have been excluded.");
    } catch (err) {
      setHint("Consult the latest NICE guidance for this clinical presentation.");
    } finally {
      setIsGettingHint(false);
    }
  };

  return (
    <div className="my-16 bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
      {/* Soft Professional Header */}
      <div className="bg-slate-50 p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-stethoscope text-slate-400 text-sm"></i>
          </div>
          <div>
            <h3 className="text-slate-800 text-lg font-extrabold tracking-tight">{title}</h3>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">Clinical Reasoning Simulation</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {patientProfile?.age && (
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-center">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Age</span>
                <span className="text-xs font-bold text-slate-700">{patientProfile.age}</span>
            </div>
          )}
          {patientProfile?.sex && (
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-center">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Sex</span>
                <span className="text-xs font-bold text-slate-700">{patientProfile.sex}</span>
            </div>
          )}
        </div>
      </div>

      {/* Discrete Progress Bar */}
      <div className="h-0.5 bg-slate-100 w-full overflow-hidden">
        <div 
          className="h-full bg-slate-400 transition-all duration-700 ease-in-out"
          style={{ width: `${((revealedIndex + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
      
      <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-10">
        {/* Case Progression */}
        <div className="flex-1 space-y-12">
            {steps.slice(0, revealedIndex + 1).map((step, idx) => (
            <div key={idx} className={`animate-up ${idx < revealedIndex ? 'opacity-40 grayscale' : ''}`}>
                <div className="flex items-start gap-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${idx === revealedIndex ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                    <span className="text-sm font-black">{idx + 1}</span>
                </div>
                <div className="flex-1">
                    <h4 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 ${idx === revealedIndex ? 'text-slate-500' : 'text-slate-300'}`}>
                      {step.title}
                    </h4>
                    <div className="text-slate-700 font-medium text-lg leading-relaxed whitespace-pre-line pb-6 border-b border-slate-50">
                        {processBoldText(step.content.split('Discussion prompts:')[0].trim())}
                        
                        {idx === revealedIndex && step.content.includes('Discussion prompts:') && (
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <i className="fa-solid fa-question-circle"></i>
                                  Logic Checkpoints
                                </p>
                                <div className="text-slate-500 italic text-lg leading-relaxed space-y-3">
                                    {step.content.split('Discussion prompts:')[1]?.trim().split('\n').filter(Boolean).map((q, i) => (
                                      <div key={i} className="flex gap-3">
                                        <span className="text-slate-300">•</span>
                                        <p>{processBoldText(q.replace(/^- /, ''))}</p>
                                      </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </div>
            ))}
        </div>

        {/* Training Sideboard */}
        {revealedIndex < steps.length - 1 && (
            <div className="lg:w-72 shrink-0">
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 sticky top-24">
                    <h5 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-6">Your Assessment</h5>
                    
                    <div className="mb-6">
                      <label className="text-[9px] font-bold text-slate-700 uppercase tracking-tighter block mb-2">Clinical Reasoning</label>
                      <textarea 
                          value={reasoningInput}
                          onChange={(e) => setReasoningInput(e.target.value)}
                          placeholder="Note your differentials..."
                          className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-slate-400 transition-all resize-none leading-relaxed"
                      />
                    </div>
                    
                    <div className="space-y-2">
                        <button 
                            onClick={handleNext}
                            disabled={!reasoningInput.trim()}
                            className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-slate-900 transition-all disabled:opacity-20 shadow-sm"
                        >
                            Reveal Next Step
                        </button>
                        <button 
                            onClick={getPeerOpinion}
                            disabled={isGettingHint}
                            className="w-full py-3 bg-white border border-slate-200 text-slate-500 rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            {isGettingHint ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-lightbulb"></i>}
                            Get Hint
                        </button>
                    </div>

                    {hint && (
                        <div className="mt-6 p-4 bg-white border border-slate-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mentor Wisdom</p>
                            <p className="text-sm text-slate-700 font-bold italic leading-relaxed">"{hint}"</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Completion */}
      {revealedIndex === steps.length - 1 && (
        <div className="p-10 bg-emerald-50/30 border-t border-emerald-100 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg shadow-sm mb-4">
            <i className="fa-solid fa-check"></i>
          </div>
          <h4 className="text-xl font-bold tracking-tight text-emerald-950 mb-1">Simulation Complete</h4>
          <p className="text-emerald-700/60 font-medium text-sm max-w-xs">
            Reflect on your reasoning against the clinical summary provided above.
          </p>
        </div>
      )}
    </div>
  );
};

export const Step: React.FC<StepData> = ({ title, content }) => null;
