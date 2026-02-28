import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, MessageSquare, RefreshCw } from 'lucide-react';
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

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-sm text-gray-500 mt-1">{reservations.length} reservation(s)</p>
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
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-xs text-gray-500 hover:text-gray-700">
              Clear
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {isError ? (
          <div className="p-8 text-center">
            <p className="text-red-600 text-sm font-medium">Failed to load reservations</p>
            <p className="text-gray-500 text-xs mt-1">{(error as any)?.response?.data?.detail || (error as Error)?.message || 'Check that the backend server is running'}</p>
            <button onClick={() => refetch()} className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium">Try again</button>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No reservations found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ref</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Guest</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Party</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{r.booking_ref}</td>
                  <td className="px-4 py-3">
                    <div>{r.guest_name}</div>
                    {r.guest_phone && <div className="text-xs text-gray-400">{r.guest_phone}</div>}
                  </td>
                  <td className="px-4 py-3">{r.party_size}</td>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">{r.time_slot}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || ''}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{r.source}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus.mutate({ id: r.id, status: e.target.value })}
                        className="text-xs border rounded px-1.5 py-1 focus:outline-none"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={() => handleViewChat(r.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View chat"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Chat Modal */}
      {chatSessionId && (
        <ChatMessagesModal sessionId={chatSessionId} onClose={() => setChatSessionId(null)} />
      )}
    </div>
  );
}
