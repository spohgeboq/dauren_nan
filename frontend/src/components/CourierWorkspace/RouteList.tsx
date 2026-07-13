import React from 'react';
import styles from './CourierWorkspace.module.css';
import { SwipeableOrderCard } from './SwipeableOrderCard';
import { Navigation } from 'lucide-react';

interface RouteListProps {
  orders: any[];
  onSwipeComplete: (orderId: number) => void;
  onClickOrder: (orderId: number) => void;
}

export const RouteList: React.FC<RouteListProps> = ({ orders, onSwipeComplete, onClickOrder }) => {
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'IN_TRANSIT');
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

  const currentDestination = pendingOrders[0];

  return (
    <div className={styles.routeContainer}>
      {currentDestination && (
        <div className={styles.currentDestinationCard}>
          <div className={styles.currentDestLabel}>Текущая точка</div>
          <h3 className={styles.currentDestName}>{currentDestination.clientName}</h3>
          <p className={styles.currentDestAddress}>{currentDestination.address}</p>
          <div className={styles.currentDestSummary}>
            Выгрузить: {currentDestination.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} шт
          </div>
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentDestination.address)}`} 
            target="_blank" 
            rel="noreferrer"
            className={styles.mapBtn}
          >
            <Navigation size={24} style={{ marginRight: '0.5rem' }} />
            Открыть в Google Картах
          </a>
        </div>
      )}

      <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Маршрутный лист</h3>
      <div className={styles.list}>
        {pendingOrders.map((order, index) => (
          <div key={order.id} style={{ position: 'relative' }}>
            {index === 0 && <div className={styles.activeIndicator} />}
            <SwipeableOrderCard 
              order={order} 
              onSwipeComplete={onSwipeComplete} 
              onClick={onClickOrder}
            />
          </div>
        ))}
      </div>

      {deliveredOrders.length > 0 && (
        <>
          <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Доставлено</h3>
          <div className={styles.list} style={{ opacity: 0.6 }}>
            {deliveredOrders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span className={styles.clientName}>{order.clientName}</span>
                  <span className={`${styles.statusBadge} ${styles.status_DELIVERED}`}>Доставлено</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
