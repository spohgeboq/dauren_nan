import React, { useState, useEffect } from 'react';
import { LogOut, ChefHat, AlertCircle, Menu, X, Truck, Store, AlertTriangle } from 'lucide-react';
import styles from './BakerWorkspace.module.css';
import B2bOrdersTab from './B2bOrdersTab';
import ShowcaseLogTab from './ShowcaseLogTab';
import DefectsTab from './DefectsTab';
import { socket } from '../../utils/socket';
import { notify } from '../ClientWorkspace/Toast';
import RecipesModule from '../RecipesModule';

export type ActiveTab = 'b2b' | 'showcase' | 'defects' | 'recipes';

const BakerWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('b2b');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const [products, setProducts] = useState<any[]>([]);
  const [b2bOrders, setB2bOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/baker/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setB2bOrders(data.b2bOrders || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
    
    fetchDashboard();
    
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    // WebSocket listeners
    socket.on('stockUpdated', () => {
      fetchDashboard();
    });

    socket.on('orderCreated', () => {
      notify('Поступил новый заказ для магазина!', 'info');
      fetchDashboard();
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.off('stockUpdated');
      socket.off('orderCreated');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleMarkB2bReady = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/baker/order/ready', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });
      notify('Заказ отмечен как готовый!', 'success');
      fetchDashboard();
    } catch (e) {
      console.error(e);
      notify('Ошибка при отметке заказа', 'error');
    }
  };

  const handleLogShowcase = async (productId: number, quantity: number) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/baker/showcase/log', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity, bakerId: user.id })
      });
      notify('Выпечка успешно добавлена на витрину!', 'success');
      fetchDashboard();
    } catch (e) {
      console.error(e);
      notify('Ошибка при сохранении', 'error');
    }
  };

  const handleLogDefect = async (productId: number, quantity: number, reason: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/baker/defect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity, reason, bakerId: user.id })
      });
      notify('Брак успешно списан', 'success');
    } catch (e) {
      console.error(e);
      notify('Ошибка при списании', 'error');
    }
  };

  const criticalStockProducts = products.filter(p => p.stock < 10);

  if (activeTab === 'recipes') {
    return <RecipesModule onBack={() => setActiveTab('b2b')} isReadOnly={true} />;
  }

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <ChefHat size={32} className={styles.logoIcon} />
          <h1>Цех: Пекарь</h1>
        </div>
        
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={24} />
          {!isMobile && <span>Выйти</span>}
        </button>
      </header>

      {criticalStockProducts.length > 0 && (
        <div className={styles.criticalAlert}>
          <AlertCircle size={24} />
          <div className={styles.criticalContent}>
            <strong>Критический остаток на витрине!</strong>
            <p>Заканчиваются: {criticalStockProducts.map(p => `${p.name} (${p.stock} шт)`).join(', ')}</p>
          </div>
        </div>
      )}

      <div className={styles.mainLayout}>
        {!isMobile && (
          <aside className={styles.sidebar}>
            <div className={styles.navGroup}>
              <button 
                className={`${styles.navItem} ${activeTab === 'b2b' ? styles.active : ''}`}
                onClick={() => setActiveTab('b2b')}
              >
                Заказы (Магазины)
                {b2bOrders.length > 0 && <span className={styles.badge}>{b2bOrders.length}</span>}
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'showcase' ? styles.active : ''}`}
                onClick={() => setActiveTab('showcase')}
              >
                Витрина (Итоги)
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'defects' ? styles.active : ''}`}
                onClick={() => setActiveTab('defects')}
              >
                Списание брака
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'recipes' ? styles.active : ''}`}
                onClick={() => setActiveTab('recipes')}
              >
                Рецепты (Техкарты)
              </button>
            </div>
          </aside>
        )}

        <main className={styles.content}>
          {activeTab === 'b2b' && (
            <B2bOrdersTab orders={b2bOrders} onMarkReady={handleMarkB2bReady} />
          )}
          
          {activeTab === 'showcase' && (
            <ShowcaseLogTab products={products} onLogShowcase={handleLogShowcase} />
          )}

          {activeTab === 'defects' && (
            <DefectsTab products={products} onLogDefect={handleLogDefect} />
          )}
        </main>
      </div>

      {isMobile && (
        <nav className={styles.bottomNav}>
          <button 
            className={`${styles.bottomNavItem} ${activeTab === 'b2b' ? styles.active : ''}`}
            onClick={() => setActiveTab('b2b')}
          >
            <Truck size={24} />
            <span>Заказы</span>
            {b2bOrders.length > 0 && <span className={styles.badgeTop}>{b2bOrders.length}</span>}
          </button>
          <button 
            className={`${styles.bottomNavItem} ${activeTab === 'showcase' ? styles.active : ''}`}
            onClick={() => setActiveTab('showcase')}
          >
            <Store size={24} />
            <span>Витрина</span>
          </button>
          <button 
            className={`${styles.bottomNavItem} ${activeTab === 'defects' ? styles.active : ''}`}
            onClick={() => setActiveTab('defects')}
          >
            <AlertTriangle size={24} />
            <span>Брак</span>
          </button>
          <button 
            className={`${styles.bottomNavItem} ${activeTab === 'recipes' ? styles.active : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            <FileText size={24} />
            <span>Рецепты</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default BakerWorkspace;
