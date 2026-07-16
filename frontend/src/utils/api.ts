// ============================================================
// API-клиент с поддержкой ngrok
// ============================================================
// Базовый URL API читается из переменной окружения VITE_API_URL.
// По умолчанию — локальный сервер.
// При работе через ngrok укажите в .env:
//   VITE_API_URL=https://xxxx-xx-xx-xx-xx.ngrok-free.app/api
// ============================================================

const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

// URL сервера без /api — для формирования ссылок на изображения/загрузки
export const BASE_SERVER_URL = BASE_URL.replace(/\/api$/, '');

interface RequestOptions extends RequestInit {
  body?: any;
}

async function request(path: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});

  // === ОБХОД ЭКРАНА ПРЕДУПРЕЖДЕНИЯ NGROK И LOCALTUNNEL ===
  // Бесплатный ngrok перехватывает запросы из браузера и
  // показывает HTML-страницу вместо JSON-ответа API.
  // Этот заголовок сообщает ngrok пропустить запрос напрямую к бэкенду.
  headers.set('ngrok-skip-browser-warning', 'true');
  headers.set('Bypass-Tunnel-Reminder', 'true');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Установка Content-Type если body — объект (не FormData)
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Сессия истекла или невалидна
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let errorMessage = 'API request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (_) {
      // Игнорируем ошибку парсинга JSON
    }
    throw new Error(errorMessage);
  }

  // Проверяем тип ответа
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export const api = {
  get: (path: string, options?: Omit<RequestOptions, 'body'>) => 
    request(path, { ...options, method: 'GET' }),
    
  post: (path: string, body?: any, options?: Omit<RequestOptions, 'body'>) => 
    request(path, { ...options, method: 'POST', body }),
    
  put: (path: string, body?: any, options?: Omit<RequestOptions, 'body'>) => 
    request(path, { ...options, method: 'PUT', body }),
    
  patch: (path: string, body?: any, options?: Omit<RequestOptions, 'body'>) => 
    request(path, { ...options, method: 'PATCH', body }),
    
  delete: (path: string, options?: Omit<RequestOptions, 'body'>) => 
    request(path, { ...options, method: 'DELETE' }),
};

