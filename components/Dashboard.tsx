
import React, { useState, useMemo } from 'react';
import { Tutorial } from '../types';

interface DashboardProps {
  tutorials: Tutorial[];
  onOpen: (t: Tutorial) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tutorials, onOpen }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const specialties = useMemo(() => {
    const specs = [
      { name: "Women's Health", icon: "fa-venus", color: "bg-rose-50 text-rose-500" },
      { name: "Paediatrics", icon: "fa-baby", color: "bg-blue-50 text-blue-500" },
      { name: "Mental Health", icon: "fa-brain", color: "bg-purple-50 text-purple-500" },
      { name: "Cardiology", icon: "fa-heart-pulse", color: "bg-red-50 text-red-500" },
      { name: "Dermatology", icon: "fa-hand-dots", color: "bg-orange-50 text-orange-500" },
      { name: "MSK", icon: "fa-bone", color: "bg-amber-50 text-amber-500" },
      { name: "General Medicine", icon: "fa-briefcase-medical", color: "bg-slate-50 text-slate-500" }
    ];
    
    return specs.map(s => ({
      ...s,
      count: tutorials.filter(t => t.metadata.specialty === s.name).length
    })).filter(s => s.count > 0 || s.name === "General Medicine");
  }, [tutorials]);

  const filteredTutorials = useMemo(() => {
    if (!selectedSpecialty) return [];
    return tutorials.filter(t => t.metadata.specialty === selectedSpecialty);
  }, [tutorials, selectedSpecialty]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="animate-up max-w-3xl">
          <h1 className="text-6xl font-black tracking-tight leading-[1.1] mb-8 text-slate-900">
            General Practice <br/>
            <span className="text-slate-400">Tutorial Library</span>
          </h1>
          <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl border-l-4 border-[#FF5C35] pl-8">
            Structured clinical simulations designed for tutorial-based learning. Facilitating evidence-based discussion between trainers and trainees through staged-reveal scenarios.
          </p>
        </div>
      </section>

      {/* Specialty Browse Section */}
      <section id="browse-section" className="py-12 min-h-[600px]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-50 rounded-[32px] border border-slate-100 overflow-hidden animate-up [animation-delay:200ms]">
            
            {/* Header Area */}
            <div className="bg-white px-10 py-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                  {selectedSpecialty ? 'Current Specialty' : 'Curriculum Areas'}
                </h2>
                <h3 className="text-2xl font-black tracking-tight text-slate-900">
                  {selectedSpecialty || 'Select a Topic'}
                </h3>
              </div>
              {selectedSpecialty && (
                <button 
                  onClick={() => setSelectedSpecialty(null)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-black transition-colors bg-slate-100 px-4 py-2 rounded-lg"
                >
                  <i className="fa-solid fa-grid"></i>
                  View All Topics
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="p-10">
              {!selectedSpecialty ? (
                /* Specialty Selection Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-up">
                  {specialties.map((spec) => (
                    <div 
                      key={spec.name}
                      onClick={() => setSelectedSpecialty(spec.name)}
                      className="group bg-white border border-slate-200 p-6 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer flex items-center gap-6"
                    >
                      <div className={`w-12 h-12 rounded-xl ${spec.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <i className={`fa-solid ${spec.icon} text-lg`}></i>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#FF5C35] transition-colors">
                          {spec.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          {spec.count} Cases
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Tutorial Listing for Selected Specialty */
                <div className="grid md:grid-cols-2 gap-6 animate-up">
                  {filteredTutorials.map((t) => (
                    <div 
                      key={t.id}
                      onClick={() => onOpen(t)}
                      className="group bg-white border border-slate-200 p-8 rounded-2xl hover:border-slate-900 hover:shadow-lg transition-all cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-2">
                          {t.metadata.isLocal && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-black bg-amber-400 px-2 py-1 rounded">
                              Draft
                            </span>
                          )}
                          {t.metadata.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.metadata.date}</span>
                      </div>
                      <h3 className="text-xl font-bold tracking-tight mb-3 text-slate-900 group-hover:text-[#FF5C35] transition-colors">{t.metadata.title}</h3>
                      <p className="text-sm text-slate-500 font-medium mb-8 line-clamp-2 leading-relaxed">
                        {t.metadata.description}
                      </p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Start Case</span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredTutorials.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <i className="fa-solid fa-folder-open text-4xl text-slate-200 mb-4 block"></i>
                      <p className="text-slate-400 font-medium">No tutorials found in this specialty yet.</p>
                      <button 
                        onClick={() => setSelectedSpecialty(null)}
                        className="mt-4 text-xs font-bold text-slate-900 uppercase tracking-widest hover:underline"
                      >
                        Return to Index
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
