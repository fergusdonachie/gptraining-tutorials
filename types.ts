
export interface TutorialMetadata {
  title: string;
  description: string;
  tags: string[];
  date: string;
  specialty: string;
  isLocal?: boolean; // Flag to identify user-created drafts
}

export interface Tutorial {
  id: string;
  metadata: TutorialMetadata;
  content: string;
}

export interface CaseStep {
  title: string;
  content: string;
  isOpen: boolean;
}

export interface CaseData {
  title: string;
  steps: CaseStep[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Added GeneratedImage interface required by the ImageStudio component for tracking visual assets
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}
