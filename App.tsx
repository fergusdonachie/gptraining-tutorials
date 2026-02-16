
import React, { useState, useEffect } from 'react';
import { Tutorial } from './types';
import Dashboard from './components/Dashboard';
import TutorialView from './components/TutorialView';
import ContentStudio from './components/ContentStudio';
import Navigation from './components/Navigation';

const GITHUB_CONFIG = {
  owner: "fergusdonachie",
  repo: "gptraining-tutorials",
  path: "tutorials"
};

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'viewer' | 'generator'>('dashboard');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [localDrafts, setLocalDrafts] = useState<Tutorial[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const cachedLocal = localStorage.getItem('gp_studio_drafts');
    if (cachedLocal) {
      setLocalDrafts(JSON.parse(cachedLocal));
    }

    const cachedRemote = localStorage.getItem('gp_tutorials_cache');
    if (cachedRemote) {
      setTutorials(JSON.parse(cachedRemote));
    } else {
      handleSync();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gp_studio_drafts', JSON.stringify(localDrafts));
  }, [localDrafts]);

  const parseMetadata = (content: string, filename: string): Tutorial => {
    const genericTerms = ['main learning', 'management summary', 'cases', 'references', 'learning points', 'introduction', 'summary'];
    const titleMatches = Array.from(content.matchAll(/^(?:#|##)\s+(.*)$/gm));
    
    let title = filename.replace('.md', '').replace(/-/g, ' ');
    for (const match of titleMatches) {
      const candidate = match[1].trim();
      const lowerCandidate = candidate.toLowerCase();
      if (!genericTerms.some(term => lowerCandidate.includes(term))) {
        title = candidate;
        break;
      }
    }

    const lines = content.split('\n').filter(l => l.trim().length > 0 && !l.startsWith('#') && !l.startsWith('<'));
    const description = lines.length > 0 ? lines[0].substring(0, 120) + '...' : 'Clinical reasoning case.';

    let specialty = "General Medicine";
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('gynaecology') || lowerContent.includes('menstrual')) specialty = "Women's Health";
    else if (lowerContent.includes('paeds') || lowerContent.includes('child')) specialty = "Paediatrics";
    else if (lowerContent.includes('depression') || lowerContent.includes('mental')) specialty = "Mental Health";
    else if (lowerContent.includes('cardiology') || lowerContent.includes('heart')) specialty = "Cardiology";
    else if (lowerContent.includes('skin') || lowerContent.includes('rash')) specialty = "Dermatology";
    else if (lowerContent.includes('joint') || lowerContent.includes('back')) specialty = "MSK";

    return {
      id: filename,
      metadata: {
        title,
        description,
        tags: ["Synced"],
        specialty,
        date: new Date().toLocaleDateString()
      },
      content: content
    };
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const repoUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
      const response = await fetch(repoUrl);
      if (!response.ok) throw new Error('Github sync failed');
      const files = await response.json();
      
      const indexFile = files.find((f: any) => f.name === 'index.json');
      let indexData: any[] = [];
      if (indexFile) {
        const indexRes = await fetch(indexFile.download_url);
        indexData = await indexRes.json();
      }

      const mdFiles = files.filter((f: any) => f.name.endsWith('.md'));
      const loadedTutorials = await Promise.all(mdFiles.map(async (file: any) => {
        const contentRes = await fetch(file.download_url);
        const text = await contentRes.text();
        const tutorial = parseMetadata(text, file.name);
        
        const manifestEntry = indexData.find(item => item.contentPath?.includes(file.name) || item.id === file.name.replace('.md', ''));
        if (manifestEntry) {
          tutorial.metadata.title = manifestEntry.metadata.title;
          tutorial.metadata.description = manifestEntry.metadata.description;
          tutorial.metadata.tags = manifestEntry.metadata.tags;
        }
        
        return tutorial;
      }));
      
      setTutorials(loadedTutorials);
      localStorage.setItem('gp_tutorials_cache', JSON.stringify(loadedTutorials));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddDraft = (t: Tutorial) => {
    setLocalDrafts(prev => [t, ...prev]);
    setView('dashboard');
  };

  const handleOpenTutorial = (t: Tutorial) => {
    setSelectedTutorial(t);
    setView('viewer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allTutorials = [...localDrafts, ...tutorials];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation view={view} setView={setView} />
      
      <main className="flex-1">
        {view === 'dashboard' && <Dashboard tutorials={allTutorials} onOpen={handleOpenTutorial} />}
        
        {view === 'viewer' && selectedTutorial && (
          <div className="max-w-7xl mx-auto px-6 py-12">
             <TutorialView tutorial={selectedTutorial} onBack={() => setView('dashboard')} />
          </div>
        )}
        
        {view === 'generator' && (
          <div className="max-w-5xl mx-auto px-6 py-12">
             <ContentStudio onAdd={handleAddDraft} onCancel={() => setView('dashboard')} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-100 py-8 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div>GP Training Case Studio</div>
          <div className="flex gap-6">
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
