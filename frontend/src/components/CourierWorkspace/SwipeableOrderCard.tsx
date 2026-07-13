import React, { useState, useRef } from 'react';
import styles from './CourierWorkspace.module.css';
import { MapPin } from 'lucide-react';

interface SwipeableOrderCardProps {
  order: any;
  onSwipeComplete: (orderId: number) => void;
  onClick: (orderId: number) => void;
}

export const SwipeableOrderCard: React.FC<SwipeableOrderCardProps> = ({ order, onSwipeComplete, onClick }) => {
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX === null) return;
    const diffX = e.touches[0].clientX - startX;
    if (diffX > 0) {
      setCurrentX(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (currentX > 150) {
      // Свайп засчитан
      onSwipeComplete(order.id);
      setCurrentX(0); // Сброс для анимации
    } else {
      // Возврат
      setCurrentX(0);
    }
    setStartX(null);
  };

  const formatStatus = (s: string) => {
    switch (s) {
      case 'PENDING': return 'Ждет отправки';
      case 'IN_TRANSIT': return 'В пути';
      case 'DELIVERED': return 'Доставлено';
      default: return s;
    }
  };

  return (
    <div className={styles.swipeContainer}>
      <div className={styles.swipeBackground}>
        <span>Доставлено</span>
      </div>
      <div 
        className={styles.orderCard} 
        ref={cardRef}
        style={{ transform: `translateX(${currentX}px)`, transition: startX === null ? 'transform 0.3s' : 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => onClick(order.id)}
      >
        <div className={styles.orderHeader}>
          <span className={styles.clientName}>{order.clientName}</span>
          <span className={`${styles.statusBadge} ${styles['status_' + order.status]}`}>
            {formatStatus(order.status)}
          </span>
        </div>
        <div className={styles.addressRow}>
          <MapPin size={16} style={{ minWidth: 16 }} />
          {order.address}
        </div>
      </div>
    </div>
  );
};
