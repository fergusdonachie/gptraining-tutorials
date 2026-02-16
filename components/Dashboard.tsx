
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
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-up">
            <h1 className="text-7xl font-black tracking-tighter leading-[0.95] mb-8">
              Clinical mastery <br />
              through <span className="text-[#FF5C35]">simulation</span>.
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-lg mb-12 leading-relaxed">
              Step into high-fidelity GP cases. Staged-reveal tutorials designed for trainees to master clinical logic, one decision at a time.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  const el = document.getElementById('browse-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
              >
                Explore Library
              </button>
              <button className="flex items-center gap-3 px-8 py-4 font-bold hover:bg-slate-50 rounded-xl transition-all">
                <i className="fa-solid fa-play text-xs text-[#FF5C35]"></i>
                Watch Intro
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-slate-100 border border-slate-100 animate-up [animation-delay:200ms]">
            {[
              { label: 'Specialties', value: specialties.length, sub: 'Curated topics' },
              { label: 'Active Cases', value: tutorials.length, sub: 'Synced + Drafts' },
              { label: 'Latest Sync', value: 'Live', sub: 'GitHub Realtime' },
              { label: 'Core AI', value: 'Gemini 3', sub: 'Flash Preview' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8">
                <div className="text-4xl font-black mb-1">{stat.value}</div>
                <div className="text-sm font-bold mb-4 uppercase tracking-tighter">{stat.label}</div>
                <div className="text-xs text-slate-400 font-medium">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialty Browse Section */}
      <section id="browse-section" className="dashboard-preview-bg py-24 min-h-[800px]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="glass-card rounded-[40px] shadow-2xl overflow-hidden animate-up [animation-delay:400ms]">
            
            {/* Header Area */}
            <div className="bg-white px-10 py-10 border-b border-slate-100">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#FF5C35] mb-2">
                    {selectedSpecialty ? 'Viewing Specialty' : 'Step 1: Choose Specialty'}
                  </h2>
                  <h3 className="text-4xl font-black tracking-tighter">
                    {selectedSpecialty || 'Clinical Curriculum'}
                  </h3>
                </div>
                {selectedSpecialty && (
                  <button 
                    onClick={() => setSelectedSpecialty(null)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to All
                  </button>
                )}
              </div>
            </div>

            {/* View Switching */}
            <div className="p-10 bg-slate-50/50">
              {!selectedSpecialty ? (
                /* Specialty Selection Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-up">
                  {specialties.map((spec) => (
                    <div 
                      key={spec.name}
                      onClick={() => setSelectedSpecialty(spec.name)}
                      className="group bg-white border border-slate-100 p-8 rounded-3xl hover:border-[#FF5C35] hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className={`w-14 h-14 rounded-2xl ${spec.color} flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500`}>
                        <i className={`fa-solid ${spec.icon} text-xl`}></i>
                      </div>
                      <h4 className="text-2xl font-black tracking-tighter mb-1 group-hover:text-[#FF5C35] transition-colors">
                        {spec.name}
                      </h4>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                        {spec.count} Available Cases
                      </p>
                      
                      <div className="absolute top-8 right-8 text-slate-100 group-hover:text-orange-100 transition-colors">
                        <i className={`fa-solid ${spec.icon} text-6xl rotate-12`}></i>
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
                      className="group bg-white border border-slate-100 p-8 rounded-3xl hover:border-[#FF5C35] hover:shadow-xl transition-all cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-2">
                          {t.metadata.isLocal && (
                            <span className="text-[10px] font-black uppercase tracking-tighter text-black bg-yellow-400 px-2 py-0.5 rounded">
                              Local Draft
                            </span>
                          )}
                          {t.metadata.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] font-black uppercase tracking-tighter text-[#FF5C35] bg-orange-50 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">{t.metadata.date}</span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tighter mb-2 group-hover:text-[#FF5C35] transition-colors">{t.metadata.title}</h3>
                      <p className="text-sm text-slate-400 font-medium mb-8 line-clamp-2 leading-relaxed">
                        {t.metadata.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-900">Start Tutorial</span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#FF5C35] group-hover:text-white transition-all">
                          <i className="fa-solid fa-chevron-right text-[10px]"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredTutorials.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <i className="fa-solid fa-box-open text-4xl text-slate-200 mb-4 block"></i>
                      <p className="text-slate-400 font-medium">No tutorials found in this specialty yet.</p>
                      <button 
                        onClick={() => setSelectedSpecialty(null)}
                        className="mt-4 text-xs font-bold text-[#FF5C35] uppercase tracking-widest hover:underline"
                      >
                        Explore Other Areas
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
