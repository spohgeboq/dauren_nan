import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Phone, MessageSquare } from 'lucide-react';
import styles from './ActiveOrderTracker.module.css';
import { notify } from './Toast';
import { socket } from '../../utils/socket';

const ActiveOrderTracker: React.FC = () => {
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getStatusText = (status: string) => {
    switch(status) {
      case 'PENDING': return 'Собирается на складе';
      case 'IN_TRANSIT': return 'В пути';
      case 'DELIVERED': return 'Доставлен';
      default: return 'Обрабатывается';
    }
  };

  useEffect(() => {
    fetchActiveOrder();
    const interval = setInterval(fetchActiveOrder, 30000); // refresh every 30s
    
    socket.connect();
    socket.on('orderStatusUpdated', (data) => {
      setActiveOrder((prev: any) => {
        if (prev && prev.id === data.orderId) {
          notify(`Статус заказа изменен: ${getStatusText(data.status)}`, 'success');
          return { ...prev, status: data.status };
        }
        return prev;
      });
    });

    return () => {
      clearInterval(interval);
      socket.off('orderStatusUpdated');
    };
  }, []);

  const fetchActiveOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/client-workspace/active-order', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // The API might return empty text if no order
        if (data && data.id) {
          setActiveOrder(data);
        } else {
          setActiveOrder(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка статуса...</div>;

  if (!activeOrder) {
    return (
      <div className={styles.emptyCard}>
        <Package size={48} className={styles.emptyIcon} />
        <h3>Нет активных заказов</h3>
        <p>Ваша история текущих поставок пуста. Создайте новый заказ, чтобы отслеживать его статус здесь.</p>
      </div>
    );
  }

  const getStepClass = (step: string, current: string) => {
    if (current === 'DELIVERED') return styles.completed;
    if (current === 'IN_TRANSIT') {
      if (step === 'PENDING') return styles.completed;
      if (step === 'IN_TRANSIT') return styles.active;
      return '';
    }
    if (current === 'PENDING') {
      if (step === 'PENDING') return styles.active;
      return '';
    }
    return '';
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Активный заказ #{activeOrder.id}</h2>
        <span className={styles.time}>{new Date(activeOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>

      <div className={styles.statusTracker}>
        <div className={`${styles.step} ${getStepClass('PENDING', activeOrder.status)}`}>
          <div className={styles.stepIcon}><Package size={20} /></div>
          <div className={styles.stepLabel}>Принят</div>
        </div>
        <div className={styles.line}></div>
        <div className={`${styles.step} ${getStepClass('IN_TRANSIT', activeOrder.status)}`}>
          <div className={styles.stepIcon}><Truck size={20} /></div>
          <div className={styles.stepLabel}>В пути</div>
        </div>
        <div className={styles.line}></div>
        <div className={`${styles.step} ${getStepClass('DELIVERED', activeOrder.status)}`}>
          <div className={styles.stepIcon}><CheckCircle2 size={20} /></div>
          <div className={styles.stepLabel}>Доставлен</div>
        </div>
      </div>

      <div className={styles.statusBanner}>
        <strong>Статус:</strong> {getStatusText(activeOrder.status)}
      </div>

      {activeOrder.driver && (
        <div className={styles.courierCard}>
          <div className={styles.courierAvatar}>
            {activeOrder.driver.name?.charAt(0) || 'К'}
          </div>
          <div className={styles.courierInfo}>
            <div className={styles.courierName}>{activeOrder.driver.name}</div>
            <div className={styles.courierRole}>Ваш курьер</div>
          </div>
          {activeOrder.driver.phone && (
            <a href={`tel:${activeOrder.driver.phone}`} className={styles.callBtn}>
              <Phone size={18} />
              Позвонить
            </a>
          )}
        </div>
      )}

      <div className={styles.orderSummary}>
        <h3>Состав заказа:</h3>
        <ul className={styles.itemList}>
          {activeOrder.items.map((item: any) => (
            <li key={item.id} className={styles.itemRow}>
              <span>{item.product.name}</span>
              <span>{item.quantity} шт × {item.price} ₸</span>
            </li>
          ))}
        </ul>
        <div className={styles.totalRow}>
          <span>Итого:</span>
          <strong>{activeOrder.totalAmount.toLocaleString()} ₸</strong>
        </div>
        
        <button className={styles.btnManager} onClick={() => notify('Открывается чат с менеджером... (интеграция в разработке)', 'info')}>
          <MessageSquare size={18} />
          Связаться с менеджером
        </button>
      </div>
    </div>
  );
};

export default ActiveOrderTracker;
