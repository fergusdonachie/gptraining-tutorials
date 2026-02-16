
import React, { useState } from 'react';
import { Tutorial } from '../types';

interface ContentStudioProps {
  onAdd: (t: Tutorial) => void;
  onCancel: () => void;
}

const ContentStudio: React.FC<ContentStudioProps> = ({ onAdd, onCancel }) => {
  const [markdown, setMarkdown] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('Primary Care, GP Training');

  const handleSaveToSession = () => {
    if (!title || !markdown) return;

    const newTutorial: Tutorial = {
      id: `local-${Date.now()}`,
      metadata: {
        title,
        description: desc,
        tags: tags.split(',').map(s => s.trim()),
        date: new Date().toLocaleDateString()
      },
      content: markdown
    };
    onAdd(newTutorial);
  };

  const handleDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Content Studio</h2>
          <p className="text-slate-500">Draft your clinical tutorials using Markdown and custom Case tags.</p>
        </div>
        <button 
          onClick={handleDownload}
          disabled={!markdown}
          className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          <i className="fa-solid fa-download"></i>
          Export .md File
        </button>
      </div>

      <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tutorial Title</label>
                <input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Asthma Management"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-teal-500 transition-colors"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags (comma separated)</label>
                <input 
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-teal-500 transition-colors"
                />
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Short Description</label>
            <textarea 
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="A brief overview for the library card..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 h-20 outline-none focus:border-teal-500 transition-colors resize-none"
            />
        </div>

        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                Markdown Content
                <span className="text-[10px] text-teal-600 font-bold underline cursor-help">Tag Guide</span>
            </label>
            <textarea 
                value={markdown}
                onChange={e => setMarkdown(e.target.value)}
                placeholder="Paste your tutorial Markdown here..."
                className="w-full bg-slate-900 text-slate-200 font-mono text-sm rounded-2xl p-6 h-96 outline-none border-2 border-transparent focus:border-teal-500 transition-all shadow-inner"
            />
        </div>

        <div className="flex gap-4 pt-4">
            <button 
                onClick={handleSaveToSession}
                disabled={!title || !markdown}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-teal-900/20 transition-all"
            >
                Preview in Session
            </button>
            <button 
                onClick={onCancel}
                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default ContentStudio;
