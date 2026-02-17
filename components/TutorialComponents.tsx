
import React, { useState } from 'react';

// Callout Component
export const Callout: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="my-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
    {title && (
      <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-900">
        <i className="fa-solid fa-star text-amber-500"></i>
        {title}
      </div>
    )}
    <div className="text-slate-700 font-medium leading-relaxed">{children}</div>
  </div>
);

// Case Component
interface CaseProps {
  title: string;
  steps: {
    title: string;
    content: React.ReactNode;
    trainerNotes?: React.ReactNode;
  }[];
}

export const Case: React.FC<CaseProps> = ({ title, steps }) => {
  const [revealedCount, setRevealedCount] = useState(1);

  // Safe fallback if steps are empty (should typically be handled by TutorialView)
  if (!steps || steps.length === 0) {
    return (
      <div className="my-10 p-4 border border-slate-100 rounded-xl bg-slate-50">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-slate-400 text-sm mt-2">No interactive stages defined.</p>
      </div>
    );
  }

  const isFinished = revealedCount === steps.length;

  return (
    <div className="relative group">
      {/* Case Header */}
      <div className="mb-10 flex items-end justify-between border-b border-slate-100 pb-6 sticky top-20 bg-white/95 backdrop-blur z-20 transition-all">
        <div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Clinical Scenario</span>
           <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
        </div>
        <div className="bg-slate-900 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
          Step {revealedCount} / {steps.length}
        </div>
      </div>

      {/* Steps Container */}
      <div className="space-y-16 pl-4 md:pl-8 border-l-2 border-slate-100 relative">
        {steps.slice(0, revealedCount).map((step, idx) => (
          <div key={idx} className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
            
            {/* Step Marker Dot */}
            <div className={`absolute -left-[41px] md:-left-[43px] top-0 w-5 h-5 rounded-full border-4 border-white transition-colors duration-500 ${idx === revealedCount - 1 ? 'bg-[#FF5C35] ring-4 ring-[#FF5C35]/20' : 'bg-slate-200'}`}></div>

            <h3 className="text-sm font-black uppercase tracking-widest text-[#FF5C35] mb-6 flex items-center gap-2">
              {step.title}
            </h3>
            
            <div className="prose prose-slate prose-lg max-w-none text-slate-700 mb-8">
                {step.content}
            </div>
            
            {/* Trainer Notes */}
            {step.trainerNotes && (
                <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-6 md:p-8 relative mt-8">
                    <div className="absolute -top-3 left-6 bg-amber-100 text-amber-900 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-2">
                        <i className="fa-solid fa-user-graduate"></i>
                        Trainer Guidance
                    </div>
                    <div className="text-amber-950/80 text-base font-medium leading-relaxed mt-2">
                        {step.trainerNotes}
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Reveal Button */}
      <div className="mt-16 pl-8">
        {!isFinished ? (
            <button 
                onClick={() => setRevealedCount(c => c + 1)}
                className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
            >
                Reveal Next Stage <i className="fa-solid fa-arrow-down animate-bounce"></i>
            </button>
        ) : (
            <div className="inline-flex items-center gap-3 bg-green-50 text-green-700 px-6 py-4 rounded-xl border border-green-100">
                <i className="fa-solid fa-check-circle text-lg"></i>
                <span className="text-xs font-bold uppercase tracking-widest">Case Discussion Concluded</span>
            </div>
        )}
      </div>
    </div>
  );
};
