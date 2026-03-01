import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Mic, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat, type ChatMessage } from '../../hooks/useChat';
import VoiceOrb from '../voice/VoiceOrb';
import SofiaAvatar, { type SofiaExpression } from './SofiaAvatar';

const quickReplies = [
  { icon: '🍷', label: 'Wine pairings',    query: 'Wine pairing' },
  { icon: '📅', label: 'Reserve a table',  query: 'Make a reservation' },
  { icon: '🍽️', label: "Today's specials", query: "Today's specials" },
  { icon: '✨', label: 'See the menu',     query: 'See menu' },
];

function isWineOrFoodRec(content: string): boolean {
  const keywords = [
    'wine', 'recommend', 'pairing', 'suggest', 'try', 'bottle',
    'glass', 'vintage', 'pour', 'selection', 'sommelier', 'tasting',
  ];
  const lower = content.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

export default function ChatWidget() {
  const [isOpen, setIsOpen]           = useState(false);
  const [input, setInput]             = useState('');
  const [voiceMode, setVoiceMode]     = useState(false);
  const [sofiaExpr, setSofiaExpr]     = useState<SofiaExpression>('idle');

  const { messages, sendMessage, isLoading, ensureSession, addMessage } = useChat();

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const inputRef        = useRef<HTMLInputElement>(null);
  const speakTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMsgCount    = useRef(messages.length);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !voiceMode) setTimeout(() => inputRef.current?.focus(), 320);
  }, [isOpen, voiceMode]);

  // Sofia state machine — loading / typing / closed
  useEffect(() => {
    if (!isOpen)       { setSofiaExpr('idle');      return; }
    if (isLoading)     { setSofiaExpr('thinking');  return; }
    if (input.length > 0) { setSofiaExpr('listening'); return; }
    // When loading ends with empty input, let the message-arrival effect handle it
  }, [isOpen, isLoading, input]);

  // React to new assistant messages
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      const last = messages[messages.length - 1];
      if (last?.role === 'assistant' && last.id !== 'welcome') {
        if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
        const expr: SofiaExpression = isWineOrFoodRec(last.content) ? 'recommending' : 'speaking';
        setSofiaExpr(expr);
        speakTimerRef.current = setTimeout(() => setSofiaExpr('idle'), 3500);
      }
      prevMsgCount.current = messages.length;
    }
  }, [messages]);

  // Cleanup timer on unmount
  useEffect(() => () => { if (speakTimerRef.current) clearTimeout(speakTimerRef.current); }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Sync voice orb state → Sofia expression
  const handleVoiceStateChange = useCallback((state: string) => {
    const map: Record<string, SofiaExpression> = {
      idle: 'idle', listening: 'listening', thinking: 'thinking', speaking: 'speaking',
    };
    setSofiaExpr(map[state] ?? 'idle');
  }, []);

  return (
    <>
      {/* ── FLOATING BUBBLE ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 26 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-wine text-white rounded-full shadow-xl hover:bg-wine-dark transition-colors flex items-center justify-center"
            aria-label="Open chat with Sofia"
          >
            <MessageCircle size={24} />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-gold rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── CHAT PANEL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 48, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[390px] h-[600px] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-wine/10 bg-cream"
          >
            {/* ── HEADER ── */}
            <div className="shrink-0 px-4 py-3 bg-wine/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar with expression + online dot */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/25 shadow-md">
                    <SofiaAvatar expression={sofiaExpr} size={48} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-wine/90 animate-pulse" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Sofia
                  </p>
                  <p className="text-xs text-white/65">Virtual Host · Online</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/75"
                aria-label="Close chat"
              >
                <X size={17} />
              </button>
            </div>

            {/* ── MESSAGES (shared scroll area) ── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-cream">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  >
                    <ChatBubble message={msg} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* ── THINKING INDICATOR ── */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-wine/10">
                      <SofiaAvatar expression="thinking" size={28} />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm flex items-center gap-1.5">
                      <span className="wine-drop-dot" style={{ animationDelay: '0ms'   }} />
                      <span className="wine-drop-dot" style={{ animationDelay: '200ms' }} />
                      <span className="wine-drop-dot" style={{ animationDelay: '400ms' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── QUICK REPLY CARDS ── */}
              {messages.length === 1 && !voiceMode && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="grid grid-cols-2 gap-2 pt-1"
                >
                  {quickReplies.map(({ icon, label, query }) => (
                    <button
                      key={label}
                      onClick={() => sendMessage(query)}
                      className="flex items-center gap-2 bg-white border border-wine/15 rounded-xl px-3 py-2.5 text-left hover:border-wine/40 hover:bg-wine/5 hover:shadow-sm transition-all group"
                    >
                      <span className="text-base shrink-0">{icon}</span>
                      <span className="text-xs text-warm-gray group-hover:text-wine font-medium leading-tight transition-colors">
                        {label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* ── VOICE ORB (shown inline in message area when voice mode) ── */}
              <AnimatePresence>
                {voiceMode && (
                  <motion.div
                    key="voice-orb"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1   }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="flex justify-center py-4"
                  >
                    <VoiceOrb
                      ensureSession={ensureSession}
                      addMessage={addMessage}
                      onStateChange={handleVoiceStateChange}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* ── BOTTOM BAR (input in text mode / back-to-text in voice mode) ── */}
            <div className="px-3 py-2.5 border-t border-wine/10 bg-white shrink-0">
              <AnimatePresence mode="wait" initial={false}>
                {voiceMode ? (
                  /* Voice mode — single "switch to text" button */
                  <motion.button
                    key="back-to-text"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => setVoiceMode(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-wine font-medium hover:bg-wine/5 rounded-lg transition-colors border border-wine/20"
                  >
                    <MessageSquare size={15} />
                    Switch to text chat
                  </motion.button>
                ) : (
                  /* Text mode — mic + input + send */
                  <motion.div
                    key="text-input"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={() => setVoiceMode(true)}
                      className="p-2 text-warm-gray hover:text-wine hover:bg-wine/8 rounded-lg transition-colors shrink-0"
                      title="Switch to voice"
                      aria-label="Switch to voice mode"
                    >
                      <Mic size={17} />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Sofia anything..."
                      disabled={isLoading}
                      className="flex-1 px-3 py-2 text-sm bg-cream rounded-lg outline-none placeholder:text-warm-gray/50 border border-transparent focus:border-wine/25 transition-colors"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="p-2 bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors disabled:opacity-40 shrink-0"
                      aria-label="Send message"
                    >
                      <Send size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── CHAT BUBBLE ── */
function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser  = message.role === 'user';
  const isVoice = message.source === 'voice';
  const isRec   = !isUser && isWineOrFoodRec(message.content);

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-wine/10 mb-0.5">
          <SofiaAvatar expression={isRec ? 'recommending' : 'idle'} size={28} />
        </div>
      )}
      <div className="relative max-w-[78%]">
        <div
          className={`px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'bg-wine text-white rounded-2xl rounded-tr-sm msg-slide-right'
              : isRec
              ? 'bg-gradient-to-br from-wine/10 to-wine/5 text-gray-800 rounded-2xl rounded-tl-sm italic border border-wine/10 msg-slide-left'
              : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm msg-slide-left'
          }`}
        >
          {message.content}
        </div>
        {isVoice && (
          <span
            title="Via voice"
            className={`absolute -bottom-1 ${isUser ? '-left-1' : '-right-1'} w-4 h-4 rounded-full flex items-center justify-center bg-white border border-wine/20 shadow-sm`}
          >
            <Mic size={9} className="text-wine/60" />
          </span>
        )}
      </div>
    </div>
  );
}
