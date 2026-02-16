
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GeneratedImage } from '../types';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      // Fixed: Always use direct process.env.API_KEY reference for SDK initialization
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      let imageUrl = '';
      // Fixed: Correctly iterate through parts to find the image part
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        const newImg: GeneratedImage = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt: prompt,
          timestamp: new Date()
        };
        setGallery(prev => [newImg, ...prev]);
        setPrompt('');
      }
    } catch (error) {
      console.error('Image gen error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <i className="fa-solid fa-palette text-purple-400"></i>
          Visual Studio
        </h2>
        <p className="text-gray-400 text-sm mt-1">Transform concepts into pixel-perfect reality.</p>
      </header>

      <div className="bg-[#111] p-6 rounded-3xl border border-white/5 space-y-4 shadow-xl">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A cyberpunk city floating in neon clouds, ultra-detailed, cinematic lighting..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 h-32 outline-none focus:border-purple-500/50 transition-all resize-none text-sm"
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10">1:1 Ratio</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10">Standard Def</span>
          </div>
          <button
            onClick={generateImage}
            disabled={!prompt.trim() || isGenerating}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-2xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20"
          >
            {isGenerating ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                Visualizing...
              </>
            ) : (
              <>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map((img) => (
          <div key={img.id} className="group relative aspect-square bg-[#111] rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all">
            <img src={img.url} alt={img.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
              <p className="text-xs line-clamp-2 text-gray-200 mb-2">{img.prompt}</p>
              <button className="w-full bg-white/10 backdrop-blur-md py-2 rounded-xl text-xs font-semibold hover:bg-white/20 transition-colors">
                Download Assets
              </button>
            </div>
          </div>
        ))}
        {gallery.length === 0 && !isGenerating && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <i className="fa-solid fa-images text-4xl text-gray-700 mb-4 block"></i>
            <p className="text-gray-500">No images generated yet. Start dreaming.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageStudio;
