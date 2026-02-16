
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
    note: "bg-blue-50 border-blue-500 text-blue-900",
    warning: "bg-amber-50 border-amber-500 text-amber-900",
  };

  const icons = {
    ok: "fa-circle-check",
    note: "fa-circle-info",
    warning: "fa-triangle-exclamation",
  };

  return (
    <div className={`my-6 p-6 border-l-4 rounded-r-2xl shadow-sm ${styles[type]}`}>
      {title && (
        <div className="flex items-center gap-2 mb-3 font-bold text-sm uppercase tracking-wider">
          <i className={`fa-solid ${icons[type]}`}></i>
          {title}
        </div>
      )}
      <div className="text-sm leading-relaxed prose opacity-90 whitespace-pre-line">
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
    <div className="my-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
      <div className="bg-slate-800 p-4 px-6 flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center gap-3">
          <i className="fa-solid fa-hospital-user text-teal-400"></i>
          {title}
        </h3>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-700 px-2 py-1 rounded">
          Step {revealedIndex + 1} of {steps.length}
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {steps.slice(0, revealedIndex + 1).map((step, idx) => (
          <div key={idx} className="animate-in slide-in-from-top-2 duration-500 fill-mode-both">
             <div className="flex items-start gap-4 mb-4 last:mb-0">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                 <span className="text-xs font-bold text-slate-500">{idx + 1}</span>
               </div>
               <div className="flex-1">
                 <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">{step.title}</h4>
                 <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {step.content.replace(/\*\*Discussion prompts:\*\*/g, '').trim()}
                    {step.content.includes('Discussion prompts:') && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                             <p className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Discussion prompts</p>
                             <div className="text-teal-900 italic">
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
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button 
            onClick={handleNext}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold text-sm flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-teal-900/10"
          >
            Reveal Next Step
            <i className="fa-solid fa-eye text-xs"></i>
          </button>
        </div>
      )}

      {revealedIndex === steps.length - 1 && (
        <div className="p-4 bg-emerald-50 flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-widest border-t border-emerald-100">
          <i className="fa-solid fa-check-circle"></i>
          Case Completed
        </div>
      )}
    </div>
  );
};

export const Step: React.FC<StepData> = ({ title, content }) => {
    // This is a dummy component for type-safety in rendering, logic is handled in Case
    return null;
}
