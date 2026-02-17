
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
  const [tags, setTags] = useState('Draft, Simulation');
  const [specialty, setSpecialty] = useState('General Medicine');
  
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    setGenerationStep('Designing clinical scenario...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Create a GP clinical tutorial for "${aiTopic}" using the following Standard Markdown format.

      Format Requirements:
      1. Start with Frontmatter:
         ---
         title: [Title]
         description: [Short summary]
         specialty: [Specialty]
         tags: [Tag1, Tag2]
         date: [YYYY-MM-DD]
         ---
      
      2. Introduction: Standard markdown text with bullet points.
         Use > **Learning Point:** for key messages.

      3. The Case:
         Start with "## Case: [Patient Name/Scenario]"
         
         Break the case into revealed steps using Level 3 headers:
         ### Step 1: Presentation
         [Patient history...]
         > **Trainer Guidance:** [Specific questions to ask trainee]

         ### Step 2: Examination
         [Findings...]
         > **Trainer Guidance:** [What specifically to look for]

         ### Step 3: Management
         [Plan...]
      
      Content: Professional, UK GP (NICE/CKS) aligned.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const content = response.text || '';
      setMarkdown(content);
      
      // Attempt to extract title from frontmatter or regex
      const titleMatch = content.match(/title:\s*(.*)/);
      if (titleMatch) setTitle(titleMatch[1].trim());
      else setTitle(aiTopic);

      setGenerationStep('Scenario generated.');
    } catch (err) {
      console.error('AI Generation failed:', err);
      setGenerationStep('Generation failed.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleSaveToSession = () => {
    if (!title || !markdown) return;

    // Parse Frontmatter if possible for metadata, otherwise fallback
    // Simple extraction for the draft object
    const newTutorial: Tutorial = {
      id: `local-${Date.now()}`,
      metadata: {
        title,
        description: desc || `Clinical scenario: ${title}`,
        tags: tags.split(',').map(s => s.trim()),
        date: new Date().toLocaleDateString(),
        specialty,
        isLocal: true
      },
      content: markdown
    };
    onAdd(newTutorial);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#FF5C35] mb-2">Trainer Tools</h2>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">AI Case Generator</h1>
        </div>
        <button 
          onClick={onCancel}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all text-xs uppercase tracking-widest"
        >
          Cancel
        </button>
      </div>

      <div className="mb-12 bg-slate-900 rounded-[32px] p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${isGenerating ? 'animate-pulse' : ''}`}>
              <i className="fa-solid fa-wand-magic-sparkles text-[#FF5C35]"></i>
            </div>
            <h3 className="text-xl font-bold tracking-tight">Generate New Scenario</h3>
          </div>
          
          <p className="text-slate-400 font-medium mb-8 max-w-lg leading-relaxed">
            Create a structured staged-reveal tutorial instantly. Uses standard Markdown format.
          </p>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input 
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                disabled={isGenerating}
                placeholder="e.g. 6 week baby check"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-[#FF5C35] transition-all text-lg font-medium placeholder:text-white/20"
              />
              {generationStep && (
                <div className="absolute top-full left-0 mt-2 text-[10px] font-bold uppercase tracking-widest text-[#FF5C35] animate-pulse">
                  {generationStep}
                </div>
              )}
            </div>
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating || !aiTopic.trim()}
              className="bg-[#FF5C35] text-white px-8 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#ff7250] transition-all disabled:opacity-50"
            >
              {isGenerating ? 'Working...' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      {markdown && (
        <div className="space-y-8 bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case Title</label>
                    <input 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Case Name"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 outline-none focus:border-slate-900 transition-all font-bold text-lg"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialty</label>
                    <select 
                        value={specialty}
                        onChange={e => setSpecialty(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 outline-none focus:border-slate-900 transition-all font-bold text-lg appearance-none cursor-pointer"
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case Content (Standard Markdown)</label>
                <textarea 
                    value={markdown}
                    onChange={e => setMarkdown(e.target.value)}
                    placeholder="Generated content..."
                    className="w-full bg-slate-50 text-slate-700 font-mono text-sm rounded-2xl p-6 h-[400px] outline-none border border-slate-200 focus:border-slate-900 transition-all"
                />
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button 
                    onClick={handleSaveToSession}
                    disabled={!title || !markdown}
                    className="w-full py-4 bg-slate-900 hover:bg-black disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                >
                    Save to Library
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ContentStudio;
