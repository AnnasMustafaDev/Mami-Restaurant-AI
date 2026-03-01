import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, MessageSquare, RefreshCw, Users, Clock } from 'lucide-react';
import { adminGetReservations, adminUpdateReservationStatus, adminGetReservationChatSessions } from '../../services/api';
import ChatMessagesModal from '../../components/admin/ChatMessagesModal';

interface Reservation {
  id: number;
  booking_ref: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  party_size: number;
  date: string;
  time_slot: string;
  status: string;
  source: string;
  created_at: string;
  special_requests: string | null;
}

interface ChatSession {
  id: string;
  started_at: string;
  source: string | null;
  message_count: number;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  confirmed: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  cancelled: { bg: 'bg-error/10', text: 'text-error', dot: 'bg-error' },
  completed: { bg: 'bg-text-muted/10', text: 'text-text-secondary', dot: 'bg-text-muted' },
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  const { data: reservations = [], isLoading, isError, error, refetch } = useQuery<Reservation[]>({
    queryKey: ['admin-reservations', statusFilter, dateFilter],
    queryFn: () => adminGetReservations({
      status: statusFilter || undefined,
      date: dateFilter || undefined,
    }),
    retry: 1,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminUpdateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
    },
  });

  const handleViewChat = async (reservationId: number) => {
    try {
      const sessions: ChatSession[] = await adminGetReservationChatSessions(reservationId);
      if (sessions.length > 0) {
        setChatSessionId(sessions[0].id);
      } else {
        alert('No chat sessions linked to this reservation.');
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Unknown error';
      alert(`Failed to load chat sessions: ${detail}`);
    }
  };

  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const totalGuests = reservations.reduce((sum, r) => sum + r.party_size, 0);

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text font-[Poppins]">Reservations</h1>
          <p className="text-sm text-text-secondary mt-1">{reservations.length} reservation(s)</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-card border border-primary/10 rounded-[--radius-md] hover:bg-primary/5 transition-colors duration-200 text-text font-medium"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Quick Stats */}
      {reservations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-[--radius-md] p-4 border border-primary/5">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-medium mb-1">
              <CalendarDays size={14} />
              Total
            </div>
            <p className="text-2xl font-bold text-text">{reservations.length}</p>
          </div>
          <div className="bg-card rounded-[--radius-md] p-4 border border-primary/5">
            <div className="flex items-center gap-2 text-success text-xs font-medium mb-1">
              <Clock size={14} />
              Confirmed
            </div>
            <p className="text-2xl font-bold text-text">{confirmedCount}</p>
          </div>
          <div className="bg-card rounded-[--radius-md] p-4 border border-primary/5 hidden sm:block">
            <div className="flex items-center gap-2 text-text-secondary text-xs font-medium mb-1">
              <Users size={14} />
              Total Guests
            </div>
            <p className="text-2xl font-bold text-text">{totalGuests}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-text-muted" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 border border-primary/10 rounded-[--radius-sm] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-card"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-xs text-text-secondary hover:text-primary transition-colors">
              Clear
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-primary/10 rounded-[--radius-sm] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-card"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-[--radius-lg] border border-primary/5 shadow-sm overflow-hidden">
        {isError ? (
          <div className="p-8 text-center">
            <p className="text-error text-sm font-medium">Failed to load reservations</p>
            <p className="text-text-muted text-xs mt-1">{(error as any)?.response?.data?.detail || (error as Error)?.message || 'Check that the backend server is running'}</p>
            <button onClick={() => refetch()} className="mt-3 text-xs text-primary hover:text-primary-dark font-medium transition-colors">Try again</button>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-text-secondary text-sm">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">No reservations found.</div>
        ) : (
          <table className="w-full text-sm admin-table">
            <thead>
              <tr className="bg-bg-alt border-b border-primary/5">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Ref</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Guest</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Party</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const sc = statusConfig[r.status] || statusConfig.completed;
                return (
                  <tr key={r.id} className="border-b border-primary/5 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{r.booking_ref}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text">{r.guest_name}</div>
                      {r.guest_phone && <div className="text-xs text-text-muted">{r.guest_phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-text">{r.party_size}</td>
                    <td className="px-4 py-3 text-text">{r.date}</td>
                    <td className="px-4 py-3 text-text">{r.time_slot}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary capitalize">{r.source}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={r.status}
                          onChange={(e) => updateStatus.mutate({ id: r.id, status: e.target.value })}
                          className="text-xs border border-primary/10 rounded-[--radius-sm] px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/20 bg-card"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          onClick={() => handleViewChat(r.id)}
                          className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-[--radius-sm] transition-colors duration-200"
                          title="View chat"
                          aria-label={`View chat for ${r.guest_name}`}
                        >
                          <MessageSquare size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {chatSessionId && (
        <ChatMessagesModal sessionId={chatSessionId} onClose={() => setChatSessionId(null)} />
      )}
    </div>
  );
}
