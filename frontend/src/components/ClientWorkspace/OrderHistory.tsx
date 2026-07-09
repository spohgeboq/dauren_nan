import React, { useState, useEffect } from 'react';
import { FileText, Search } from 'lucide-react';
import styles from './OrderHistory.module.css';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/client-workspace/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className={`${styles.badge} ${styles.badgeWarning}`}>Обрабатывается</span>;
      case 'IN_TRANSIT': return <span className={`${styles.badge} ${styles.badgeInfo}`}>В пути</span>;
      case 'DELIVERED': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Доставлен</span>;
      default: return <span className={`${styles.badge}`}>{status}</span>;
    }
  };

  const getPaymentText = (method: string) => {
    switch(method) {
      case 'CASH': return 'Наличные';
      case 'KASPI': return 'Kaspi';
      case 'DEBT': return 'В долг';
      default: return method;
    }
  };

  if (loading) return <div className={styles.loading}>Загрузка истории...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>История заказов</h2>
        <p>Список всех ваших предыдущих поставок</p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} className={styles.emptyIcon} />
          <h3>У вас еще нет заказов</h3>
          <p>Сделайте свой первый заказ, и он появится здесь.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Оплата</th>
                <th>Сумма</th>
                <th>Состав</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><strong>#{order.id}</strong></td>
                  <td>{new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{getPaymentText(order.paymentMethod)}</td>
                  <td className={styles.sumCell}>{order.totalAmount.toLocaleString()} ₸</td>
                  <td>
                    <ul className={styles.itemList}>
                      {order.items.map(item => (
                        <li key={item.id}>{item.product.name} — {item.quantity} шт</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
