import React, { useState, useEffect } from 'react';
import { LogOut, MapPin, Phone, CheckCircle, ChevronLeft, Navigation, XCircle, Banknote, CreditCard, QrCode } from 'lucide-react';
import styles from './CourierWorkspace.module.css';

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

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setUser(parsed);
      fetchOrders(parsed.id);
    }
  }, []);

  const fetchOrders = async (driverId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courier/orders?driverId=${driverId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        // Если открыт конкретный заказ, обновим и его
        if (selectedOrder) {
          const updated = data.orders.find((o: Order) => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
          else setSelectedOrder(null); // Если он пропал из активных
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleStatusChange = async (status: string, paymentMethod?: string) => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`http://localhost:5000/api/courier/order/${selectedOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentMethod })
      });
      if (res.ok) {
        setIsPaymentModalOpen(false);
        setSelectedOrder(null);
        if (user) fetchOrders(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onConfirmDelivery = () => {
    if (selectedOrder?.isPaid) {
      // Если уже оплачен, просто завершаем
      handleStatusChange('DELIVERED');
    } else {
      // Иначе открываем модалку выбора оплаты
      setIsPaymentModalOpen(true);
    }
  };

  const formatStatus = (s: string) => {
    switch (s) {
      case 'PENDING': return 'Ждет отправки';
      case 'IN_TRANSIT': return 'В пути';
      default: return s;
    }
  };

  // --- Экран деталей ---
  if (selectedOrder) {
    return (
      <div className={styles.pageBackground}>
        <div className={styles.container}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => setSelectedOrder(null)}>
              <ChevronLeft size={24} />
              Назад
            </button>
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
                  href={`https://maps.google.com/?q=${encodeURIComponent(selectedOrder.address)}`} 
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
            <button className={styles.confirmBtn} onClick={onConfirmDelivery}>
              <CheckCircle size={24} style={{ marginRight: '0.5rem' }} />
              Завершить доставку
            </button>
            <button className={styles.cancelBtn} onClick={() => handleStatusChange('CANCELLED')}>
              <XCircle size={20} style={{ marginRight: '0.5rem' }} />
              Отказ / Возврат
            </button>
          </div>

          {/* Модалка оплаты */}
          {isPaymentModalOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <div className={styles.modalTitle}>Как оплатил клиент?</div>
                <button className={styles.methodBtn} onClick={() => handleStatusChange('DELIVERED', 'CASH')}>
                  <Banknote size={24} color="#1e8e3e" /> Наличные
                </button>
                <button className={styles.methodBtn} onClick={() => handleStatusChange('DELIVERED', 'CARD')}>
                  <CreditCard size={24} color="#3B82F6" /> Карта
                </button>
                <button className={styles.methodBtn} onClick={() => handleStatusChange('DELIVERED', 'QR')}>
                  <QrCode size={24} color="var(--primary-gold)" /> Каспи / QR
                </button>
                <button className={styles.methodBtn} onClick={() => handleStatusChange('DELIVERED', 'DEBT')}>
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

  // --- Главный экран (Список) ---
  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Мои доставки</h1>
          <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
        </div>

        <div className={styles.content}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
              Нет активных доставок
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className={styles.orderCard} onClick={() => setSelectedOrder(order)}>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CourierWorkspace;
