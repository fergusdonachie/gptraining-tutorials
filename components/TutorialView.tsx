
import React, { useMemo } from 'react';
import { Tutorial } from '../types';
import { Case, Callout } from './TutorialComponents';

interface TutorialViewProps {
  tutorial: Tutorial;
  onBack: () => void;
}

interface Step {
  title: string;
  lines: string[];
  trainerNotes: string[];
}

interface CaseBlock {
  title: string;
  introduction: string[];
  steps: Step[];
}

const TutorialView: React.FC<TutorialViewProps> = ({ tutorial, onBack }) => {
  
  const { intro, cases } = useMemo(() => {
    const rawText = tutorial.content
      .replace(/^---\s*[\r\n]+[\s\S]*?[\r\n]+---\s*/, '')
      .trim();
      
    const lines = rawText.split(/\r?\n/);

    const introLines: string[] = [];
    const casesList: CaseBlock[] = [];
    
    let currentCase: CaseBlock | null = null;
    let currentStep: Step | null = null;
    let inIntro = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimEnd();
      const trimmed = line.trim();

      if (inIntro && !trimmed && introLines.length === 0) continue;

      if (trimmed.startsWith('## ')) {
        if (currentCase) {
          if (currentStep) currentCase.steps.push(currentStep);
          casesList.push(currentCase);
        }
        
        inIntro = false;
        currentCase = {
          title: trimmed.replace(/^##\s+/, '').replace(/^Case:\s*/i, ''),
          introduction: [],
          steps: []
        };
        currentStep = null;
        continue;
      }

      if (trimmed.startsWith('### ')) {
        if (currentCase) {
          if (currentStep) currentCase.steps.push(currentStep);
          
          currentStep = {
            title: trimmed.replace(/^###\s+/, '').replace(/^(Step|Part)\s*\d*[:.]\s*/i, ''),
            lines: [],
            trainerNotes: []
          };
        }
        continue;
      }

      if (inIntro) {
        introLines.push(line);
      } else if (currentCase && currentStep) {
        if (trimmed.toLowerCase().startsWith('> **trainer guidance') || trimmed.toLowerCase().startsWith('> ** trainer guidance')) {
          const content = trimmed.replace(/^>\s*\*\*Trainer Guidance\*\*/i, '').replace(/^>\s*/, '');
          if(content) currentStep.trainerNotes.push(content);
        } else if (currentStep.trainerNotes.length > 0 && trimmed.startsWith('>')) {
          currentStep.trainerNotes.push(trimmed.replace(/^>\s*/, ''));
        } else if (currentStep.trainerNotes.length > 0 && trimmed === '') {
           currentStep.trainerNotes.push('');
        } else {
           currentStep.lines.push(line);
        }
      } else if (currentCase) {
         currentCase.introduction.push(line);
      }
    }

    if (currentCase) {
      if (currentStep) currentCase.steps.push(currentStep);
      casesList.push(currentCase);
    }

    return { intro: introLines, cases: casesList };
  }, [tutorial.content]);

  const processFormat = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderContent = (lines: string[]): React.ReactNode[] => {
    const text = lines.join('\n');
    const blocks = text.split(/\n\n+/);

    return blocks.map((block, i) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('# ')) {
        return <h2 key={i} className="text-2xl font-black text-slate-900 mt-8 mb-4 tracking-tight border-b border-slate-100 pb-2">{processFormat(trimmed.replace(/^#\s+/, ''))}</h2>;
      }
      
      if (trimmed.startsWith('## ')) {
        return <h3 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-3 tracking-tight">{processFormat(trimmed.replace(/^##\s+/, ''))}</h3>;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter(l => l.trim().match(/^[-*]\s/));
        return (
          <ul key={i} className="mb-4 space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className="ml-4 list-disc pl-2 text-slate-700 leading-relaxed font-medium">
                {processFormat(item.replace(/^[-*]\s/, ''))}
              </li>
            ))}
          </ul>
        );
      }

      if (trimmed.startsWith('>')) {
        const rawLines = block.split('\n');
        const firstLineClean = rawLines[0].replace(/^>\s?/, '').trim();
        const titleMatch = firstLineClean.match(/^\*\*(.*?)\*\*$/);
        
        let title = undefined;
        let contentLines: string[] = [];

        if (titleMatch) {
            title = titleMatch[1];
            contentLines = rawLines.slice(1).map(l => l.replace(/^>\s?/, ''));
        } else {
            contentLines = rawLines.map(l => l.replace(/^>\s?/, ''));
        }
        
        if (title) {
             return <Callout key={i} title={title}>{renderContent(contentLines)}</Callout>;
        }
        
        return (
          <div key={i} className="border-l-4 border-[#FF5C35] bg-orange-50/50 p-4 my-6 rounded-r-xl italic text-slate-700 font-medium">
             {renderContent(contentLines)}
          </div>
        );
      }

      return <p key={i} className="mb-4 text-slate-700 leading-relaxed text-lg font-medium">{processFormat(trimmed)}</p>;
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-40">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all"
        >
          <i className="fa-solid fa-arrow-left text-[8px]"></i>
          Back to Library
        </button>

        <header className="mb-12 border-b border-slate-100 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-slate-900 text-white text-[9px] rounded-md uppercase font-black tracking-widest">
              {tutorial.metadata.specialty}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {tutorial.metadata.date}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-6 leading-[1.1]">
            {tutorial.metadata.title}
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">
            {tutorial.metadata.description}
          </p>
        </header>

        {/* Intro Section */}
        <div className="mb-16">
          {renderContent(intro)}
        </div>

        {/* Content Sections & Cases */}
        <div className="space-y-32">
          {cases.map((caseBlock, idx) => {
            const hasIntroText = caseBlock.introduction.some(line => line.trim().length > 0);
            
            if (caseBlock.steps.length === 0) {
              if (!hasIntroText && !caseBlock.title) return null;
              
              return (
                <section key={idx} className="mb-16">
                   <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-8 pb-4 border-b border-slate-100">
                     {caseBlock.title}
                   </h2>
                   <div className="prose prose-slate prose-lg max-w-none">
                     {renderContent(caseBlock.introduction)}
                   </div>
                </section>
              );
            }

            return (
              <div key={idx}>
                {hasIntroText && (
                  <div className="mb-12 bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Scenario Context</span>
                     {renderContent(caseBlock.introduction)}
                  </div>
                )}
                
                <Case 
                  title={caseBlock.title}
                  steps={caseBlock.steps.map(s => ({
                    title: s.title,
                    content: renderContent(s.lines),
                    trainerNotes: s.trainerNotes.length > 0 ? renderContent(s.trainerNotes) : null
                  }))}
                />
              </div>
            );
          })}
        </div>
        
        <div className="mt-20 pt-12 border-t border-slate-100 text-center">
            <button onClick={onBack} className="text-slate-400 hover:text-slate-900 text-sm font-bold uppercase tracking-widest transition-colors">
                Return to Index
            </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialView;
