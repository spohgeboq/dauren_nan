import React, { useEffect, useState } from 'react';
import { Wheat, ShoppingCart } from 'lucide-react';
import styles from './Products.module.css';

interface Product {
  id: number | string;
  name: string;
  price: number;
  imageUrl?: string;
  isHit?: boolean;
  description?: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        // Оставляем только активные товары
        const activeProducts = data.filter((p: any) => p.isActive !== false);
        setProducts(activeProducts);
      })
      .catch(err => console.error('Error fetching products:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (num: number) => num.toLocaleString('ru-RU') + ' ₸';

  const handleAddToCart = (product: Product) => {
    // В будущем здесь будет вызов корзины или модалки заказа
    alert(`Товар "${product.name}" добавлен в корзину!`);
  };
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
          {loading ? (
            <div className={styles.emptyState}>Загрузка ассортимента...</div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>Ассортимент обновляется. Скоро здесь появятся свежие товары!</div>
          ) : (
            products.map((product) => (
              <div key={product.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  {product.isHit && <div className={styles.hitBadge}>Хит продаж</div>}
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className={styles.productImage} 
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.imagePlaceholder} style={{ width: '100%', height: '100%' }}>
                      <Wheat size={48} className={styles.icon} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className={styles.content}>
                  <h3 className={styles.title}>{product.name}</h3>
                  <p className={styles.subtitle}>{product.description || 'Свежая выпечка'}</p>
                  <div className={styles.price}>{formatPrice(product.price)}</div>
                  <button className={styles.addToCartBtn} onClick={() => handleAddToCart(product)}>
                    В корзину
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Products;
