import React, { useState, useEffect } from 'react';
import { FileText, RotateCw, Download } from 'lucide-react';
import styles from './OrderHistory.module.css';
import { notify } from './Toast';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
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
      notify('Ошибка при загрузке истории заказов', 'error');
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

  const handleRepeatOrder = (order: Order) => {
    const template: Record<number, number> = {};
    order.items.forEach(item => {
      // Assuming item.product object exists
      if (item.product && item.product.id) {
        template[item.product.id] = item.quantity;
      }
    });
    localStorage.setItem('cartTemplate', JSON.stringify(template));
    notify('Состав заказа сохранен! Перейдите во вкладку "Каталог" и нажмите "Загрузить шаблон".', 'success');
  };

  const handleDownloadInvoice = (order: Order) => {
    let csv = `Накладная по заказу #${order.id}\nДата: ${new Date(order.createdAt).toLocaleString()}\n\n`;
    csv += "Товар,Количество,Цена,Сумма\n";
    order.items.forEach(i => {
      const sum = i.price * i.quantity;
      csv += `${i.product?.name || 'Товар'},${i.quantity},${i.price},${sum}\n`;
    });
    csv += `\nИТОГО,,,${order.totalAmount}`;
    
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Накладная_Заказ_${order.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className={styles.ordersList}>
          {orders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderNumber}>Заказ #{order.id}</span>
                <span className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                </span>
              </div>
              
              <div className={styles.orderBody}>
                <div className={styles.orderProp}>
                  <span className={styles.propLabel}>Статус:</span>
                  <span className={styles.propValue}>{getStatusBadge(order.status)}</span>
                </div>
                <div className={styles.orderProp}>
                  <span className={styles.propLabel}>Оплата:</span>
                  <span className={styles.propValue}>{getPaymentText(order.paymentMethod)}</span>
                </div>
                <div className={styles.orderProp}>
                  <span className={styles.propLabel}>Сумма:</span>
                  <span className={styles.orderSum}>{order.totalAmount.toLocaleString()} ₸</span>
                </div>
              </div>

              <div className={styles.orderItems}>
                <div className={styles.propLabel}>Состав заказа:</div>
                <ul className={styles.itemList}>
                  {order.items.map(item => (
                    <li key={item.id}>
                      <span className={styles.itemName}>{item.product?.name || 'Товар'}</span>
                      <span className={styles.itemQty}>{item.quantity} шт</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.orderActions}>
                <button className={styles.btnRepeat} onClick={() => handleRepeatOrder(order)}>
                  <RotateCw size={16} /> Повторить заказ
                </button>
                <button className={styles.btnInvoice} onClick={() => handleDownloadInvoice(order)}>
                  <Download size={16} /> Накладная (CSV)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
