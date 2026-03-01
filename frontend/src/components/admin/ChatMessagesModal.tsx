import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { adminGetChatMessages } from '../../services/api';

interface Message {
  id: number;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ChatMessagesModalProps {
  sessionId: string;
  onClose: () => void;
}

export default function ChatMessagesModal({ sessionId, onClose }: ChatMessagesModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminGetChatMessages(sessionId)
      .then(setMessages)
      .catch((err) => {
        setMessages([]);
        setError(err?.response?.data?.detail || err?.message || 'Failed to load messages');
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Chat conversation"
    >
      <div
        className="bg-card rounded-[--radius-xl] shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-primary/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary/5">
          <div>
            <h3 className="font-semibold text-text font-[Poppins]">Chat Conversation</h3>
            <p className="text-xs text-text-muted mt-0.5">Session: {sessionId.slice(0, 8)}...</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-primary/5 rounded-[--radius-sm] transition-colors duration-200"
            aria-label="Close conversation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <p className="text-sm text-text-secondary text-center py-8">Loading messages...</p>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-error text-sm font-medium">Failed to load messages</p>
              <p className="text-text-muted text-xs mt-1">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">No messages in this session.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-[--radius-lg] rounded-br-sm'
                      : 'bg-bg text-text rounded-[--radius-lg] rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      msg.role === 'user' ? 'text-white/50' : 'text-text-muted'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
