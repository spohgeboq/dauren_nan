import React, { useState } from 'react';
import { Send, Undo2 } from 'lucide-react';
import styles from './ShowcaseReplenish.module.css';

interface ProductItem {
  id: number;
  name: string;
  stock: number;
}

interface RawMaterial {
  id: number;
  name: string;
  stock: number;
  unit: string;
}

interface ShowcaseReplenishProps {
  items: ProductItem[];
  rawMaterials: RawMaterial[];
  onStartBatch: (productId: number, quantity: number) => void;
}

const ShowcaseReplenish: React.FC<ShowcaseReplenishProps> = ({ items, rawMaterials, onStartBatch }) => {
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);
  const [quantity, setQuantity] = useState<number>(0);

  const handleSelect = (item: ProductItem) => {
    setSelectedItem(item);
    setQuantity(0);
  };

  const handleAdd = (amount: number) => {
    setQuantity(prev => prev + amount);
  };

  const handleSubmit = () => {
    if (!selectedItem || quantity === 0) return;
    
    // Вызываем API для старта партии (и автоматического списания сырья)
    onStartBatch(selectedItem.id, quantity);
    
    setSelectedItem(null);
    setQuantity(0);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Новая партия (Списание сырья)</h2>
      
      {rawMaterials && rawMaterials.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {rawMaterials.map(rm => (
            <div key={rm.id} style={{ background: '#fef7e0', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#b06000', fontWeight: 600 }}>
              {rm.name}: {rm.stock} {rm.unit}
            </div>
          ))}
        </div>
      )}

      {!selectedItem ? (
        <div className={styles.grid}>
          {items.map(item => (
            <button 
              key={item.id} 
              className={styles.itemCard}
              onClick={() => handleSelect(item)}
            >
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemStock}>Готовых: {item.stock}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.inputPanel}>
          <div className={styles.panelHeader}>
            <h3>{selectedItem.name}</h3>
            <button className={styles.backBtn} onClick={() => setSelectedItem(null)}>Назад</button>
          </div>
          
          <div className={styles.displayArea}>
            <span className={styles.quantityDisplay}>{quantity}</span>
            <span className={styles.quantityLabel}>шт</span>
          </div>
          
          <div className={styles.numpad}>
            {[10, 20, 30, 50].map(amount => (
              <button 
                key={amount} 
                className={styles.numBtn}
                onClick={() => handleAdd(amount)}
              >
                +{amount}
              </button>
            ))}
            <button className={styles.numBtn} onClick={() => handleAdd(1)}>+1</button>
            <button className={styles.numBtn} onClick={() => handleAdd(5)}>+5</button>
          </div>
          
          <button 
            className={`${styles.submitBtn} ${quantity > 0 ? styles.submitBtnActive : ''}`}
            onClick={handleSubmit}
            disabled={quantity === 0}
            style={{ backgroundColor: quantity > 0 ? '#1e8e3e' : '#ccc' }}
          >
            <Send size={28} />
            <span>НАЧАТЬ ЗАМЕС (СПИСАТЬ СЫРЬЕ)</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ShowcaseReplenish;
