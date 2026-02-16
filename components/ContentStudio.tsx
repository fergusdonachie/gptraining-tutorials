
import React, { useState } from 'react';
import { Tutorial } from '../types';
import { GoogleGenAI } from '@google/genai';

interface ContentStudioProps {
  onAdd: (t: Tutorial) => void;
  onCancel: () => void;
}

const ContentStudio: React.FC<ContentStudioProps> = ({ onAdd, onCancel }) => {
  const [markdown, setMarkdown] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('Draft, AI Generated');
  const [specialty, setSpecialty] = useState('General Medicine');
  
  // AI Generation State
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    setGenerationStep('Analyzing clinical guidelines...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Create a high-quality GP clinical case tutorial about "${aiTopic}".
      
      Structure requirements:
      1. Start with learning points in a <Callout type="ok" title="Learning Points"> tag.
      2. Include a management summary in a <Callout type="note" title="Management Summary"> tag.
      3. Create one or two <Case title="..."> components.
      4. Inside <Case>, use multiple <Step title="..."> tags for the staged reveal.
      5. Include "Discussion prompts:" inside the steps.
      6. Use markdown for headings (##) and bolding.
      
      Make it professional, evidence-based, and specifically for GP trainees. Use the staged-reveal methodology.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are an expert GP trainer specializing in staged-reveal clinical cases for MRCGP trainees. You output raw markdown containing custom <Case>, <Step>, and <Callout> tags."
        }
      });

      const content = response.text || '';
      setMarkdown(content);
      
      // Auto-extract title from content if possible
      const titleMatch = content.match(/^(?:#|##)\s+(.*)$/m);
      if (titleMatch) setTitle(titleMatch[1]);
      else setTitle(aiTopic + " Case Study");

      setGenerationStep('Finalizing tutorial structure...');
    } catch (err) {
      console.error('AI Generation failed:', err);
      setGenerationStep('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleSaveToSession = () => {
    if (!title || !markdown) return;

    const newTutorial: Tutorial = {
      id: `local-${Date.now()}`,
      metadata: {
        title,
        description: desc || `A comprehensive staged-reveal case on ${title}.`,
        tags: tags.split(',').map(s => s.trim()),
        date: new Date().toLocaleDateString(),
        specialty,
        isLocal: true // Mark as a local draft
      },
      content: markdown
    };
    onAdd(newTutorial);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#FF5C35] mb-2">Architect Mode</h2>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">Content Studio</h1>
        </div>
        <button 
          onClick={onCancel}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all text-xs uppercase tracking-widest"
        >
          Cancel Draft
        </button>
      </div>

      {/* AI GENERATOR SECTION */}
      <div className="mb-12 bg-black rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5C35] rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${isGenerating ? 'animate-pulse' : ''}`}>
              <i className="fa-solid fa-wand-magic-sparkles text-[#FF5C35]"></i>
            </div>
            <h3 className="text-xl font-black tracking-tight">AI Case Architect</h3>
          </div>
          
          <p className="text-slate-400 font-medium mb-8 max-w-lg">
            Type a clinical topic, guideline, or patient scenario. Our AI will draft a complete staged-reveal tutorial in seconds.
          </p>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input 
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                disabled={isGenerating}
                placeholder="e.g. Red flag headaches in a 40yo male"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#FF5C35] transition-all text-lg font-medium placeholder:text-white/20"
              />
              {generationStep && (
                <div className="absolute top-full left-0 mt-2 text-[10px] font-black uppercase tracking-widest text-[#FF5C35] animate-pulse">
                  {generationStep}
                </div>
              )}
            </div>
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating || !aiTopic.trim()}
              className="bg-[#FF5C35] text-white px-8 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {isGenerating ? 'Architecting...' : 'Build Case'}
            </button>
          </div>
        </div>
      </div>

      {/* MANUAL EDITOR SECTION */}
      <div className="space-y-8 bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl">
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tutorial Title</label>
                <input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Managing Gout in Primary Care"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-[#FF5C35] transition-all font-bold text-lg"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialty</label>
                <select 
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-[#FF5C35] transition-all font-bold text-lg appearance-none cursor-pointer"
                >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Women's Health">Women's Health</option>
                    <option value="Paediatrics">Paediatrics</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="MSK">MSK</option>
                </select>
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Markdown Content & Logic Tags</label>
            <textarea 
                value={markdown}
                onChange={e => setMarkdown(e.target.value)}
                placeholder="Tutorial body goes here..."
                className="w-full bg-zinc-900 text-zinc-300 font-mono text-sm rounded-3xl p-8 h-[500px] outline-none border-2 border-transparent focus:border-[#FF5C35] transition-all shadow-inner leading-relaxed"
            />
        </div>

        <div className="flex gap-4 pt-6">
            <button 
                onClick={handleSaveToSession}
                disabled={!title || !markdown}
                className="flex-1 py-5 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all hover:scale-[1.02]"
            >
                Save as Local Draft
            </button>
        </div>
      </div>
    </div>
  );
};

export default ContentStudio;
