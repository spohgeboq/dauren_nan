const BASE_URL = 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  body?: any;
}

async function request(path: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Set Content-Type if body is an object and not FormData
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Session expired or invalid
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
      // Ignore fallback if JSON parsing fails
    }
    throw new Error(errorMessage);
  }

  // Check if response is empty or has content
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
