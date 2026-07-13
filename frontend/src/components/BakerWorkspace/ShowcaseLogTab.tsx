import React, { useState } from 'react';
import { Store, Plus, Save } from 'lucide-react';
import styles from './ShowcaseLogTab.module.css';

interface Product {
  id: number;
  name: string;
}

interface Props {
  products: Product[];
  onLogShowcase: (productId: number, quantity: number) => Promise<void>;
}

const ShowcaseLogTab: React.FC<Props> = ({ products, onLogShowcase }) => {
  const [selectedProduct, setSelectedProduct] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !quantity || isNaN(Number(quantity))) return;
    
    setIsSubmitting(true);
    await onLogShowcase(Number(selectedProduct), Number(quantity));
    setIsSubmitting(false);
    setSelectedProduct('');
    setQuantity('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Store size={32} className={styles.icon} />
        <div>
          <h2 className={styles.title}>Производство для Витрины</h2>
          <p className={styles.subtitle}>Внесите количество испеченного хлеба для розничной продажи</p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Продукт</label>
          <select 
            value={selectedProduct} 
            onChange={(e) => setSelectedProduct(Number(e.target.value))}
            required
            className={styles.input}
          >
            <option value="" disabled>Выберите продукт...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Количество (шт)</label>
          <input 
            type="number" 
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            placeholder="Например: 50"
            className={styles.input}
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn} 
          disabled={isSubmitting || !selectedProduct || !quantity}
        >
          {isSubmitting ? (
            'СОХРАНЕНИЕ...'
          ) : (
            <>
              <Save size={20} />
              <span>ЗАПИСАТЬ В ИТОГИ</span>
            </>
          )}
        </button>
      </form>

      <div className={styles.infoBox}>
        <p>💡 <b>Внимание:</b> При сохранении система автоматически спишет необходимое количество муки, масла и других ингредиентов со склада.</p>
      </div>
    </div>
  );
};

export default ShowcaseLogTab;
