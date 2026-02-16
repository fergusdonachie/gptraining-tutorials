
import React from 'react';

interface NavigationProps {
  view: string;
  setView: (v: any) => void;
  onSync: () => void;
  isSyncing: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ view, setView, onSync, isSyncing }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white transition-transform group-hover:rotate-12">
            <i className="fa-solid fa-bolt-lightning text-xs"></i>
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">Studio</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <button 
            onClick={() => setView('dashboard')}
            className={`text-sm font-semibold transition-colors ${view === 'dashboard' ? 'text-black' : 'text-slate-500 hover:text-black'}`}
          >
            Library
          </button>
          <button 
            onClick={() => setView('studio')}
            className={`text-sm font-semibold transition-colors ${view === 'studio' ? 'text-black' : 'text-slate-500 hover:text-black'}`}
          >
            Studio
          </button>
          <button 
            onClick={() => setView('guidance')}
            className={`text-sm font-semibold transition-colors ${view === 'guidance' ? 'text-black' : 'text-slate-500 hover:text-black'}`}
          >
            Guidance
          </button>
          <button 
            onClick={() => setView('resources')}
            className={`text-sm font-semibold transition-colors ${view === 'resources' ? 'text-black' : 'text-slate-500 hover:text-black'}`}
          >
            Resources
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-bold px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors">Log in</button>
          <button 
            onClick={onSync}
            disabled={isSyncing}
            className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
            {isSyncing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-rotate"></i>}
            Sync Library
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
