import React, { useState, useEffect } from 'react';
import { Copy, Plus, Minus, ShoppingBag } from 'lucide-react';
import styles from './BulkOrderForm.module.css';
import { api } from '../../utils/api';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface OrderItem {
  productId: number;
  quantity: number;
}

interface BulkOrderFormProps {
  onOrderSuccess: () => void;
}

const BulkOrderForm: React.FC<BulkOrderFormProps> = ({ onOrderSuccess }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('DEBT');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.get('/client-workspace/products');
      setProducts(data);
      
      // Initialize quantities to 0
      const initialItems: Record<number, number> = {};
      data.forEach((p: Product) => {
        initialItems[p.id] = 0;
      });
      setOrderItems(initialItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadLastOrder = async () => {
    try {
      const lastOrder = await api.get('/client-workspace/orders/last');
      if (lastOrder && lastOrder.items) {
        const newItems = { ...orderItems };
        lastOrder.items.forEach((item: any) => {
          if (newItems[item.productId] !== undefined) {
            newItems[item.productId] = item.quantity;
          }
        });
        setOrderItems(newItems);
      } else {
        alert('У вас еще нет предыдущих заказов.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadTemplate = () => {
    const saved = localStorage.getItem('orderTemplate');
    if (saved) {
      setOrderItems(JSON.parse(saved));
      alert('Шаблон загружен!');
    } else {
      alert('У вас еще нет сохраненного шаблона.');
    }
  };

  const saveTemplate = () => {
    localStorage.setItem('orderTemplate', JSON.stringify(orderItems));
    alert('Текущий заказ сохранен как шаблон!');
  };

  const handleQuantityChange = (id: number, delta: number) => {
    setOrderItems(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const setExactQuantity = (id: number, val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) {
      setOrderItems(prev => ({ ...prev, [id]: num }));
    } else if (val === '') {
      setOrderItems(prev => ({ ...prev, [id]: 0 }));
    }
  };

  const calculateTotal = () => {
    return products.reduce((sum, p) => {
      return sum + (p.price * (orderItems[p.id] || 0));
    }, 0);
  };

  const totalAmount = calculateTotal();

  const submitOrder = async () => {
    if (totalAmount === 0) {
      alert('Добавьте хотя бы один товар в заказ.');
      return;
    }

    setSubmitting(true);
    const itemsPayload = Object.entries(orderItems)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ productId: parseInt(id), quantity: qty }));

    try {
      await api.post('/client-workspace/orders', { items: itemsPayload, paymentMethod });
      onOrderSuccess();
    } catch (e) {
      console.error(e);
      alert('Ошибка при создании заказа');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Загрузка товаров...</div>;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Оформить заявку</h2>
        <div className={styles.headerActions}>
          <button className={styles.actionBtn} onClick={loadLastOrder} title="Повторить прошлый заказ">
            <Copy size={16} />
          </button>
          <button className={styles.actionBtn} onClick={saveTemplate} title="Сохранить как шаблон">
            <span>💾</span>
          </button>
          <button className={styles.actionBtn} onClick={loadTemplate} title="Загрузить шаблон">
            <span>📂</span>
          </button>
        </div>
      </div>

      <div className={styles.productList}>
        {products.map(product => (
          <div key={product.id} className={styles.productItem}>
            <div className={styles.productInfo}>
              <div className={styles.productIcon}>
                <ShoppingBag size={20} color="#f59e0b" />
              </div>
              <div>
                <div className={styles.productName}>{product.name}</div>
                <div className={styles.productPrice}>{product.price} ₸ / шт</div>
              </div>
            </div>
            
            <div className={styles.quantityControl}>
              <button 
                className={styles.qtyBtn} 
                onClick={() => handleQuantityChange(product.id, -1)}
                disabled={!orderItems[product.id]}
              >
                <Minus size={16} />
              </button>
              <input 
                type="number" 
                className={styles.qtyInput}
                value={orderItems[product.id] || ''}
                onChange={(e) => setExactQuantity(product.id, e.target.value)}
                placeholder="0"
              />
              <button 
                className={styles.qtyBtn} 
                onClick={() => handleQuantityChange(product.id, 1)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.paymentSection}>
          <h4>Способ оплаты</h4>
          <div className={styles.paymentOptions}>
            <label className={`${styles.paymentOption} ${paymentMethod === 'CASH' ? styles.activePayment : ''}`}>
              <input type="radio" name="payment" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} />
              Наличные
            </label>
            <label className={`${styles.paymentOption} ${paymentMethod === 'KASPI' ? styles.activePayment : ''}`}>
              <input type="radio" name="payment" value="KASPI" checked={paymentMethod === 'KASPI'} onChange={(e) => setPaymentMethod(e.target.value)} />
              Kaspi
            </label>
            <label className={`${styles.paymentOption} ${paymentMethod === 'DEBT' ? styles.activePayment : ''}`}>
              <input type="radio" name="payment" value="DEBT" checked={paymentMethod === 'DEBT'} onChange={(e) => setPaymentMethod(e.target.value)} />
              В долг
            </label>
          </div>
        </div>
        <div className={styles.totalInfo}>
          <span className={styles.totalLabel}>К оплате:</span>
          <span className={styles.totalSum}>{totalAmount.toLocaleString()} ₸</span>
        </div>
        <button 
          className={styles.submitBtn} 
          onClick={submitOrder}
          disabled={submitting || totalAmount === 0}
        >
          {submitting ? 'Оформление...' : 'Отправить заявку'}
        </button>
      </div>
    </div>
  );
};

export default BulkOrderForm;
