import React, { useState } from 'react';
import styles from './Hero.module.css';
import OrderModal from './OrderModal';

const Hero: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className={styles.hero}>
      {/* Background image is set in CSS */}
      <div className={styles.overlay}></div>
      
      <div className={styles.content}>
        <div className={styles.subtitle}>
          <span className={styles.line}></span>
          <span>Пекарня Dauren Nan</span>
          <span className={styles.line}></span>
        </div>
        
        <h1 className={styles.title}>
          Ремесленная выпечка в<br/>лучшем виде
        </h1>
        
        <p className={styles.description}>
          Свежий хлеб на вашу точку каждое утро. Мы используем только натуральные ингредиенты и проверенные рецепты.
        </p>
        
        <div className={styles.actions}>
          <button 
            className={styles.primaryButton}
            onClick={() => setIsModalOpen(true)}
          >
            Сделать заказ
          </button>
          <button 
            className={styles.secondaryButton}
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Наш ассортимент
          </button>
        </div>
      </div>

      <OrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default Hero;
