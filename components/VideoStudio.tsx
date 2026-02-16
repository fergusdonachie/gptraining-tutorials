
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    setHasApiKey(hasKey);
  };

  const handleSelectKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    // Fixed: Assume selection success to avoid race condition and allow immediate app access
    setHasApiKey(true);
  };

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setStatus('Initializing Neural Network...');

    try {
      // Fixed: Always create a fresh instance with direct process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      setStatus('Synthesizing frames (this takes a few minutes)...');
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        // Fixed: Append API key to the fetch request for video content
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      }
    } catch (error: any) {
      console.error('Video error:', error);
      // Fixed: Reset key selection state if project/key not found
      if (error.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
      }
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  if (!hasApiKey) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#111] rounded-3xl border border-white/5 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mb-6">
          <i className="fa-solid fa-key text-3xl"></i>
        </div>
        <h2 className="text-2xl font-bold mb-4">Professional Access Required</h2>
        <p className="max-w-md text-gray-400 mb-8 leading-relaxed">
          Veo video generation requires a specific Billing-enabled API Key from a paid GCP project.
        </p>
        <button
          onClick={handleSelectKey}
          className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-amber-900/20"
        >
          Select Professional API Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 text-sm text-blue-400 hover:underline"
        >
          Learn about Billing Setup
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <i className="fa-solid fa-clapperboard text-amber-400"></i>
          Motion Engine
        </h2>
        <p className="text-gray-400 text-sm mt-1">High-fidelity cinematics from simple descriptions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111] p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Story Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the action, style, and camera movement..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 h-48 outline-none focus:border-amber-500/50 transition-all resize-none text-sm"
            />
          </div>
          
          <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Resolution</p>
              <p className="text-sm font-medium">1080p Full HD</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Aspect Ratio</p>
              <p className="text-sm font-medium">16:9 Landscape</p>
            </div>
          </div>

          <button
            onClick={generateVideo}
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                Rendering Motion...
              </>
            ) : (
              <>
                <i className="fa-solid fa-play"></i>
                Synthesize Video
              </>
            )}
          </button>
          
          {status && (
            <p className="text-xs text-center text-amber-500/70 animate-pulse">{status}</p>
          )}
        </div>

        <div className="bg-[#050505] rounded-3xl border border-white/5 aspect-video flex flex-col items-center justify-center overflow-hidden relative">
          {videoUrl ? (
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              className="w-full h-full object-contain"
            />
          ) : isGenerating ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Neural synthesis in progress...</p>
            </div>
          ) : (
            <div className="text-center opacity-30 p-12">
              <i className="fa-solid fa-video text-6xl mb-6 block"></i>
              <p>Preview will appear here after generation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
