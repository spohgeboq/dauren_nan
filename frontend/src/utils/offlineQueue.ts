export interface OfflineAction {
  id: string;
  url: string;
  method: string;
  body: any;
  timestamp: number;
}

const QUEUE_KEY = 'offline_queue';

export const saveOfflineAction = (url: string, method: string, body: any) => {
  const queue: OfflineAction[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  queue.push({
    id: Math.random().toString(36).substr(2, 9),
    url,
    method,
    body,
    timestamp: Date.now(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const syncOfflineActions = async () => {
  const queue: OfflineAction[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  if (queue.length === 0) return;

  const failed: OfflineAction[] = [];

  for (const action of queue) {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(action.url, {
        method: action.method,
        headers,
        body: JSON.stringify(action.body),
      });

      if (!res.ok) {
        failed.push(action);
      }
    } catch (e) {
      failed.push(action);
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
};
