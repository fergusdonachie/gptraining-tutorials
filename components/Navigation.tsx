
import React from 'react';

interface NavigationProps {
  view: string;
  setView: (v: any) => void;
}

const Navigation: React.FC<NavigationProps> = ({ view, setView }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white transition-all group-hover:bg-[#FF5C35]">
            <i className="fa-solid fa-graduation-cap text-sm"></i>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 block leading-none">GP Training</span>
            <span className="font-medium text-[10px] uppercase tracking-widest text-slate-400">Case Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button 
            onClick={() => setView('dashboard')}
            className={`text-sm font-bold transition-all ${view === 'dashboard' ? 'text-black' : 'text-slate-400 hover:text-black'}`}
          >
            Topic Library
          </button>
          <button 
            onClick={() => setView('generator')}
            className={`text-sm font-bold transition-all flex items-center gap-2 ${view === 'generator' ? 'text-black' : 'text-slate-400 hover:text-black'}`}
          >
            <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
            AI Case Generator
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
