
import React, { useState, useEffect } from 'react';
import { Tutorial } from './types';
import Dashboard from './components/Dashboard';
import TutorialView from './components/TutorialView';
import ContentStudio from './components/ContentStudio';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'viewer' | 'studio'>('dashboard');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [tutorials, setTutorials] = useState<(Tutorial & { contentPath?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tutorial index on mount
  useEffect(() => {
    const fetchIndex = async () => {
      try {
        const response = await fetch('tutorials/index.json');
        if (!response.ok) throw new Error('Failed to fetch registry');
        const data = await response.json();
        setTutorials(data);
      } catch (err) {
        console.error('Error loading tutorials index:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIndex();
  }, []);

  const handleOpenTutorial = async (t: Tutorial & { contentPath?: string }) => {
    // If content is already loaded (from a local session or previous fetch)
    if (t.content) {
      setSelectedTutorial(t);
      setView('viewer');
      return;
    }

    // Otherwise, fetch the markdown file
    if (t.contentPath) {
      setIsLoading(true);
      try {
        const response = await fetch(t.contentPath);
        const text = await response.text();
        const updatedTutorial = { ...t, content: text };
        
        // Update local state so we don't fetch it again this session
        setTutorials(prev => prev.map(item => item.id === t.id ? updatedTutorial : item));
        setSelectedTutorial(updatedTutorial);
        setView('viewer');
      } catch (err) {
        console.error('Error loading markdown file:', err);
        alert('Could not load tutorial file.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddTutorial = (t: Tutorial) => {
    setTutorials(prev => [...prev, t]);
    setView('dashboard');
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar view={view} setView={setView} />
      <main className="flex-1 overflow-y-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-teal-700 animate-pulse">Loading Clinical Content...</p>
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
