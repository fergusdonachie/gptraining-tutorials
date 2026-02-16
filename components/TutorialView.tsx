
import React from 'react';
import { Tutorial } from '../types';
import { Callout, Case } from './TutorialComponents';

interface TutorialViewProps {
  tutorial: Tutorial;
  onBack: () => void;
}

const TutorialView: React.FC<TutorialViewProps> = ({ tutorial, onBack }) => {
  const renderContent = (content: string) => {
    const blocks: React.ReactNode[] = [];
    let remaining = content;

    const getTagContent = (tagName: string, source: string) => {
      const openTag = `<${tagName}`;
      const closeTag = `</${tagName}>`;
      const startIdx = source.indexOf(openTag);
      if (startIdx === -1) return null;
      
      const endTagIdx = source.indexOf(closeTag, startIdx);
      if (endTagIdx === -1) return null;
      
      const fullTag = source.substring(startIdx, endTagIdx + closeTag.length);
      const innerContent = source.substring(source.indexOf('>', startIdx) + 1, endTagIdx);
      
      return { fullTag, innerContent, startIdx };
    };

    const isHeaderRepetitive = (text: string) => {
      const clean = text.replace(/##\s+/, '').toLowerCase().trim();
      const title = tutorial.metadata.title.toLowerCase().trim();
      return clean === title || title.includes(clean) || clean.includes(title);
    };

    while (remaining.length > 0) {
      const nextCallout = getTagContent('Callout', remaining);
      const nextCase = getTagContent('Case', remaining);
      
      let earliest: { type: 'Callout' | 'Case', data: any } | null = null;
      if (nextCallout && (!nextCase || nextCallout.startIdx < nextCase.startIdx)) {
        earliest = { type: 'Callout', data: nextCallout };
      } else if (nextCase) {
        earliest = { type: 'Case', data: nextCase };
      }

      if (earliest) {
        const preText = remaining.substring(0, earliest.data.startIdx).trim();
        if (preText) {
          preText.split('\n').forEach((line, idx) => {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('## ') && !isHeaderRepetitive(cleanLine)) {
              blocks.push(<h2 key={`h2-${idx}-${remaining.length}`} className="text-2xl font-extrabold text-slate-800 mt-12 mb-6 tracking-tight">{cleanLine.replace('## ', '')}</h2>);
            } else if (cleanLine.startsWith('- ')) {
              blocks.push(<li key={`li-${idx}-${remaining.length}`} className="ml-5 mb-3 text-slate-600 font-medium text-lg list-disc pl-2">{cleanLine.replace('- ', '')}</li>);
            } else if (cleanLine.length > 0 && !cleanLine.startsWith('## ')) {
              // Replace bold markers with span to ensure better rendering if needed, but standard bold usually works
              blocks.push(<p key={`p-${idx}-${remaining.length}`} className="text-slate-500 font-medium text-lg leading-relaxed mb-6">{cleanLine}</p>);
            }
          });
        }

        const tagHeader = remaining.substring(earliest.data.startIdx, remaining.indexOf('>', earliest.data.startIdx));
        
        if (earliest.type === 'Callout') {
          const type = (tagHeader.match(/type="([^"]+)"/) || [])[1] || 'note';
          const title = (tagHeader.match(/title="([^"]+)"/) || [])[1] || '';
          
          blocks.push(
            <Callout key={`callout-${remaining.length}`} type={type as any} title={isHeaderRepetitive(title) ? undefined : title}>
              {earliest.data.innerContent.trim()}
            </Callout>
          );
        } else if (earliest.type === 'Case') {
          const title = (tagHeader.match(/title="([^"]+)"/) || [])[1] || 'Clinical Case';
          const age = (tagHeader.match(/age="([^"]+)"/) || [])[1];
          const sex = (tagHeader.match(/sex="([^"]+)"/) || [])[1];
          
          const steps: any[] = [];
          const stepMatches = Array.from(earliest.data.innerContent.matchAll(/<Step title="([^"]+)"[^>]*>([\s\S]*?)<\/Step>/g));
          stepMatches.forEach((m: any) => {
            steps.push({ title: m[1], content: m[2].trim() });
          });

          blocks.push(
            <Case 
              key={`case-${remaining.length}`} 
              title={title} 
              steps={steps} 
              patientProfile={{ age, sex }} 
            />
          );
        }

        remaining = remaining.substring(earliest.data.startIdx + earliest.data.fullTag.length);
      } else {
        remaining.split('\n').forEach((line, idx) => {
          const cleanLine = line.trim();
          if (cleanLine.startsWith('## ') && !isHeaderRepetitive(cleanLine)) {
            blocks.push(<h2 key={`h2-end-${idx}`} className="text-2xl font-extrabold text-slate-800 mt-12 mb-6 tracking-tight">{cleanLine.replace('## ', '')}</h2>);
          } else if (cleanLine.startsWith('- ')) {
            blocks.push(<li key={`li-end-${idx}`} className="ml-5 mb-3 text-slate-600 font-medium text-lg list-disc pl-2">{cleanLine.replace('- ', '')}</li>);
          } else if (cleanLine.length > 0 && !cleanLine.startsWith('## ')) {
            blocks.push(<p key={`p-end-${idx}`} className="text-slate-500 font-medium text-lg leading-relaxed mb-6">{cleanLine}</p>);
          }
        });
        remaining = '';
      }
    }
    
    return blocks;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-40">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-10 group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all"
        >
          <i className="fa-solid fa-arrow-left text-[8px]"></i>
          Back to Library
        </button>

        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {tutorial.metadata.specialty}
            </span>
            <div className="h-px w-8 bg-slate-200"></div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {tutorial.metadata.date}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 mb-8 leading-tight">
            {tutorial.metadata.title}
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
            {tutorial.metadata.description}
          </p>
        </header>

        <article className="tutorial-content border-t border-slate-100 pt-12">
          {renderContent(tutorial.content)}
        </article>
        
        <div className="mt-24 p-12 bg-slate-50 rounded-[32px] text-center border border-slate-100">
          <h3 className="text-slate-800 text-2xl font-bold tracking-tight mb-3">Tutorial Finished</h3>
          <p className="text-slate-400 mb-8 font-medium">Your progress has been recorded in your session.</p>
          <button 
            onClick={onBack}
            className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-lg"
          >
            Explore More Topics
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialView;
