import React, { useState, useEffect } from 'react';
import styles from './CourierWorkspace.module.css';
import { CheckCircle } from 'lucide-react';

interface SmartLoadingProps {
  orders: any[];
  onStartRoute: () => void;
}

export const SmartLoading: React.FC<SmartLoadingProps> = ({ orders, onStartRoute }) => {
  const [loadItems, setLoadItems] = useState<{ id: number; name: string; quantity: number; checked: boolean }[]>([]);

  useEffect(() => {
    // Агрегируем товары из всех заказов
    const itemsMap: Record<number, { name: string; quantity: number }> = {};
    orders.forEach(order => {
      if (order.status === 'PENDING' || order.status === 'IN_TRANSIT') {
        order.items?.forEach((item: any) => {
          if (!itemsMap[item.productId]) {
            itemsMap[item.productId] = { name: item.product?.name || 'Товар', quantity: 0 };
          }
          itemsMap[item.productId].quantity += item.quantity;
        });
      }
    });

    const items = Object.entries(itemsMap).map(([id, val]) => ({
      id: Number(id),
      name: val.name,
      quantity: val.quantity,
      checked: false,
    }));

    setLoadItems(items);
  }, [orders]);

  const toggleCheck = (id: number) => {
    setLoadItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const allChecked = loadItems.length > 0 && loadItems.every(item => item.checked);

  if (loadItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        Нет товаров для погрузки
      </div>
    );
  }

  return (
    <div className={styles.loadingContainer}>
      <h2 className={styles.sectionTitle}>Чек-лист погрузки</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Нажмите на товар, когда загрузите его в машину</p>
      
      <div className={styles.loadingGrid}>
        {loadItems.map(item => (
          <div 
            key={item.id} 
            className={`${styles.loadingItem} ${item.checked ? styles.loadingItemChecked : ''}`}
            onClick={() => toggleCheck(item.id)}
          >
            <div className={styles.loadingItemInfo}>
              <span className={styles.loadingItemQty}>{item.quantity} шт</span>
              <span className={styles.loadingItemName}>{item.name}</span>
            </div>
            {item.checked && <CheckCircle size={24} color="#fff" />}
          </div>
        ))}
      </div>

      <button 
        className={styles.startRouteBtn} 
        disabled={!allChecked}
        onClick={onStartRoute}
      >
        Выехать на маршрут
      </button>
    </div>
  );
};
