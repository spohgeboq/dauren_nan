import React, { useState, useEffect } from 'react';
import { LogOut, User, Store } from 'lucide-react';
import styles from './ClientWorkspace.module.css';
import BulkOrderForm from './BulkOrderForm';
import ActiveOrderTracker from './ActiveOrderTracker';
import OrderHistory from './OrderHistory';

interface Profile {
  name: string;
  address: string;
  balance: number;
  phone: string;
}

const ClientWorkspace: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/client-workspace/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  if (loading) {
    return <div className={styles.loader}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Store size={28} className={styles.icon} />
          <div>
            <h1>{profile?.name || 'Магазин'}</h1>
            <p className={styles.address}>{profile?.address}</p>
          </div>
        </div>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Текущий заказ
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            История заказов
          </button>
        </div>

        <div className={styles.headerRight}>
          {profile && profile.balance < 0 && (
            <div className={styles.debtWidget}>
              <span className={styles.debtLabel}>Текущий долг:</span>
              <span className={styles.debtAmount}>{Math.abs(profile.balance)} ₸</span>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      </header>

      <main className={styles.mainGrid}>
        {activeTab === 'dashboard' ? (
          <>
            <section className={styles.leftCol}>
              <BulkOrderForm onOrderSuccess={() => window.location.reload()} />
            </section>
            
            <section className={styles.rightCol}>
              <ActiveOrderTracker />
            </section>
          </>
        ) : (
          <section className={styles.fullWidthCol}>
            <OrderHistory />
          </section>
        )}
      </main>
    </div>
  );
};

export default ClientWorkspace;
