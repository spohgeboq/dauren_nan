import React from 'react';
import styles from './Features.module.css';

// SVG Иконки для карточек
const TruckIcon = () => (
  <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const ClockIcon = () => (
  <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const WalletIcon = () => (
  <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
  </svg>
);

const ShieldIcon = () => (
  <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

// Подкомпонент карточки
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardText}>{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <section className={styles.featuresSection} id="about">
      <div className={styles.container}>
        
        {/* Блок быстрых фактов */}
        <div className={styles.quickFacts}>
          <div className={styles.factItem}>
            <span className={styles.factMain}>7-8 видов</span>
            <span className={styles.factSub}>лепешек ежедневно</span>
          </div>
          <div className={styles.factItem}>
            <span className={styles.factMain}>Каждое утро</span>
            <span className={styles.factSub}>доставка по маршрутам</span>
          </div>
          <div className={styles.factItem}>
            <span className={styles.factMain}>Kaspi / Нал</span>
            <span className={styles.factSub}>удобная оплата</span>
          </div>
        </div>

        {/* Сетка преимуществ */}
        <div className={styles.featuresGrid}>
          <FeatureCard 
            icon={<TruckIcon />}
            title="Маршрутная доставка"
            description="Клиенты закрепляются за водителем, поставки и возвраты фиксируются в системе."
          />
          <FeatureCard 
            icon={<ClockIcon />}
            title="Свежая продукция"
            description="Выпечка учитывается по дате производства, товар сегодняшнего дня виден отдельно."
          />
          <FeatureCard 
            icon={<WalletIcon />}
            title="Оплата как удобно"
            description="Поддерживаются наличные, Kaspi, частичная оплата и контроль задолженности."
          />
          <FeatureCard 
            icon={<ShieldIcon />}
            title="Прозрачный учет"
            description="Администратор видит поставки, возвраты, долги и историю работы с клиентом."
          />
        </div>

      </div>
    </section>
  );
};

export default Features;
