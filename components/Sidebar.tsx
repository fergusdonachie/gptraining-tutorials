
import React from 'react';

interface SidebarProps {
  view: string;
  setView: (v: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-user-doctor text-teal-600"></i>
          GP Case Studio
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setView('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <i className="fa-solid fa-book-medical w-5 text-center"></i>
          Tutorials
        </button>
        <button 
          onClick={() => setView('studio')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${view === 'studio' ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <i className="fa-solid fa-plus w-5 text-center"></i>
          New Tutorial
        </button>
      </nav>
      <div className="p-4 mt-auto border-t border-slate-100">
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">User Mode</p>
          <p className="text-sm font-medium text-slate-700">GP Trainer / Trainee</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
