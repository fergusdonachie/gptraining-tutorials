
import React, { useState } from 'react';

// Callout Component
interface CalloutProps {
  type: 'ok' | 'note' | 'warning';
  title?: string;
  children: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({ type, title, children }) => {
  const styles = {
    ok: "bg-emerald-50 border-emerald-500 text-emerald-900",
    note: "bg-orange-50 border-[#FF5C35] text-orange-900",
    warning: "bg-amber-50 border-amber-500 text-amber-900",
  };

  const icons = {
    ok: "fa-circle-check",
    note: "fa-circle-info",
    warning: "fa-triangle-exclamation",
  };

  return (
    <div className={`my-8 p-8 border-l-4 rounded-r-[32px] shadow-sm ${styles[type]}`}>
      {title && (
        <div className="flex items-center gap-3 mb-4 font-black text-xs uppercase tracking-widest">
          <i className={`fa-solid ${icons[type]} ${type === 'note' ? 'text-[#FF5C35]' : ''}`}></i>
          {title}
        </div>
      )}
      <div className="text-sm leading-relaxed font-medium opacity-90 whitespace-pre-line">
        {children}
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
}

export const Case: React.FC<CaseProps> = ({ title, steps }) => {
  const [revealedIndex, setRevealedIndex] = useState(0);

  const handleNext = () => {
    if (revealedIndex < steps.length - 1) {
      setRevealedIndex(revealedIndex + 1);
    }
  };

  return (
    <div className="my-12 bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-2xl">
      <div className="bg-black p-8 flex justify-between items-center">
        <h3 className="text-white text-xl font-black tracking-tight flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5C35] flex items-center justify-center">
            <i className="fa-solid fa-stethoscope text-white text-sm"></i>
          </div>
          {title}
        </h3>
        <div className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] bg-white/10 px-4 py-2 rounded-full">
          Step {revealedIndex + 1} / {steps.length}
        </div>
      </div>
      
      <div className="p-10 space-y-12">
        {steps.slice(0, revealedIndex + 1).map((step, idx) => (
          <div key={idx} className="animate-up">
             <div className="flex items-start gap-8">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                 <span className="text-sm font-black text-black">{idx + 1}</span>
               </div>
               <div className="flex-1">
                 <h4 className="text-xs font-black text-[#FF5C35] mb-4 uppercase tracking-[0.15em]">{step.title}</h4>
                 <div className="text-slate-900 font-medium text-lg leading-relaxed whitespace-pre-line">
                    {step.content.replace(/\*\*Discussion prompts:\*\*/g, '').trim()}
                    {step.content.includes('Discussion prompts:') && (
                        <div className="mt-8 pt-8 border-t border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Critique & Analysis</p>
                             <div className="text-black italic bg-slate-50 p-6 rounded-2xl border border-slate-100 text-base">
                                {step.content.split('Discussion prompts:')[1]?.trim()}
                             </div>
                        </div>
                    )}
                 </div>
               </div>
             </div>
          </div>
        ))}
      </div>

      {revealedIndex < steps.length - 1 && (
        <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button 
            onClick={handleNext}
            className="px-10 py-5 bg-black hover:bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all hover:scale-105 shadow-xl"
          >
            Reveal Clinical Data
            <i className="fa-solid fa-eye text-[10px]"></i>
          </button>
        </div>
      )}

      {revealedIndex === steps.length - 1 && (
        <div className="p-6 bg-emerald-50 flex items-center justify-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em] border-t border-emerald-100">
          <i className="fa-solid fa-check-circle"></i>
          Module Complete
        </div>
      )}
    </div>
  );
};

export const Step: React.FC<StepData> = ({ title, content }) => null;
