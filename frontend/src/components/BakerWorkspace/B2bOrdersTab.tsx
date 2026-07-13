import React from 'react';
import { Truck, CheckCircle, Clock } from 'lucide-react';
import styles from './B2bOrdersTab.module.css';

interface OrderItem {
  id: number;
  product: { id: number; name: string };
  quantity: number;
}

interface Order {
  id: number;
  clientName: string;
  address: string;
  createdAt: string;
  items: OrderItem[];
}

interface Props {
  orders: Order[];
  onMarkReady: (orderId: number) => void;
}

const B2bOrdersTab: React.FC<Props> = ({ orders, onMarkReady }) => {
  const aggregatedItems = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      acc[item.product.name] = (acc[item.product.name] || 0) + item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Заказы Магазинов (Опт)</h2>

      {orders.length > 0 && Object.keys(aggregatedItems).length > 0 && (
        <div className={styles.aggregateBox}>
          <h3>Итого нужно испечь:</h3>
          <div className={styles.aggregateList}>
            {Object.entries(aggregatedItems).map(([name, qty]) => (
              <div key={name} className={styles.aggregateItem}>
                <span className={styles.aggName}>{name}</span>
                <span className={styles.aggQty}>{qty} шт</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <Truck size={48} className={styles.emptyIcon} />
          <p>Все заказы для магазинов выполнены!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {orders.map(order => (
            <div key={order.id} className={styles.card}>
              <div className={styles.header}>
                <div>
                  <h3 className={styles.clientName}>{order.clientName}</h3>
                  <span className={styles.address}>{order.address}</span>
                </div>
                <div className={styles.timeBadge}>
                  <Clock size={14} />
                  <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              
              <div className={styles.itemsList}>
                {order.items.map(item => (
                  <div key={item.id} className={styles.itemRow}>
                    <span className={styles.itemName}>{item.product.name}</span>
                    <span className={styles.itemQuantity}>{item.quantity} шт</span>
                  </div>
                ))}
              </div>

              <button 
                className={styles.readyBtn}
                onClick={() => onMarkReady(order.id)}
              >
                <CheckCircle size={20} />
                <span>ОТМЕТИТЬ КАК ГОТОВЫЙ</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default B2bOrdersTab;
