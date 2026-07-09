import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';
import styles from './OrdersQueue.module.css';

interface Order {
  id: number;
  name: string;
  quantity: number;
  createdAt: string;
}

interface OrdersQueueProps {
  orders: Order[];
  onComplete: (id: number) => void;
  onOpenRecipe: (id: number) => void;
  onDefect?: (id: number, reason: string) => void;
}

const OrderCard: React.FC<{ order: Order; onComplete: (id: number) => void; onOpenRecipe: (id: number) => void; onDefect?: (id: number, reason: string) => void }> = ({ order, onComplete, onOpenRecipe, onDefect }) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const diff = Date.now() - new Date(order.createdAt).getTime();
      setElapsedMinutes(Math.floor(diff / 60000));
    };
    
    calculateTime();
    const interval = setInterval(calculateTime, 30000); // Обновляем каждые 30 секунд
    return () => clearInterval(interval);
  }, [order.createdAt]);

  let timerClass = styles.timerGreen;
  if (elapsedMinutes >= 10) timerClass = styles.timerRed;
  else if (elapsedMinutes >= 5) timerClass = styles.timerYellow;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{order.name}</h3>
          <span className={styles.quantity}>x{order.quantity}</span>
        </div>
        <div className={`${styles.timer} ${timerClass}`}>
          {elapsedMinutes} мин
        </div>
      </div>
      
      <div className={styles.actions}>
        {onDefect && (
          <button className={styles.recipeBtn} onClick={() => onDefect(order.id, 'Сгорело/Не подошло')} style={{color: '#d93025'}}>
            БРАК
          </button>
        )}
        <button className={styles.recipeBtn} onClick={() => onOpenRecipe(order.id)}>
          <BookOpen size={24} />
          <span>Рецепт</span>
        </button>
        <button className={styles.completeBtn} onClick={() => onComplete(order.id)}>
          <CheckCircle size={32} />
          <span>ГОТОВО</span>
        </button>
      </div>
    </div>
  );
};

const OrdersQueue: React.FC<OrdersQueueProps> = ({ orders, onComplete, onOpenRecipe, onDefect }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>В работе (Печи)</h2>
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Нет запущенных партий.</p>
          <p className={styles.subtext}>Можно начать новый замес!</p>
        </div>
      ) : (
        <div className={styles.queueGrid}>
          {orders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onComplete={onComplete} 
              onOpenRecipe={onOpenRecipe} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersQueue;
