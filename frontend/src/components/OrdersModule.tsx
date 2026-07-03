import React, { useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, ShoppingBag, Receipt, AlertCircle } from 'lucide-react';
import styles from './OrdersModule.module.css';

type OrderStatus = 'Новый' | 'Принят' | 'Отменен';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  clientName: string;
  deliveryTime: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    clientName: 'Продуктовый "Айгерим"',
    deliveryTime: '07:00 - 08:00',
    status: 'Новый',
    total: 12500,
    items: [
      { id: 'i1', name: 'Таба нан', quantity: 20, price: 150 },
      { id: 'i2', name: 'Багет французский', quantity: 10, price: 250 },
      { id: 'i3', name: 'Булочка с повидлом', quantity: 35, price: 200 }
    ]
  },
  {
    id: 'ORD-002',
    clientName: 'Кофейня "Зерно"',
    deliveryTime: '08:00 - 09:00',
    status: 'Принят',
    total: 8400,
    items: [
      { id: 'i4', name: 'Круассан классический', quantity: 15, price: 400 },
      { id: 'i5', name: 'Синнабон', quantity: 4, price: 600 }
    ]
  },
  {
    id: 'ORD-003',
    clientName: 'Супермаркет "Алма"',
    deliveryTime: '06:00 - 07:30',
    status: 'Новый',
    total: 45000,
    items: [
      { id: 'i6', name: 'Хлеб Пшеничный', quantity: 100, price: 150 },
      { id: 'i7', name: 'Хлеб Бородинский', quantity: 50, price: 180 },
      { id: 'i8', name: 'Батон нарезной', quantity: 80, price: 170 },
      { id: 'i9', name: 'Самса с мясом', quantity: 20, price: 370 }
    ]
  },
  {
    id: 'ORD-004',
    clientName: 'Минимаркет "24/7"',
    deliveryTime: '09:00 - 10:00',
    status: 'Отменен',
    total: 4500,
    items: [
      { id: 'i10', name: 'Пирожок с картошкой', quantity: 30, price: 150 }
    ]
  }
];

const DATES = ['Вчера', 'Сегодня', 'Завтра'];

interface OrdersModuleProps {
  onBack: () => void;
}

const OrdersModule: React.FC<OrdersModuleProps> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedDate, setSelectedDate] = useState('Завтра');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Stats
  const totalOrders = orders.length;
  const totalSum = orders.filter(o => o.status !== 'Отменен').reduce((acc, o) => acc + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'Новый').length;

  const toggleExpand = (id: string) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(id);
    }
  };

  const changeStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Новый':
        return <span className={`${styles.badge} ${styles.badgeNew}`}>Новый</span>;
      case 'Принят':
        return <span className={`${styles.badge} ${styles.badgeAccepted}`}>Принят</span>;
      case 'Отменен':
        return <span className={`${styles.badge} ${styles.badgeCancelled}`}>Отменен</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Заказы клиентов</h1>
        </div>
        
        {/* Date Navigation */}
        <div className={styles.dateNav}>
          <div className={styles.datePills}>
            {DATES.map(d => (
              <button 
                key={d}
                className={`${styles.datePill} ${selectedDate === d ? styles.datePillActive : ''}`}
                onClick={() => setSelectedDate(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className={styles.calendarInputWrapper}>
            <CalendarIcon size={18} className={styles.calendarIcon} />
            <input type="date" className={styles.calendarInput} />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Widgets */}
        <div className={styles.widgetsGrid}>
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}>
              <ShoppingBag size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Всего заказов</span>
              <span className={styles.widgetValue}>{totalOrders}</span>
            </div>
          </div>
          
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
              <Receipt size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>На сумму (без отмен)</span>
              <span className={styles.widgetValue}>{totalSum.toLocaleString('ru-RU')} ₸</span>
            </div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
              <AlertCircle size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Ожидают подтверждения</span>
              <span className={styles.widgetValue}>{pendingOrders}</span>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Магазин / Кафе</th>
                <th>Сумма</th>
                <th>Время доставки</th>
                <th>Статус</th>
                <th className={styles.textRight}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <React.Fragment key={order.id}>
                  <tr 
                    className={`${styles.tableRow} ${expandedOrderId === order.id ? styles.tableRowExpanded : ''}`}
                    onClick={() => toggleExpand(order.id)}
                  >
                    <td className={styles.cellId}>{order.id}</td>
                    <td className={styles.cellName}>{order.clientName}</td>
                    <td className={styles.cellTotal}>{order.total.toLocaleString('ru-RU')} ₸</td>
                    <td>
                      <div className={styles.deliveryTime}>
                        <Clock size={14} />
                        {order.deliveryTime}
                      </div>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td className={styles.textRight}>
                      <div className={styles.actions} onClick={e => e.stopPropagation()}>
                        {order.status === 'Новый' && (
                          <>
                            <button className={styles.btnAccept} onClick={() => changeStatus(order.id, 'Принят')} title="Принять заказ">
                              <CheckCircle2 size={18} />
                            </button>
                            <button className={styles.btnCancel} onClick={() => changeStatus(order.id, 'Отменен')} title="Отменить заказ">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button className={styles.btnExpand} onClick={() => toggleExpand(order.id)}>
                          {expandedOrderId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Accordion Details */}
                  {expandedOrderId === order.id && (
                    <tr className={styles.detailsRow}>
                      <td colSpan={6} className={styles.detailsCell}>
                        <div className={styles.detailsContent}>
                          <h4 className={styles.detailsTitle}>Состав заказа</h4>
                          <div className={styles.itemsList}>
                            {order.items.map(item => (
                              <div key={item.id} className={styles.itemRow}>
                                <div className={styles.itemName}>{item.name}</div>
                                <div className={styles.itemDots}></div>
                                <div className={styles.itemQty}>{item.quantity} шт</div>
                                <div className={styles.itemPrice}>x {item.price} ₸</div>
                                <div className={styles.itemSum}>{(item.quantity * item.price).toLocaleString('ru-RU')} ₸</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default OrdersModule;
