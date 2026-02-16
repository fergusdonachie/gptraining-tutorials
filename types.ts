
export interface TutorialMetadata {
  title: string;
  description: string;
  tags: string[];
  date: string;
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

// Fixed: Added missing Message interface
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Fixed: Added missing GeneratedImage interface
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}
