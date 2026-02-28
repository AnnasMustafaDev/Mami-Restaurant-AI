import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Globe } from 'lucide-react';
import { sendChatMessage, textToSpeech } from '../../services/api';
import type { ChatMessage } from '../../hooks/useChat';

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';
type VoiceLang = 'en-US' | 'de-DE';

interface VoiceOrbProps {
  ensureSession: (source?: string) => Promise<string>;
  addMessage: (msg: ChatMessage) => void;
}

// Browser Speech Recognition types
interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

export default function VoiceOrb({ ensureSession, addMessage }: VoiceOrbProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [_transcript, setTranscript] = useState('');
  const [_response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [lang, setLang] = useState<VoiceLang>('en-US');
  const sessionIdRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount — cancel everything
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

  const stopAll = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setState('idle');
    setTranscript('');
    setResponse('');
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    setResponse('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      setError('Speech recognition not supported in this browser. Try Chrome.');
      return;
    }

    // Use shared session
    if (!sessionIdRef.current) {
      const sid = await ensureSession('voice');
      if (!mountedRef.current) return;
      sessionIdRef.current = sid;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      if (!mountedRef.current) return;
      setState('listening');
    };

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      if (!mountedRef.current) return;
      setTranscript(text);
      setState('thinking');

      // Add user message to shared chat
      addMessage({ id: `user-voice-${Date.now()}`, role: 'user', content: text });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const llmResponse = await sendChatMessage(sessionIdRef.current!, text);
        if (!mountedRef.current || controller.signal.aborted) return;

        setResponse(llmResponse.content);
        setState('speaking');

        // Add assistant message to shared chat
        addMessage({ id: `assistant-voice-${llmResponse.id}`, role: 'assistant', content: llmResponse.content });

        // Get TTS audio
        const audioBlob = await textToSpeech(llmResponse.content);
        if (!mountedRef.current || controller.signal.aborted) return;

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          if (mountedRef.current) setState('idle');
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          if (mountedRef.current) {
            setError('Failed to play audio');
            setState('idle');
          }
        };

        if (!mountedRef.current || controller.signal.aborted) {
          URL.revokeObjectURL(audioUrl);
          return;
        }

        await audio.play();
      } catch (err: any) {
        if (mountedRef.current) {
          const msg = err?.response?.data?.detail || err?.message || 'Unknown error';
          console.error('VoiceOrb error:', err);
          setError(`Voice error: ${msg}`);
          setState('idle');
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (!mountedRef.current) return;
      if (event.error === 'no-speech') {
        setError("I didn't catch that. Tap and try again.");
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow mic access.');
      } else {
        setError(`Speech error: ${event.error}`);
      }
      setState('idle');
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        recognitionRef.current = null;
      }
    };

    recognition.start();
  }, [lang, ensureSession, addMessage]);

  const handleToggle = () => {
    if (state === 'idle') {
      startListening();
    } else {
      stopAll();
    }
  };

  const stateConfig = {
    idle: { label: 'Tap to speak', color: 'bg-wine', icon: Mic },
    listening: { label: 'Listening...', color: 'bg-wine', icon: Mic },
    thinking: { label: 'Sofia is thinking...', color: 'bg-gold', icon: Volume2 },
    speaking: { label: 'Sofia is speaking', color: 'bg-olive', icon: Volume2 },
  };

  const { label, color, icon: Icon } = stateConfig[state];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Orb */}
      <button
        onClick={handleToggle}
        className={`relative w-20 h-20 ${color} text-white rounded-full shadow-lg transition-all hover:scale-105 flex items-center justify-center`}
      >
        {state === 'listening' && (
          <>
            <span className="absolute inset-0 rounded-full bg-wine/30 animate-ping" />
            <span className="absolute -inset-2 rounded-full border-2 border-wine/20 animate-pulse" />
          </>
        )}
        {state === 'thinking' && (
          <span className="absolute -inset-2 rounded-full border-2 border-gold/30 animate-pulse" />
        )}
        {state === 'speaking' && (
          <span className="absolute -inset-2 rounded-full border-2 border-olive/30 animate-pulse" />
        )}

        <Icon size={28} />

        {(state === 'listening' || state === 'speaking') && (
          <div className="absolute -bottom-6 flex items-end gap-0.5 h-4">
            {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full ${state === 'listening' ? 'bg-wine/60' : 'bg-olive/60'}`}
                style={{
                  height: `${h * 3}px`,
                  animation: `barPulse 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                }}
              />
            ))}
          </div>
        )}
      </button>

      {/* State label */}
      <p className="text-xs text-warm-gray mt-1">{label}</p>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 text-error text-xs max-w-[240px] text-center">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-3">
        {state !== 'idle' && (
          <button
            onClick={stopAll}
            className="flex items-center gap-1 text-xs text-error hover:text-error/80 transition-colors"
          >
            <MicOff size={14} />
            Stop
          </button>
        )}
        {state === 'idle' && (
          <button
            onClick={() => setLang(lang === 'en-US' ? 'de-DE' : 'en-US')}
            className="flex items-center gap-1 text-xs text-warm-gray hover:text-wine transition-colors"
          >
            <Globe size={14} />
            {lang === 'en-US' ? 'EN' : 'DE'}
          </button>
        )}
      </div>

      {!supported && (
        <p className="text-xs text-error/80 text-center max-w-[220px]">
          Use Chrome or Edge for voice support
        </p>
      )}

      <style>{`
        @keyframes barPulse {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
