import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Phone, CheckCircle, Navigation, XCircle, Banknote, CreditCard, QrCode, LogOut, Fuel } from 'lucide-react';
import styles from './CourierWorkspace.module.css';
import { SmartLoading } from './SmartLoading';
import { RouteList } from './RouteList';
import { FuelExpenseForm } from './FuelExpenseForm';
import { socket } from '../../utils/socket';
import { syncOfflineActions, saveOfflineAction } from '../../utils/offlineQueue';
import { api } from '../../utils/api';

interface OrderItem {
  id: number;
  product: { name: string };
  quantity: number;
}

interface Order {
  id: number;
  clientName: string;
  clientPhone: string;
  address: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  isPaid: boolean;
  paymentMethod: string | null;
  items: OrderItem[];
}

const CourierWorkspace: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [view, setView] = useState<'LOADING' | 'ROUTE' | 'DETAIL'>('LOADING');
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setUser(parsed);
      fetchOrders(parsed.id);
    }

    // Connect socket
    socket.connect();

    // Offline handlers
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineActions();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async (driverId: number) => {
    try {
      if (!navigator.onLine) {
        const cached = localStorage.getItem('cached_route');
        if (cached) setOrders(JSON.parse(cached));
        return;
      }
      
      const data = await api.get(`/courier/orders?driverId=${driverId}`);
      setOrders(data.orders);
      localStorage.setItem('cached_route', JSON.stringify(data.orders));
      
      // If all are delivered or none pending, skip loading
      const hasPending = data.orders.some((o: Order) => o.status === 'PENDING' || o.status === 'IN_TRANSIT');
      if (!hasPending && data.orders.length > 0) setView('ROUTE');
    } catch (e) {
      console.error(e);
      const cached = localStorage.getItem('cached_route');
      if (cached) setOrders(JSON.parse(cached));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleStatusChange = async (orderId: number, status: string, paymentMethod?: string) => {
    // Оптимистичное обновление UI
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status: status as any, paymentMethod: paymentMethod || o.paymentMethod } : o);
      localStorage.setItem('cached_route', JSON.stringify(updated));
      return updated;
    });

    if (selectedOrder && selectedOrder.id === orderId) {
      setIsPaymentModalOpen(false);
      setSelectedOrder(null);
      setView('ROUTE');
    }

    const body = { status, paymentMethod };
    
    if (!navigator.onLine) {
      saveOfflineAction(`/courier/order/${orderId}/status`, 'POST', body);
      return;
    }

    try {
      await api.post(`/courier/order/${orderId}/status`, body);
    } catch (e) {
      saveOfflineAction(`/courier/order/${orderId}/status`, 'POST', body);
    }
  };

  const handleSwipeDelivery = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Если заказ не оплачен, нужно открыть детали для оплаты. 
    // Если оплачен (B2B/перечисление) - просто завершаем.
    if (order.isPaid || order.paymentMethod === 'DEBT') {
      handleStatusChange(orderId, 'DELIVERED');
    } else {
      setSelectedOrder(order);
      setView('DETAIL');
      setIsPaymentModalOpen(true);
    }
  };

  const startRoute = () => {
    setView('ROUTE');
    // Можно обновить статусы PENDING -> IN_TRANSIT, если требуется
  };

  // --- Экран деталей ---
  if (view === 'DETAIL' && selectedOrder) {
    return (
      <div className={styles.pageBackground}>
        <div className={styles.container}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => setView('ROUTE')}>
              <ChevronLeft size={24} /> Назад
            </button>
            {!isOnline && <span style={{color: 'red', fontSize: '0.8rem'}}>Оффлайн</span>}
          </div>

          <div className={styles.content}>
            <div className={styles.detailCard}>
              <div className={styles.sectionTitle}>Чек-лист доставки</div>
              {selectedOrder.items.map(item => (
                <div key={item.id} className={styles.checklistItem}>
                  <span className={styles.checklistItemName}>{item.product.name}</span>
                  <span className={styles.checklistItemQty}>{item.quantity} шт</span>
                </div>
              ))}
            </div>

            <div className={styles.detailCard}>
              <div className={styles.sectionTitle}>Клиент</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {selectedOrder.clientName}
              </div>
              <div className={styles.addressRow} style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                <MapPin size={20} color="var(--primary-gold)" />
                {selectedOrder.address}
              </div>

              <div className={styles.actionGrid}>
                <a href={`tel:${selectedOrder.clientPhone}`} className={styles.actionBtn}>
                  <Phone size={28} color="#1e8e3e" />
                  <span>Позвонить</span>
                </a>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedOrder.address)}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className={styles.actionBtn}
                >
                  <Navigation size={28} color="#3B82F6" />
                  <span>Маршрут</span>
                </a>
              </div>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.sectionTitle}>Оплата</div>
              <div className={styles.paymentBlock}>
                {selectedOrder.isPaid ? (
                  <div className={styles.paidBadge}>Оплачено ({selectedOrder.paymentMethod})</div>
                ) : (
                  <>
                    <span className={styles.totalLabel}>К оплате при получении</span>
                    <span className={styles.totalValue}>{selectedOrder.totalAmount} ₸</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.bottomBar}>
            <button className={styles.confirmBtn} onClick={() => setIsPaymentModalOpen(true)}>
              <CheckCircle size={24} style={{ marginRight: '0.5rem' }} />
              Завершить доставку
            </button>
            <button className={styles.cancelBtn} onClick={() => handleStatusChange(selectedOrder.id, 'CANCELLED')}>
              <XCircle size={20} style={{ marginRight: '0.5rem' }} />
              Отказ / Возврат
            </button>
          </div>

          {/* Модалка оплаты */}
          {isPaymentModalOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <div className={styles.modalTitle}>Как оплатил клиент?</div>
                <button className={styles.methodBtn} onClick={() => handleStatusChange(selectedOrder.id, 'DELIVERED', 'CASH')}>
                  <Banknote size={24} color="#1e8e3e" /> Наличные
                </button>
                <button className={styles.methodBtn} onClick={() => handleStatusChange(selectedOrder.id, 'DELIVERED', 'CARD')}>
                  <CreditCard size={24} color="#3B82F6" /> Карта
                </button>
                <button className={styles.methodBtn} onClick={() => handleStatusChange(selectedOrder.id, 'DELIVERED', 'QR')}>
                  <QrCode size={24} color="var(--primary-gold)" /> Каспи / QR
                </button>
                <button className={styles.methodBtn} onClick={() => handleStatusChange(selectedOrder.id, 'DELIVERED', 'DEBT')}>
                  <Banknote size={24} color="#dc3545" /> В долг
                </button>
                <button className={styles.cancelModalBtn} onClick={() => setIsPaymentModalOpen(false)}>
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Главный экран ---
  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Даурен Нан</h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {!isOnline && <span style={{color: 'red', fontSize: '0.8rem'}}>Оффлайн</span>}
            <button className={styles.logoutBtn} onClick={() => setIsFuelModalOpen(true)} style={{ borderColor: 'var(--primary-gold)', color: 'var(--primary-gold)' }} title="Добавить расход">
              <Fuel size={18} />
            </button>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Выйти"><LogOut size={18} /></button>
          </div>
        </div>

        <div className={styles.content}>
          {view === 'LOADING' ? (
            <SmartLoading orders={orders} onStartRoute={startRoute} />
          ) : (
            <RouteList 
              orders={orders} 
              onSwipeComplete={handleSwipeDelivery} 
              onClickOrder={(id) => {
                const order = orders.find(o => o.id === id);
                if (order) {
                  setSelectedOrder(order);
                  setView('DETAIL');
                }
              }} 
            />
          )}
        </div>

        {isFuelModalOpen && (
          <FuelExpenseForm 
            onClose={() => setIsFuelModalOpen(false)} 
            onSuccess={() => { setIsFuelModalOpen(false); alert('Расход добавлен'); }} 
          />
        )}
      </div>
    </div>
  );
};

export default CourierWorkspace;
