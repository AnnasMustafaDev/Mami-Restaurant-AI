import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, PhoneOff, Loader2, AlertCircle } from 'lucide-react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useLocalParticipant,
} from '@livekit/components-react';
import { getVoiceToken } from '../../services/api';
import type { ChatMessage } from '../../hooks/useChat';

interface VoiceOrbProps {
  ensureSession: (source?: string) => Promise<string>;
  addMessage: (msg: ChatMessage) => void;
  onStateChange?: (state: string) => void;
}

interface ConnectionDetails {
  token: string;
  url: string;
}

// Maps LiveKit agent states to the parent's SofiaExpression values
const LK_TO_SOFIA: Record<string, string> = {
  disconnected: 'idle',
  connecting:   'thinking',
  initializing: 'thinking',
  listening:    'listening',
  thinking:     'thinking',
  speaking:     'speaking',
};

// ── Inner component (must live inside <LiveKitRoom>) ─────────────────────────
function VoiceOrbInner({ onStateChange }: { onStateChange?: (state: string) => void }) {
  const { state } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);

  // Propagate agent state → Sofia avatar expression
  useEffect(() => {
    onStateChange?.(LK_TO_SOFIA[state] ?? 'idle');
  }, [state, onStateChange]);

  const handleMuteToggle = async () => {
    const next = !isMuted;
    await localParticipant.setMicrophoneEnabled(!next);
    setIsMuted(next);
  };

  const stateLabel: Record<string, string> = {
    disconnected: 'Connecting…',
    connecting:   'Connecting…',
    initializing: 'Starting Sofia…',
    listening:    'Listening…',
    thinking:     'Sofia is thinking…',
    speaking:     'Sofia is speaking',
  };

  const orbColor: Record<string, string> = {
    disconnected: 'bg-warm-gray/40',
    connecting:   'bg-gold/60',
    initializing: 'bg-gold/60',
    listening:    'bg-wine',
    thinking:     'bg-gold',
    speaking:     'bg-olive',
  };

  const isActive   = state === 'listening' || state === 'speaking';
  const isThinking = state === 'thinking'  || state === 'initializing' || state === 'connecting';
  const color = orbColor[state] ?? 'bg-warm-gray/40';
  const label = stateLabel[state] ?? 'Connecting…';

  return (
    <>
      {/* Plays the agent's audio track automatically */}
      <RoomAudioRenderer />

      <div className="flex flex-col items-center gap-3">
        {/* ── Orb ── */}
        <div
          className={`relative w-20 h-20 ${color} text-white rounded-full shadow-lg flex items-center justify-center transition-colors duration-300`}
        >
          {/* Listening: ping + pulse rings */}
          {state === 'listening' && (
            <>
              <span className="absolute inset-0 rounded-full bg-wine/30 animate-ping" />
              <span className="absolute -inset-2 rounded-full border-2 border-wine/20 animate-pulse" />
            </>
          )}
          {/* Thinking: pulse ring */}
          {isThinking && (
            <span className="absolute -inset-2 rounded-full border-2 border-gold/30 animate-pulse" />
          )}
          {/* Speaking: pulse ring */}
          {state === 'speaking' && (
            <span className="absolute -inset-2 rounded-full border-2 border-olive/30 animate-pulse" />
          )}

          <Mic size={28} className={isMuted ? 'opacity-30' : ''} />

          {/* Waveform bars */}
          {isActive && (
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
        </div>

        {/* State label */}
        <p className="text-xs text-warm-gray mt-1">{label}</p>

        {/* Mute toggle */}
        <button
          onClick={handleMuteToggle}
          className={`flex items-center gap-1 text-xs transition-colors ${
            isMuted ? 'text-error' : 'text-warm-gray hover:text-wine'
          }`}
        >
          {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          {isMuted ? 'Unmute mic' : 'Mute mic'}
        </button>
      </div>

      <style>{`
        @keyframes barPulse {
          0%   { transform: scaleY(0.4); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </>
  );
}

// ── Outer component — manages token fetch + LiveKitRoom lifecycle ─────────────
export default function VoiceOrb({
  ensureSession,
  addMessage: _addMessage,
  onStateChange,
}: VoiceOrbProps) {
  const [connection, setConnection] = useState<ConnectionDetails | null>(null);
  const [isConnecting, setIsConnecting]   = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const sessionId = await ensureSession('voice');
      const { token, url } = await getVoiceToken(sessionId);
      setConnection({ token, url });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  }, [ensureSession]);

  const handleDisconnect = useCallback(() => {
    setConnection(null);
    onStateChange?.('idle');
  }, [onStateChange]);

  // ── Not yet connected: show connect button ──
  if (!connection) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="relative w-20 h-20 bg-wine text-white rounded-full shadow-lg hover:scale-105 hover:bg-wine-dark transition-all flex items-center justify-center disabled:opacity-60"
        >
          {isConnecting ? (
            <Loader2 size={28} className="animate-spin" />
          ) : (
            <>
              <span className="absolute -inset-2 rounded-full border-2 border-wine/20 animate-pulse" />
              <Mic size={28} />
            </>
          )}
        </button>

        <p className="text-xs text-warm-gray">
          {isConnecting ? 'Connecting…' : 'Tap to talk with Sofia'}
        </p>

        {error && (
          <div className="flex items-center gap-1.5 text-error text-xs max-w-[240px] text-center">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Connected: LiveKit room + orb UI ──
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <LiveKitRoom
        token={connection.token}
        serverUrl={connection.url}
        connect={true}
        audio={true}
        video={false}
        onDisconnected={handleDisconnect}
        style={{ display: 'contents' }}
      >
        <VoiceOrbInner onStateChange={onStateChange} />
      </LiveKitRoom>

      <button
        onClick={handleDisconnect}
        className="flex items-center gap-1.5 text-xs text-error hover:text-error/80 transition-colors mt-1"
      >
        <PhoneOff size={14} />
        End voice chat
      </button>
    </div>
  );
}
