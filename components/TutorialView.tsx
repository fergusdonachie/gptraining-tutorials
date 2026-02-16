
import React, { useState } from 'react';
import { Tutorial } from '../types';
import { Callout, Case, Step } from './TutorialComponents';

interface TutorialViewProps {
  tutorial: Tutorial;
  onBack: () => void;
}

const TutorialView: React.FC<TutorialViewProps> = ({ tutorial, onBack }) => {
  // A simple way to parse the custom tags in our markdown string
  // For a production app, we would use a proper markdown library with a custom plugin
  // Here we'll simulate the rendering by splitting the content
  
  const renderContent = (content: string) => {
    const parts = content.split(/(<Callout|<Case|<\/Case>|<\/Callout>|## |---)/);
    let result: React.ReactNode[] = [];
    let currentCase: { title: string; steps: any[] } | null = null;
    let currentCallout: { type: string; title: string; content: string } | null = null;

    // This is a simplified manual parser for the provided structure
    // We'll use regex to extract properties from tags
    const lines = content.split('\n');
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (line.startsWith('<Callout')) {
        const typeMatch = line.match(/type="([^"]+)"/);
        const titleMatch = line.match(/title="([^"]+)"/);
        const type = typeMatch ? typeMatch[1] : 'note';
        const title = titleMatch ? titleMatch[1] : '';
        let calloutContent = [];
        i++;
        while (i < lines.length && !lines[i].includes('</Callout>')) {
          calloutContent.push(lines[i]);
          i++;
        }
        result.push(<Callout key={i} type={type as any} title={title}>{calloutContent.join('\n')}</Callout>);
      } 
      else if (line.startsWith('<Case')) {
        const titleMatch = line.match(/title="([^"]+)"/);
        const title = titleMatch ? titleMatch[1] : '';
        let caseLines = [];
        i++;
        while (i < lines.length && !lines[i].includes('</Case>')) {
          caseLines.push(lines[i]);
          i++;
        }
        
        // Parse steps inside case
        const caseContent = caseLines.join('\n');
        const stepBlocks = caseContent.split(/<Step|<\/Step>/);
        const steps: any[] = [];
        
        for (let j = 0; j < stepBlocks.length; j++) {
          const block = stepBlocks[j].trim();
          if (block.startsWith('title=')) {
            const stepTitleMatch = block.match(/title="([^"]+)"/);
            const stepOpenMatch = block.match(/open/);
            const stepTitle = stepTitleMatch ? stepTitleMatch[1] : '';
            const stepContent = block.split('>').slice(1).join('>');
            steps.push({ title: stepTitle, content: stepContent, open: !!stepOpenMatch });
          }
        }
        
        result.push(<Case key={i} title={title} steps={steps} />);
      }
      else if (line.startsWith('## ')) {
        result.push(<h2 key={i} className="text-2xl font-bold text-slate-800 mt-12 mb-4 border-b border-slate-100 pb-2">{line.replace('## ', '')}</h2>);
      }
      else if (line.startsWith('- ')) {
        result.push(<li key={i} className="ml-4 mb-2 text-slate-600">{line.replace('- ', '')}</li>);
      }
      else if (line.length > 0 && !line.startsWith('<') && !line.startsWith('---')) {
        result.push(<p key={i} className="text-slate-600 leading-relaxed mb-4">{line}</p>);
      }
      
      i++;
    }
    
    return result;
  };

  return (
    <div className="animate-in fade-in duration-500">
      <button 
        onClick={onBack}
        className="mb-8 text-sm text-slate-500 hover:text-teal-600 flex items-center gap-2 transition-colors"
      >
        <i className="fa-solid fa-chevron-left text-[10px]"></i>
        Back to Library
      </button>

      <div className="mb-12">
        <div className="flex flex-wrap gap-2 mb-4">
          {tutorial.metadata.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-teal-50 text-teal-600 text-[10px] rounded uppercase font-bold tracking-tight">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{tutorial.metadata.title}</h1>
        <p className="text-lg text-slate-500 leading-relaxed italic border-l-4 border-slate-200 pl-6 py-2 bg-slate-50/50 rounded-r-xl">
          {tutorial.metadata.description}
        </p>
      </div>

      <div className="tutorial-content pb-24">
        {renderContent(tutorial.content)}
      </div>
    </div>
  );
};

export default TutorialView;
