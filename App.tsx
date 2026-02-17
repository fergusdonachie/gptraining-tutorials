
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

const CACHE_KEYS = {
  DRAFTS: 'gp_studio_drafts_v13',
  TUTORIALS: 'gp_tutorials_cache_v13'
};

const DEFAULT_TUTORIAL_CONTENT = `
---
title: Heavy Menstrual Bleeding (Menorrhagia)
description: Assessment of HMB, initial investigations, and the NG88 stepwise management approach.
specialty: Women's Health
tags: [Gynaecology, Primary Care, NG88]
date: 2026-02-15
---

# Clinical Summary

> **Main Learning Points**
> * **History:** Quantify bleeding (flooding, clots), check impact on quality of life, and screen for red flags (PCB/IMB).
> * **Assessment:** Screen for anaemia and red flags. Speculum if IMB/PCB or cervical concerns.
> * **Management:** Follow **NG88 stepwise approach**. Mirena (LNG-IUS) is 1st line if acceptable.
> * **Safety Net:** Always arrange follow-up to assess response and check Hb.

## Case: The "Tired All The Time" Patient

This is a 10-minute consultation in a busy morning surgery. The patient is known to the practice but hasn't attended in two years. You have her records open on the screen.

### Step 1: Presentation
**Patient:** Sarah, 29-year-old female.
**Complaint:** "I'm just so exhausted, doctor. My periods have become unmanageable."

She describes cycles that leave her feeling "drained". She is changing protection every 2 hours on days 1-3.

> **Trainer Guidance**
> Ask the trainee to specifically quantify "heavy". Look for history of flooding, clots >1 inch, or need for double protection. Check for symptoms of anaemia (SOB, fatigue).

### Step 2: Detailed History
* **Cycle:** Regular 28-day cycle, bleeding lasts 7 days.
* **Pain:** Moderate cramping, managed with ibuprofen.
* **Red Flags:** No Intermenstrual Bleeding (IMB), No Post-coital Bleeding (PCB). Smear is up to date and normal.
* **Contraception:** Currently using condoms. Not seeking pregnancy.
* **Meds:** None. No family history of bleeding disorders.

> **Trainer Guidance**
> Discuss the differential diagnosis here. Since there is no IMB/PCB and the cervix is normal (assumed), structural pathology is less likely, but fibroids are possible.
> *Ask Trainee:* What is the first-line investigation? (FBC). Do we need an ultrasound immediately? (Not usually, unless mass felt or pharm treatment fails).

### Step 3: Examination & Results
**Abdominal Exam:** Soft, non-tender. No palpable uterus.
**Speculum:** Not strictly indicated if history is low risk (no IMB/PCB), but performed: Normal cervix.
**Investigations:**
* **FBC:** Hb 102 g/L (Microcytic). Ferritin 8.
* **Pregnancy Test:** Negative.
* **Coagulation:** Not indicated (no suggestive history).

> **Trainer Guidance**
> Management Planning Discussion:
> 1. **Anaemia:** Needs iron replacement.
> 2. **HMB Treatment:** Discuss NG88 hierarchy.
> * 1st Line: LNG-IUS (Mirena) - *Most effective*.
> * 2nd Line (Non-hormonal): Tranexamic Acid + NSAIDs.
> * 2nd Line (Hormonal): COCP or Oral Progestogens.

### Step 4: Outcome
Sarah declines the Coil (LNG-IUS) as she dislikes the idea of a procedure. She opts for **Tranexamic Acid** (1g TDS during menses) and **Mefenamic Acid**. She starts Ferrous Fumarate.

**Plan:** Review in 3 months to check bleeding control and repeat FBC.
`;

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'viewer' | 'generator'>('dashboard');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [localDrafts, setLocalDrafts] = useState<Tutorial[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const parseMetadata = (content: string, filename: string): Tutorial => {
    const trimmedContent = content.trim();
    const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*/;
    const match = trimmedContent.match(frontmatterRegex);
    
    let metadata: any = {
      title: filename.replace('.md', '').replace(/-/g, ' '),
      description: 'Clinical reasoning case.',
      tags: ["Synced"],
      specialty: "General Medicine",
      date: new Date().toLocaleDateString()
    };

    if (match) {
      const yaml = match[1];
      const getValue = (key: string) => {
        const r = new RegExp(`${key}:\\s*(.*)`, 'i');
        const m = yaml.match(r);
        return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
      };

      const title = getValue('title');
      const desc = getValue('description');
      const spec = getValue('specialty');
      const date = getValue('date');
      const tagsStr = getValue('tags');

      if (title) metadata.title = title;
      if (desc) metadata.description = desc;
      if (spec) metadata.specialty = spec;
      if (date) metadata.date = date;
      if (tagsStr) {
        metadata.tags = tagsStr.replace(/[\[\]]/g, '').split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
      }
    }

    return {
      id: filename,
      metadata,
      content: trimmedContent
    };
  };

  useEffect(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('gp_') && key !== CACHE_KEYS.DRAFTS && key !== CACHE_KEYS.TUTORIALS) {
        localStorage.removeItem(key);
      }
    });

    const cachedLocal = localStorage.getItem(CACHE_KEYS.DRAFTS);
    if (cachedLocal) {
      setLocalDrafts(JSON.parse(cachedLocal));
    }

    const cachedRemoteString = localStorage.getItem(CACHE_KEYS.TUTORIALS);
    if (cachedRemoteString) {
      setTutorials(JSON.parse(cachedRemoteString));
    } else {
      handleSync();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CACHE_KEYS.DRAFTS, JSON.stringify(localDrafts));
  }, [localDrafts]);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const repoUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
      const response = await fetch(repoUrl);
      if (!response.ok) throw new Error('Github sync failed');
      const files = await response.json();
      
      const mdFiles = files.filter((f: any) => f.name.endsWith('.md'));
      const loadedTutorials = await Promise.all(mdFiles.map(async (file: any) => {
        const contentRes = await fetch(`${file.download_url}?t=${Date.now()}`);
        const text = await contentRes.text();
        return parseMetadata(text, file.name);
      }));
      
      setTutorials(loadedTutorials);
      localStorage.setItem(CACHE_KEYS.TUTORIALS, JSON.stringify(loadedTutorials));
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
          <div className="max-w-4xl mx-auto px-6 py-12">
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
          <div className="flex gap-6 items-center">
             <button onClick={handleSync} disabled={isSyncing} className="hover:text-slate-900 transition-colors disabled:opacity-50">
                {isSyncing ? 'Syncing...' : 'Sync GitHub'}
             </button>
            <span>v1.13.0 (Clean Layout)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
