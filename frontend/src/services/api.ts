import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token for admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token && config.url?.startsWith('/admin')) {
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

export default api;
