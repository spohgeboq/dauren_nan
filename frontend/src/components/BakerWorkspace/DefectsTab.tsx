import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import styles from './DefectsTab.module.css';

interface Product {
  id: number;
  name: string;
}

interface Props {
  products: Product[];
  onLogDefect: (productId: number, quantity: number, reason: string) => Promise<void>;
}

const DefectsTab: React.FC<Props> = ({ products, onLogDefect }) => {
  const [selectedProduct, setSelectedProduct] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !quantity || isNaN(Number(quantity)) || !reason.trim()) return;
    
    setIsSubmitting(true);
    await onLogDefect(Number(selectedProduct), Number(quantity), reason);
    setIsSubmitting(false);
    setSelectedProduct('');
    setQuantity('');
    setReason('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AlertTriangle size={32} className={styles.icon} />
        <div>
          <h2 className={styles.title}>Списание брака</h2>
          <p className={styles.subtitle}>Фиксация испорченной продукции (сгорело, упало, не поднялось)</p>
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
          <label>Количество брака (шт)</label>
          <input 
            type="number" 
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            placeholder="Например: 5"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Причина списания</label>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Опишите, что произошло..."
            className={styles.textarea}
            rows={3}
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn} 
          disabled={isSubmitting || !selectedProduct || !quantity || !reason.trim()}
        >
          {isSubmitting ? (
            'СПИСАНИЕ...'
          ) : (
            <>
              <Trash2 size={20} />
              <span>СПИСАТЬ БРАК</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default DefectsTab;
