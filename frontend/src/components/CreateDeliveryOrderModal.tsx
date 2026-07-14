import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../utils/api';
import styles from './CreateDeliveryOrderModal.module.css';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Client {
  id: number;
  name: string;
  address: string;
}

interface CreateDeliveryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderItemInput {
  productId: number;
  quantity: number;
  price: number;
}

const CreateDeliveryOrderModal: React.FC<CreateDeliveryOrderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientId, setClientId] = useState<number | ''>('');
  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setClientId('');
      setItems([{ productId: 0, quantity: 1, price: 0 }]);
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [clientsData, productsData] = await Promise.all([
        api.get('/clients'),
        api.get('/products')
      ]);
      setClients(clientsData || []);
      setProducts(productsData || []);
    } catch (e) {
      console.error('Failed to fetch data for modal', e);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productId: 0, quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItemInput, value: number) => {
    const newItems = [...items];
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      newItems[index].price = prod ? prod.price : 0;
    }
    newItems[index][field] = value;
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return alert('Выберите клиента');
    const validItems = items.filter(i => i.productId !== 0 && i.quantity > 0);
    if (validItems.length === 0) return alert('Добавьте хотя бы один товар');

    setIsSubmitting(true);
    try {
      await api.post('/orders/deliveries', {
        clientId: Number(clientId),
        items: validItems
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create order', error);
      alert('Ошибка при создании заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        <div className={styles.header}>
          <h3>Создать заказ клиента</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Клиент (Магазин/Кафе)</label>
            <select 
              className={styles.select} 
              value={clientId} 
              onChange={e => setClientId(e.target.value === '' ? '' : Number(e.target.value))}
              required
            >
              <option value="">Выберите клиента...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.address ? `(${c.address})` : ''}</option>
              ))}
            </select>
          </div>

          <div className={styles.itemsSection}>
            <label style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'block' }}>
              Товары
            </label>
            
            {items.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <select 
                  className={`${styles.select} ${styles.itemSelect}`}
                  value={item.productId}
                  onChange={e => handleItemChange(index, 'productId', Number(e.target.value))}
                  required
                >
                  <option value={0}>Выберите товар...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.price} ₸</option>
                  ))}
                </select>
                
                <input 
                  type="number" 
                  min="1"
                  className={`${styles.input} ${styles.itemQuantity}`}
                  value={item.quantity}
                  onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                  placeholder="Кол-во"
                  required
                />
                
                <button type="button" className={styles.removeBtn} onClick={() => handleRemoveItem(index)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            <button type="button" className={styles.addBtn} onClick={handleAddItem}>
              <Plus size={18} />
              Добавить товар
            </button>
          </div>

          <div className={styles.totalRow}>
            <span>Итого к оплате:</span>
            <span>{totalAmount.toLocaleString('ru-RU')} ₸</span>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Создание...' : 'Оформить заказ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDeliveryOrderModal;
