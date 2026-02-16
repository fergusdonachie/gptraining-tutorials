
import React, { useState, useEffect } from 'react';
import { Tutorial } from './types';
import Dashboard from './components/Dashboard';
import TutorialView from './components/TutorialView';
import ContentStudio from './components/ContentStudio';
import Sidebar from './components/Sidebar';

// Configuration - Usually these would be in an environment variable or a config file
const GITHUB_CONFIG = {
  owner: "fergusdonachie", // User should update this
  repo: "gptraining-tutorials",       // User should update this
  path: "tutorials"
};

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'viewer' | 'studio'>('dashboard');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load cached tutorials from LocalStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('gp_tutorials_cache');
    if (cached) {
      setTutorials(JSON.parse(cached));
    } else {
      handleSync(); // Auto-sync on first load if empty
    }
  }, []);

  const parseMetadata = (content: string, filename: string): Tutorial => {
    // Basic extraction: Find the first # or ## for title
    const titleMatch = content.match(/^(?:#|##)\s+(.*)$/m);
    const title = titleMatch ? titleMatch[1] : filename.replace('.md', '');
    
    // Find the first paragraph as description
    const lines = content.split('\n').filter(l => l.trim().length > 0 && !l.startsWith('#') && !l.startsWith('<'));
    const description = lines.length > 0 ? lines[0].substring(0, 150) + '...' : 'No description provided.';

    return {
      id: filename,
      metadata: {
        title,
        description,
        tags: ["Primary Care", "Clinical"], // Could be parsed from tags: line if added to MD
        date: new Date().toLocaleDateString()
      },
      content: content
    };
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      // 1. Fetch the file list from GitHub
      // Note: In production, you might want to use a personal access token if hitting rate limits
      const repoUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
      const response = await fetch(repoUrl);
      
      if (!response.ok) {
        // Fallback to local index.json if GitHub API fails or is unconfigured
        const localIdx = await fetch('tutorials/index.json');
        if (localIdx.ok) {
          const data = await localIdx.json();
          setTutorials(data);
          return;
        }
        throw new Error('Could not find tutorials via GitHub or local index.');
      }

      const files = await response.json();
      const mdFiles = files.filter((f: any) => f.name.endsWith('.md'));

      // 2. Fetch each file's content
      const loadedTutorials = await Promise.all(mdFiles.map(async (file: any) => {
        const contentRes = await fetch(file.download_url);
        const text = await contentRes.text();
        return parseMetadata(text, file.name);
      }));

      setTutorials(loadedTutorials);
      localStorage.setItem('gp_tutorials_cache', JSON.stringify(loadedTutorials));
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenTutorial = (t: Tutorial) => {
    setSelectedTutorial(t);
    setView('viewer');
  };

  const handleAddTutorial = (t: Tutorial) => {
    setTutorials(prev => [t, ...prev]);
    setView('dashboard');
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar view={view} setView={setView} isSyncing={isSyncing} onSync={handleSync} />
      <main className="flex-1 overflow-y-auto relative">
        {(isLoading || isSyncing) && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-teal-700 animate-pulse">
                {isSyncing ? 'Syncing with GitHub Library...' : 'Loading Content...'}
              </p>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {view === 'dashboard' && <Dashboard tutorials={tutorials} onOpen={handleOpenTutorial} />}
          {view === 'viewer' && selectedTutorial && <TutorialView tutorial={selectedTutorial} onBack={() => setView('dashboard')} />}
          {view === 'studio' && <ContentStudio onAdd={handleAddTutorial} onCancel={() => setView('dashboard')} />}
        </div>
      </main>
    </div>
  );
};

export default App;
