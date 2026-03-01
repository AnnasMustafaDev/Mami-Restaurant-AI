import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, RefreshCw, Trash2, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminGetChatSessions, adminDeleteChatSession } from '../../services/api';
import ChatMessagesModal from '../../components/admin/ChatMessagesModal';

interface ChatSession {
  id: string;
  started_at: string;
  source: string | null;
  message_count: number;
  reservation_id: number | null;
}

interface Filters {
  source: string;
  date_from: string;
  date_to: string;
  min_messages: string;
}

const emptyFilters: Filters = { source: '', date_from: '', date_to: '', min_messages: '' };

function activeFilterCount(f: Filters) {
  return [f.source, f.date_from, f.date_to, f.min_messages].filter(Boolean).length;
}

export default function AdminChats() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [viewSessionId, setViewSessionId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const queryParams = {
    source: filters.source || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    min_messages: filters.min_messages ? Number(filters.min_messages) : undefined,
  };

  const { data: sessions = [], isLoading, isError, error, refetch } = useQuery<ChatSession[]>({
    queryKey: ['admin-chat-sessions', queryParams],
    queryFn: () => adminGetChatSessions(queryParams),
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteChatSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-sessions'] });
      toast.success('Chat session deleted');
      setConfirmDeleteId(null);
    },
    onError: () => toast.error('Failed to delete chat session'),
  });

  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters(emptyFilters);

  const activeCount = activeFilterCount(filters);

  return (
    <div className="p-6">
      {/* Header */}
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

      {/* Filter bar */}
      <div className="bg-white border rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={15} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {activeCount > 0 && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X size={13} />
              Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Source */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilter('source', e.target.value)}
              className="w-full px-2.5 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">All</option>
              <option value="text">Text</option>
              <option value="voice">Voice</option>
            </select>
          </div>

          {/* Date from */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilter('date_from', e.target.value)}
              className="w-full px-2.5 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilter('date_to', e.target.value)}
              className="w-full px-2.5 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Min messages */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Min messages</label>
            <input
              type="number"
              min={0}
              value={filters.min_messages}
              onChange={(e) => setFilter('min_messages', e.target.value)}
              placeholder="e.g. 2"
              className="w-full px-2.5 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {isError ? (
          <div className="p-8 text-center">
            <p className="text-red-600 text-sm font-medium">Failed to load chat sessions</p>
            <p className="text-gray-500 text-xs mt-1">
              {(error as any)?.response?.data?.detail ||
                (error as Error)?.message ||
                'Check that the backend server is running'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading sessions…</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No chat sessions match the current filters.
          </div>
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
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.id.slice(0, 8)}…</td>
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
                  <td className="px-4 py-3 tabular-nums">{s.message_count}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.reservation_id ? `#${s.reservation_id}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setViewSessionId(s.id)}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        <MessageSquare size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(s.id)}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Chat messages modal */}
      {viewSessionId && (
        <ChatMessagesModal sessionId={viewSessionId} onClose={() => setViewSessionId(null)} />
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete chat session?</h2>
            <p className="text-sm text-gray-600 mb-5">
              This will permanently delete the session and all its messages. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDeleteId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
