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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="font-semibold text-gray-900">Chat Conversation</h3>
            <p className="text-xs text-gray-500 mt-0.5">Session: {sessionId.slice(0, 8)}...</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-8">Loading messages...</p>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 text-sm font-medium">Failed to load messages</p>
              <p className="text-gray-500 text-xs mt-1">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No messages in this session.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'
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
