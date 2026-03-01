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
    <div className="p-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text font-[Poppins]">Chat Sessions</h1>
          <p className="text-sm text-text-secondary mt-1">{sessions.length} session(s)</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-card border border-primary/10 rounded-[--radius-md] hover:bg-primary/5 transition-colors duration-200 text-text font-medium"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-card border border-primary/5 rounded-[--radius-lg] p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={15} className="text-text-muted" />
          <span className="text-sm font-semibold text-text">Filters</span>
          {activeCount > 0 && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors duration-200"
            >
              <X size={13} />
              Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-text-muted mb-1 font-medium">Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilter('source', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-primary/10 rounded-[--radius-sm] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-card"
            >
              <option value="">All</option>
              <option value="text">Text</option>
              <option value="voice">Voice</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1 font-medium">From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilter('date_from', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-primary/10 rounded-[--radius-sm] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-card"
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1 font-medium">To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilter('date_to', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-primary/10 rounded-[--radius-sm] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-card"
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1 font-medium">Min messages</label>
            <input
              type="number"
              min={0}
              value={filters.min_messages}
              onChange={(e) => setFilter('min_messages', e.target.value)}
              placeholder="e.g. 2"
              className="w-full px-2.5 py-1.5 border border-primary/10 rounded-[--radius-sm] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-card"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-[--radius-lg] border border-primary/5 shadow-sm overflow-hidden">
        {isError ? (
          <div className="p-8 text-center">
            <p className="text-error text-sm font-medium">Failed to load chat sessions</p>
            <p className="text-text-muted text-xs mt-1">
              {(error as any)?.response?.data?.detail ||
                (error as Error)?.message ||
                'Check that the backend server is running'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-xs text-primary hover:text-primary-dark font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-text-secondary text-sm">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">
            No chat sessions match the current filters.
          </div>
        ) : (
          <table className="w-full text-sm admin-table">
            <thead>
              <tr className="bg-bg-alt border-b border-primary/5">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Session ID</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Started</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Messages</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Reservation</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-primary/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{s.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-text">
                    {new Date(s.started_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        s.source === 'voice'
                          ? 'bg-accent/15 text-accent'
                          : 'bg-info/10 text-info'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${s.source === 'voice' ? 'bg-accent' : 'bg-info'}`} />
                      {s.source || 'text'}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums font-medium text-text">{s.message_count}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {s.reservation_id ? `#${s.reservation_id}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setViewSessionId(s.id)}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-medium transition-colors duration-200"
                      >
                        <MessageSquare size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(s.id)}
                        className="flex items-center gap-1.5 text-xs text-error/70 hover:text-error font-medium transition-colors duration-200"
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

      {viewSessionId && (
        <ChatMessagesModal sessionId={viewSessionId} onClose={() => setViewSessionId(null)} />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/40 backdrop-blur-sm">
          <div className="bg-card rounded-[--radius-xl] shadow-2xl p-6 w-full max-w-sm mx-4 border border-primary/5">
            <h2 className="text-lg font-bold text-text mb-2">Delete chat session?</h2>
            <p className="text-sm text-text-secondary mb-5">
              This will permanently delete the session and all its messages. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm border border-primary/10 rounded-[--radius-md] hover:bg-bg transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDeleteId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-error text-white rounded-[--radius-md] hover:bg-error/90 transition-colors duration-200 disabled:opacity-50 font-semibold"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
