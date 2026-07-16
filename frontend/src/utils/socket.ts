import { io } from 'socket.io-client';

// URL для WebSocket соединения.
// Приоритет: VITE_SOCKET_URL → VITE_API_URL (без /api) → localhost
const SOCKET_URL = 
  import.meta.env?.VITE_SOCKET_URL || 
  (import.meta.env?.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000');

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Будем подключаться при входе
  extraHeaders: {
    'ngrok-skip-browser-warning': 'true', // Обход предупреждения ngrok
    'Bypass-Tunnel-Reminder': 'true'
  },
});
