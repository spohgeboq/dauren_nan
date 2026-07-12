import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

export const notify = (message: string, type: ToastType = 'info') => {
  window.dispatchEvent(new CustomEvent('toast-alert', { detail: { message, type } }));
};

const Toast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { message, type } = customEvent.detail;
      const id = Date.now();
      
      setToasts(prev => [...prev, { id, message, type }]);

      // Auto remove after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    };

    window.addEventListener('toast-alert', handleToast);
    return () => window.removeEventListener('toast-alert', handleToast);
  }, []);

  const removeToast = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      setRemovingId(null);
    }, 300); // Wait for slideOut animation
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={24} />;
      case 'error': return <AlertCircle size={24} />;
      case 'info': return <Info size={24} />;
      default: return <Info size={24} />;
    }
  };

  const getTitle = (type: ToastType) => {
    switch (type) {
      case 'success': return 'Успешно';
      case 'error': return 'Ошибка';
      case 'info': return 'Информация';
      default: return 'Уведомление';
    }
  };

  return (
    <div className={styles.toastContainer}>
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`${styles.toast} ${styles[toast.type]} ${removingId === toast.id ? styles.removing : ''}`}
        >
          <div className={styles.icon}>
            {getIcon(toast.type)}
          </div>
          <div className={styles.content}>
            <div className={styles.title}>{getTitle(toast.type)}</div>
            <p className={styles.message}>{toast.message}</p>
          </div>
          <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
