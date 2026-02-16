
import React from 'react';
import { Tutorial } from '../types';

interface DashboardProps {
  tutorials: Tutorial[];
  onOpen: (t: Tutorial) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tutorials, onOpen }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Tutorial Library</h2>
        <p className="text-slate-500">Curated clinical cases and teaching materials for GP training sessions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tutorials.map((t) => (
          <div 
            key={t.id} 
            onClick={() => onOpen(t)}
            className="group bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl hover:border-teal-200 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-wrap gap-2">
                {t.metadata.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded uppercase font-bold tracking-tight">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-slate-400">{t.metadata.date}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">
              {t.metadata.title}
            </h3>
            <p className="text-slate-500 text-sm line-clamp-2 mb-6">
              {t.metadata.description}
            </p>
            <div className="flex items-center gap-2 text-teal-600 text-sm font-semibold">
              Start Tutorial
              <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1"></i>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-40 transition-opacity"></div>
          </div>
        ))}

        {tutorials.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
            <i className="fa-solid fa-folder-open text-4xl text-slate-200 mb-4 block"></i>
            <p className="text-slate-500">No tutorials found. Add one in the studio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
