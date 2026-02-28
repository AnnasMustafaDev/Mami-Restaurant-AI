import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { adminGetChatSessions } from '../../services/api';
import ChatMessagesModal from '../../components/admin/ChatMessagesModal';

interface ChatSession {
  id: string;
  started_at: string;
  source: string | null;
  message_count: number;
  reservation_id: number | null;
}

export default function AdminChats() {
  const [sourceFilter, setSourceFilter] = useState('');
  const [viewSessionId, setViewSessionId] = useState<string | null>(null);

  const { data: sessions = [], isLoading, isError, error, refetch } = useQuery<ChatSession[]>({
    queryKey: ['admin-chat-sessions', sourceFilter],
    queryFn: () => adminGetChatSessions({ source: sourceFilter || undefined }),
    retry: 1,
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">{sessions.length} session(s)</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">All sources</option>
          <option value="text">Text</option>
          <option value="voice">Voice</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {isError ? (
          <div className="p-8 text-center">
            <p className="text-red-600 text-sm font-medium">Failed to load chat sessions</p>
            <p className="text-gray-500 text-xs mt-1">{(error as any)?.response?.data?.detail || (error as Error)?.message || 'Check that the backend server is running'}</p>
            <button onClick={() => refetch()} className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium">Try again</button>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No chat sessions found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Session ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Started</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Messages</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reservation</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{s.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(s.started_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.source === 'voice'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {s.source || 'text'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{s.message_count}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.reservation_id ? `#${s.reservation_id}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewSessionId(s.id)}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      <MessageSquare size={14} />
                      View Messages
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Chat Modal */}
      {viewSessionId && (
        <ChatMessagesModal sessionId={viewSessionId} onClose={() => setViewSessionId(null)} />
      )}
    </div>
  );
}
