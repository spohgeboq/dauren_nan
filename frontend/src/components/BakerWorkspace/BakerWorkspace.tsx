import React, { useState, useEffect } from 'react';
import styles from './BakerWorkspace.module.css';
import OrdersQueue from './OrdersQueue'; // Теперь это будет отображать активные партии
import ShowcaseReplenish from './ShowcaseReplenish'; // Запуск новых партий
import RecipeModal from './RecipeModal';
import { LogOut, ChefHat } from 'lucide-react';

export type ActiveTab = 'orders' | 'showcase';

const BakerWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  
  const [products, setProducts] = useState<any[]>([]);
  const [activeBatches, setActiveBatches] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/baker/dashboard');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setRawMaterials(data.rawMaterials);
        setActiveBatches(data.activeBatches.map((b: any) => ({
          id: b.id,
          name: b.product.name,
          quantity: b.quantity,
          createdAt: b.startTime
        })));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
    
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000); // Обновляем каждые 10 секунд
    
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleCompleteBatch = async (id: number) => {
    try {
      await fetch('http://localhost:5000/api/baker/batch/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: id })
      });
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartBatch = async (productId: number, quantity: number) => {
    if (!user) return;
    try {
      await fetch('http://localhost:5000/api/baker/batch/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, bakerId: user.id })
      });
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDefect = async (id: number, reason: string) => {
    // Здесь мы можем получать количество и ID продукта из партии, 
    // но для простоты добавим заглушку или зафиксируем всю партию как брак
    try {
      const batch = activeBatches.find(b => b.id === id);
      if (!batch) return;
      
      await fetch('http://localhost:5000/api/baker/defect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: batch.id, // В реальном проекте нужен productId партии
          quantity: batch.quantity, 
          reason: reason, 
          bakerId: user.id 
        })
      });
      // Завершаем/удаляем партию из работы
      handleCompleteBatch(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenRecipe = (id: number) => {
    setSelectedRecipeId(id);
  };

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <ChefHat size={32} className={styles.logoIcon} />
          <h1>Рабочее место: Пекарь</h1>
        </div>
        
        {isMobile && (
          <div className={styles.mobileTabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              В печи ({activeBatches.length})
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'showcase' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('showcase')}
            >
              Новая партия
            </button>
          </div>
        )}

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={24} />
          {!isMobile && <span>Выйти</span>}
        </button>
      </header>

      <main className={styles.mainContent}>
        {(!isMobile || activeTab === 'orders') && (
          <div className={`${styles.panel} ${styles.leftPanel}`}>
            <OrdersQueue 
              orders={activeBatches} 
              onComplete={handleCompleteBatch} 
              onOpenRecipe={handleOpenRecipe} 
              onDefect={handleDefect}
            />
          </div>
        )}
        
        {(!isMobile || activeTab === 'showcase') && (
          <div className={`${styles.panel} ${styles.rightPanel}`}>
            <ShowcaseReplenish 
              items={products} 
              rawMaterials={rawMaterials}
              onStartBatch={handleStartBatch}
            />
          </div>
        )}
      </main>

      {selectedRecipeId && (
        <RecipeModal 
          recipeId={selectedRecipeId} 
          onClose={() => setSelectedRecipeId(null)} 
        />
      )}
    </div>
  );
};

export default BakerWorkspace;
