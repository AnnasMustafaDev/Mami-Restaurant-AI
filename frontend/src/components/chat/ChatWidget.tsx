import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic } from 'lucide-react';
import { useChat, type ChatMessage } from '../../hooks/useChat';
import VoiceOrb from '../voice/VoiceOrb';

const quickReplies = ['See menu', 'Make a reservation', 'Wine pairing', "Today's specials"];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const { messages, sendMessage, isLoading, ensureSession, addMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !voiceMode) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, voiceMode]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage(text);
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-wine text-white rounded-full shadow-lg hover:bg-wine-dark transition-all hover:scale-105 flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
          {/* Notification dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-gold rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[580px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-wine/10">
          {/* Header */}
          <div className="bg-wine text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                S
              </div>
              <div>
                <p className="font-semibold text-sm">Sofia</p>
                <p className="text-xs text-white/70">MaMi's Virtual Host</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVoiceMode(!voiceMode)}
                className={`p-1.5 rounded-lg transition-colors ${
                  voiceMode ? 'bg-gold text-wine-dark' : 'hover:bg-white/10 text-white/80'
                }`}
                title={voiceMode ? 'Switch to text' : 'Switch to voice'}
              >
                <Mic size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Voice Mode */}
          {voiceMode ? (
            <div className="flex-1 flex flex-col bg-cream overflow-hidden">
              <div className="flex items-center justify-center py-4 shrink-0">
                <VoiceOrb ensureSession={ensureSession} addMessage={addMessage} />
              </div>
              {messages.length > 1 && (
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 border-t border-wine/10">
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-cream">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}

                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-wine/10 rounded-full flex items-center justify-center text-xs font-bold text-wine shrink-0">
                      S
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-warm-gray/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-warm-gray/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-warm-gray/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick replies — show only when there's just the welcome message */}
                {messages.length === 1 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {quickReplies.map((text) => (
                      <button
                        key={text}
                        onClick={() => handleQuickReply(text)}
                        className="text-xs bg-white border border-wine/20 text-wine px-3 py-1.5 rounded-full hover:bg-wine/5 transition-colors"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-2 border-t border-gray-100 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Sofia anything..."
                    className="flex-1 px-3 py-2 text-sm bg-cream rounded-lg border-none outline-none placeholder:text-warm-gray/50"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-2 bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors disabled:opacity-40"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 bg-wine/10 rounded-full flex items-center justify-center text-xs font-bold text-wine shrink-0">
          S
        </div>
      )}
      <div
        className={`max-w-[75%] px-3 py-2 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-wine text-white rounded-2xl rounded-tr-sm'
            : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
