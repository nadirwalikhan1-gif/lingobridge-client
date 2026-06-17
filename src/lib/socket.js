import { io } from 'socket.io-client';

const isDev = import.meta.env.DEV;

const URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL;

if (!URL && isDev) {
  console.warn('[socket] No VITE_WS_URL or VITE_API_URL set. Socket will fail to connect.');
}

if (isDev) console.log('[socket] URL:', URL);

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket(token, role = 'client') {
  if (socket?.connected) return socket;
  if (!URL) {
    if (isDev) console.error('[socket] Cannot connect: URL is undefined');
    return null;
  }

  if (isDev) console.log('[socket] Connecting to:', URL);

  socket = io(URL, {
    auth: { token, role },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    if (isDev) console.log('[socket] Connected:', socket.id, '| role:', role);
    socket.emit('register', { role });
  });

  socket.on('disconnect', (reason) => {
    if (isDev) console.log('[socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    if (isDev) console.error('[socket] Connection error:', err.message);
  });

  socket.on('reconnect', () => {
    if (isDev) console.log('[socket] Reconnected — re-registering role:', role);
    socket.emit('register', { role });
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}