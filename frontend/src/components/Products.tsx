import React from 'react';
import { Wheat } from 'lucide-react';
import styles from './Products.module.css';

const products = [
  { id: 1, name: 'Таба нан' },
  { id: 2, name: 'Патыр нан' },
  { id: 3, name: 'Үй наны' },
  { id: 4, name: 'Классический батон' },
  { id: 5, name: 'Лепешка с кунжутом' },
  { id: 6, name: 'Ржаной хлеб' },
];

const Products: React.FC = () => {
  return (
    <section className={styles.section} id="products">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subheading}>Каталог продукции</span>
          <h2 className={styles.heading}>Ассортимент свежей выпечки</h2>
          <p className={styles.description}>
            Выберите товары из каталога и оставьте заявку на подключение доставки.
          </p>
        </div>

        <div className={styles.grid}>
          {products.map((product) => (
            <div key={product.id} className={styles.card}>
              <div className={styles.imagePlaceholder}>
                <Wheat size={48} className={styles.icon} strokeWidth={1.5} />
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>{product.name}</h3>
                <p className={styles.subtitle}>Свежая выпечка</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
