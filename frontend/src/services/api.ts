import axios from 'axios';

// When VITE_API_URL is an absolute URL (production), Axios URL resolution
// treats paths starting with '/' as root-relative, stripping any base path.
// We fix this by building the full URL in the interceptor instead.
// We also normalise the value: strip trailing slash, then ensure it ends with /api
// (so both https://backend.com and https://backend.com/api work as the env var).
const _rawBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
const API_BASE = _rawBase
  ? _rawBase.endsWith('/api') ? _rawBase : `${_rawBase}/api`
  : undefined;

const api = axios.create({
  baseURL: API_BASE ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Fix Axios baseURL + absolute path stripping issue in production
  if (API_BASE && config.url) {
    const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
    config.url = `${API_BASE}${path}`;
    config.baseURL = undefined;
  }

  const token = localStorage.getItem('admin_token');
  if (token && config.url?.includes('/admin')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Menu ---
export const getMenu = (category?: string) =>
  api.get('/menu', { params: { category } }).then((r) => r.data);

export const getSpecials = () =>
  api.get('/menu/specials').then((r) => r.data);

export const getMenuItem = (id: number) =>
  api.get(`/menu/${id}`).then((r) => r.data);

export const getWinePairings = (dishId: number) =>
  api.get(`/menu/${dishId}/pairings`).then((r) => r.data);

// --- Reservations ---
export const checkAvailability = (date: string, timeSlot: string, guests: number) =>
  api.get('/reservations/availability', { params: { date, time_slot: timeSlot, guests } }).then((r) => r.data);

export const createReservation = (data: {
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  party_size: number;
  date: string;
  time_slot: string;
  special_requests?: string;
}) => api.post('/reservations', data).then((r) => r.data);

export const getReservation = (bookingRef: string) =>
  api.get(`/reservations/${bookingRef}`).then((r) => r.data);

export const cancelReservation = (bookingRef: string) =>
  api.delete(`/reservations/${bookingRef}`).then((r) => r.data);

// --- Chat ---
export const createChatSession = (source = 'text') =>
  api.post('/chat/sessions', { source }).then((r) => r.data);

export const sendChatMessage = (sessionId: string, content: string) =>
  api.post(`/chat/sessions/${sessionId}/messages`, { content }).then((r) => r.data);

export const getChatMessages = (sessionId: string) =>
  api.get(`/chat/sessions/${sessionId}/messages`).then((r) => r.data);

export const textToSpeech = (text: string): Promise<Blob> =>
  api
    .post('/chat/tts', { text, voice: 'nova' }, { responseType: 'blob' })
    .then((r) => r.data);

export const getVoiceToken = (
  sessionId: string,
): Promise<{ token: string; url: string; room_name: string; session_id: string }> =>
  api.post('/chat/voice-token', { session_id: sessionId }).then((r) => r.data);

// --- Restaurant ---
export const getRestaurantInfo = () =>
  api.get('/restaurant/info').then((r) => r.data);

// --- Admin ---
export const adminLogin = (email: string, password: string) =>
  api.post('/admin/login', { email, password }).then((r) => r.data);

export const adminGetReservations = (params?: { status?: string; date?: string }) =>
  api.get('/admin/reservations', { params }).then((r) => r.data);

export const adminUpdateReservationStatus = (id: number, status: string) =>
  api.patch(`/admin/reservations/${id}`, null, { params: { status } }).then((r) => r.data);

export const adminGetChatSessions = (params?: { source?: string }) =>
  api.get('/admin/chat-sessions', { params }).then((r) => r.data);

export const adminGetChatMessages = (sessionId: string) =>
  api.get(`/admin/chat-sessions/${sessionId}/messages`).then((r) => r.data);

export const adminGetReservationChatSessions = (reservationId: number) =>
  api.get(`/admin/reservations/${reservationId}/chat-sessions`).then((r) => r.data);

// --- Admin: Menu CRUD ---
export const adminGetAllMenuItems = () =>
  api.get('/menu', { params: { available_only: false } }).then((r) => r.data);

export const adminCreateMenuItem = (data: {
  name: string;
  description?: string;
  category?: string;
  price: number;
  dietary_tags?: string[];
  image_url?: string;
  is_available?: boolean;
  is_special?: boolean;
}) => api.post('/admin/menu', data).then((r) => r.data);

export const adminUpdateMenuItem = (id: number, data: Record<string, unknown>) =>
  api.put(`/admin/menu/${id}`, data).then((r) => r.data);

export const adminDeleteMenuItem = (id: number) =>
  api.delete(`/admin/menu/${id}`).then((r) => r.data);

// --- Admin: Restaurant Config ---
export const adminGetConfig = (key: string) =>
  api.get(`/admin/config/${key}`).then((r) => r.data);

export const adminUpdateConfig = (key: string, value: unknown) =>
  api.put(`/admin/config/${key}`, { value }).then((r) => r.data);

export default api;
