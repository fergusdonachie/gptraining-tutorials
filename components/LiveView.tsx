
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from '@google/genai';

const LiveView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const intervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const stopSession = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(s => s.close?.());
      sessionPromiseRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
  }, []);

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      // Fixed: Always create instance right before connecting with direct API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Live connected');
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // Fixed: Solely rely on sessionPromise resolves to send data
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev.slice(-4), message.serverContent!.outputTranscription!.text]);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              // Fixed: Track end time of playback queue for gapless audio
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: (e) => console.error('Live error:', e),
          onclose: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: "You are a highly observant AI assistant. You can see the user through the camera and hear them. Respond in a friendly, helpful manner."
        }
      });

      sessionPromiseRef.current = sessionPromise;
      setIsActive(true);

      // Fixed: Synchronized Frame streaming using the session promise
      intervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = videoRef.current.videoWidth || 320;
          canvasRef.current.height = videoRef.current.videoHeight || 240;
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          canvasRef.current.toBlob(async (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => {
                const base64Data = (reader.result as string).split(',')[1];
                // Fixed: Use sessionPromise to prevent stale closure issues
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({
                    media: { data: base64Data, mimeType: 'image/jpeg' }
                  });
                });
              };
            }
          }, 'image/jpeg', 0.6);
        }
      }, 1000);

    } catch (err) {
      console.error('Failed to start live session:', err);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <i className="fa-solid fa-circle-play text-red-500 animate-pulse"></i>
            Contextual Live
          </h2>
          <p className="text-gray-400 text-sm mt-1">Real-time low-latency audio/video bridge.</p>
        </div>
        <button
          onClick={isActive ? stopSession : startSession}
          className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${
            isActive ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-blue-600 text-white'
          }`}
        >
          {isActive ? (
            <><i className="fa-solid fa-stop"></i> Terminate Session</>
          ) : (
            <><i className="fa-solid fa-bolt"></i> Initialize Bridge</>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-[#050505] rounded-3xl border border-white/5 relative overflow-hidden group">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
          />
          <canvas ref={canvasRef} width="320" height="240" className="hidden" />
          
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 via-transparent to-transparent">
            <div className="space-y-2">
              {transcription.map((t, i) => (
                <p key={i} className="text-lg font-medium text-white drop-shadow-lg animate-in slide-in-from-left-4">
                  {t}
                </p>
              ))}
            </div>
          </div>

          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <p className="text-gray-400 font-medium">Camera Feed Offline</p>
            </div>
          )}
        </div>

        <div className="bg-[#111] p-6 rounded-3xl border border-white/5 flex flex-col gap-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Signal Diagnostics</h3>
          
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] p-4 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-gray-400">Connection State</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-500'}`}>
                {isActive ? 'ACTIVE' : 'IDLE'}
              </span>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-gray-400">Latent Buffer</span>
              <span className="text-xs font-mono">142ms</span>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-gray-400">Vocal Synthesizer</span>
              <span className="text-xs font-mono">Puck 2.5</span>
            </div>
          </div>

          <div className="mt-auto p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <p className="text-[10px] text-blue-400/80 leading-relaxed uppercase font-bold mb-2">Instructions</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Toggle the session to begin real-time analysis. Gemini will observe your camera feed and respond to your voice prompts instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveView;
