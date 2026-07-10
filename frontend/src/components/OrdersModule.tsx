import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, ShoppingBag, Receipt, AlertCircle } from 'lucide-react';
import styles from './OrdersModule.module.css';
import { api } from '../utils/api';

type OrderStatus = string;

interface OrderItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
}

interface Driver {
  id: number;
  name: string;
  email?: string;
}

interface Order {
  id: number;
  clientName: string;
  deliveryTime: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  driverId: number | null;
}

const DATES = ['Вчера', 'Сегодня', 'Завтра'];

interface OrdersModuleProps {
  onBack: () => void;
}

const OrdersModule: React.FC<OrdersModuleProps> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDate, setSelectedDate] = useState('Завтра');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrdersAndDrivers = async () => {
    try {
      setIsLoading(true);
      const ordersData = await api.get('/orders/deliveries');
      const driversData = await api.get('/users?role=DRIVER');
      
      const mappedOrders = ordersData.map((order: any) => ({
        id: order.id,
        clientName: order.clientName || (order.client ? order.client.name : 'Без имени'),
        deliveryTime: new Date(order.createdAt).toLocaleDateString('ru-RU') + ' ' + new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        status: order.status,
        total: order.totalAmount || 0,
        driverId: order.driverId,
        items: (order.items || []).map((item: any) => ({
          id: item.id,
          name: item.product ? item.product.name : 'Неизвестный товар',
          quantity: item.quantity || 0,
          price: item.price || 0
        }))
      }));
      
      setOrders(mappedOrders);
      setDrivers(driversData || []);
    } catch (e) {
      console.error('Failed to load orders or drivers', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndDrivers();
  }, []);

  // Stats
  const totalOrders = orders.length;
  const totalSum = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'Отменен').reduce((acc, o) => acc + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'Новый').length;

  const toggleExpand = (id: number) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(id);
    }
  };

  const changeStatus = async (id: number, newStatus: string) => {
    try {
      const statusMap: Record<string, string> = {
        'Принят': 'IN_TRANSIT',
        'Отменен': 'CANCELLED'
      };
      const mapped = statusMap[newStatus] || newStatus;
      await api.post(`/courier/order/${id}/status`, { status: mapped });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: mapped } : o));
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleAssignDriver = async (orderId: number, driverIdStr: string) => {
    try {
      const driverId = driverIdStr === '' ? null : parseInt(driverIdStr, 10);
      await api.patch(`/orders/deliveries/${orderId}/assign-driver`, { driverId });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, driverId } : o));
    } catch (e) {
      console.error('Failed to assign driver', e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'Новый':
        return <span className={`${styles.badge} ${styles.badgeNew}`}>Новый</span>;
      case 'IN_TRANSIT':
      case 'Принят':
        return <span className={`${styles.badge} ${styles.badgeAccepted}`}>В пути</span>;
      case 'DELIVERED':
      case 'Доставлено':
        return <span className={`${styles.badge} ${styles.badgeAccepted}`} style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>Доставлен</span>;
      case 'CANCELLED':
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
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Загрузка заказов...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Магазин / Кафе</th>
                  <th>Сумма</th>
                  <th>Время заказа</th>
                  <th>Назначить водителя</th>
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
                      <td>
                        <select 
                          value={order.driverId || ''} 
                          onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                          className={styles.driverSelect}
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="">Не назначен</option>
                          {drivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name || d.email}</option>
                          ))}
                        </select>
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td className={styles.textRight}>
                        <div className={styles.actions} onClick={e => e.stopPropagation()}>
                          {(order.status === 'PENDING' || order.status === 'Новый') && (
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
                        <td colSpan={7} className={styles.detailsCell}>
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
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersModule;
