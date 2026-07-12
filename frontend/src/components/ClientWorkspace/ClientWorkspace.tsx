import React, { useState, useEffect } from 'react';
import { LogOut, User, Store, ShoppingCart } from 'lucide-react';
import styles from './ClientWorkspace.module.css';
import CatalogWithCart from './CatalogWithCart';
import ActiveOrderTracker from './ActiveOrderTracker';
import OrderHistory from './OrderHistory';
import ProfileFinances from './ProfileFinances';
import Toast from './Toast';

export interface Profile {
  name: string;
  address: string;
  savedAddresses?: string[];
  balance: number;
  debt: number;
  phone: string;
}

const ClientWorkspace: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'profile'>('dashboard');

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
            Каталог
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            История
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Профиль
          </button>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            <span className={styles.logoutText}>Выйти</span>
          </button>
        </div>
      </header>

      {/* Active Order Tracker is always visible if on dashboard */}
      {activeTab === 'dashboard' && (
         <div className={styles.trackerWrapper}>
           <ActiveOrderTracker />
         </div>
      )}

      <main className={styles.mainContent}>
        {activeTab === 'dashboard' && (
          <CatalogWithCart 
            profile={profile} 
            onOrderSuccess={() => {
              fetchProfile();
              window.location.reload();
            }} 
          />
        )}
        {activeTab === 'history' && <OrderHistory />}
        {activeTab === 'profile' && profile && <ProfileFinances profile={profile} />}
      </main>
      
      <Toast />
    </div>
  );
};

export default ClientWorkspace;
