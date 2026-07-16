import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Plus, Minus, X, CheckCircle } from 'lucide-react';
import styles from './CatalogWithCart.module.css';
import type { Profile } from './ClientWorkspace';
import { notify } from './Toast';
import { api } from '../../utils/api';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface CatalogWithCartProps {
  profile: Profile | null;
  onOrderSuccess: () => void;
}

const CatalogWithCart: React.FC<CatalogWithCartProps> = ({ profile, onOrderSuccess }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Address logic
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [customAddress, setCustomAddress] = useState<string>('');
  const [isNewAddress, setIsNewAddress] = useState(false);

  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const gridRef = useRef<HTMLDivElement>(null);

  const [hasTemplate, setHasTemplate] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (localStorage.getItem('cartTemplate')) {
      setHasTemplate(true);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      if (profile.savedAddresses && profile.savedAddresses.length > 0) {
        setSelectedAddress(profile.savedAddresses[0]);
      } else {
        setSelectedAddress(profile.address || '');
      }
    }
  }, [profile]);

  const fetchProducts = async () => {
    try {
      const data = await api.get('/client-workspace/products');
      setProducts(data);
      const initialItems: Record<number, number> = {};
      data.forEach((p: Product) => {
        initialItems[p.id] = 0;
      });
      setOrderItems(initialItems);
    } catch (e) {
      console.error(e);
      notify('Ошибка при загрузке каталога', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = () => {
    localStorage.setItem('cartTemplate', JSON.stringify(orderItems));
    setHasTemplate(true);
    notify('Корзина сохранена как шаблон "Стандартная пятница"!', 'success');
  };

  const handleLoadTemplate = () => {
    const saved = localStorage.getItem('cartTemplate');
    if (saved) {
      setOrderItems(JSON.parse(saved));
      notify('Шаблон успешно загружен', 'success');
    }
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
  const totalItemsCount = Object.values(orderItems).reduce((a, b) => a + b, 0);

  const submitOrder = async () => {
    if (totalAmount === 0) {
      notify('Добавьте хотя бы один товар в заказ.', 'error');
      return;
    }

    const finalAddress = isNewAddress ? customAddress : selectedAddress;
    if (!finalAddress || finalAddress.trim() === '') {
      notify('Пожалуйста, укажите адрес доставки.', 'error');
      return;
    }

    setSubmitting(true);
    const itemsPayload = Object.entries(orderItems)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ productId: parseInt(id), quantity: qty }));

    try {
      await api.post('/client-workspace/orders', {
        items: itemsPayload, 
        paymentMethod: 'CASH', // Always cash to courier
        address: finalAddress 
      });

      setOrderSuccess(true);
      notify('Заказ успешно оформлен!', 'success');
      setTimeout(() => {
        setIsCartOpen(false);
        setOrderSuccess(false);
        onOrderSuccess();
      }, 2000);
    } catch (e) {
      console.error(e);
      notify('Ошибка при создании заказа', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCartOpen) return; // Disable grid nav if cart is open
      
      // If typing in an input, don't interfere
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (products.length === 0) return;

      if (e.key === 'ArrowRight') {
        setFocusedIndex(prev => Math.min(prev + 1, products.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowDown') {
        // Simple next
        setFocusedIndex(prev => Math.min(prev + 1, products.length - 1));
      } else if (e.key === 'ArrowUp') {
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === '+' || e.key === '=') {
        if (focusedIndex >= 0 && focusedIndex < products.length) {
          handleQuantityChange(products[focusedIndex].id, 1);
        }
      } else if (e.key === '-') {
        if (focusedIndex >= 0 && focusedIndex < products.length) {
          handleQuantityChange(products[focusedIndex].id, -1);
        }
      } else if (e.key === 'Enter') {
        const inputs = gridRef.current?.querySelectorAll('input');
        if (inputs && inputs[focusedIndex]) {
          (inputs[focusedIndex] as HTMLInputElement).focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, focusedIndex, isCartOpen]);


  if (loading) return <div className={styles.loader}>Загрузка каталога...</div>;

  return (
    <div className={styles.catalogWrapper}>
      <div className={styles.catalogHeader}>
        <h2>Каталог выпечки</h2>
        <p className={styles.subtitle}>Используйте стрелки для навигации, клавиши + и - для добавления</p>
        {hasTemplate && (
          <button className={styles.loadTemplateBtn} onClick={handleLoadTemplate}>
            <ShoppingBag size={16} /> Загрузить "Стандартную пятницу"
          </button>
        )}
      </div>

      <div className={styles.grid} ref={gridRef}>
        {products.map((product, idx) => (
          <div 
            key={product.id} 
            className={`${styles.productCard} ${focusedIndex === idx ? styles.focused : ''}`}
            onClick={() => setFocusedIndex(idx)}
          >
            <div className={styles.imagePlaceholder}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
              ) : (
                <ShoppingBag size={48} color="var(--primary-gold)" opacity={0.3} />
              )}
            </div>
            <div className={styles.productInfo}>
              <h3>{product.name}</h3>
              <p className={styles.price}>{product.price} ₸</p>
            </div>
            <div className={styles.quantityControls}>
              <button 
                className={styles.qtyBtn} 
                onClick={(e) => { e.stopPropagation(); handleQuantityChange(product.id, -1); }}
                disabled={!orderItems[product.id]}
              >
                <Minus size={20} />
              </button>
              <input 
                type="number" 
                className={styles.qtyInput}
                value={orderItems[product.id] || ''}
                onChange={(e) => setExactQuantity(product.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onFocus={() => setFocusedIndex(idx)}
                placeholder="0"
              />
              <button 
                className={styles.qtyBtn} 
                onClick={(e) => { e.stopPropagation(); handleQuantityChange(product.id, 1); }}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {totalItemsCount > 0 && (
        <button className={styles.floatingCart} onClick={() => setIsCartOpen(true)}>
          <div className={styles.cartIconWrapper}>
            <ShoppingBag size={24} />
            <span className={styles.cartBadge}>{totalItemsCount}</span>
          </div>
          <div className={styles.cartTotal}>
            <span>К оформлению</span>
            <strong>{totalAmount.toLocaleString()} ₸</strong>
          </div>
        </button>
      )}

      {/* Slide-over Cart Drawer */}
      <div className={`${styles.drawerOverlay} ${isCartOpen ? styles.open : ''}`} onClick={() => setIsCartOpen(false)} />
      <div className={`${styles.drawer} ${isCartOpen ? styles.open : ''}`}>
        
        {orderSuccess ? (
          <div className={styles.successState}>
            <CheckCircle size={80} color="var(--success, #10b981)" />
            <h2>Заказ успешно оформлен!</h2>
            <p>Сейчас вы будете перенаправлены...</p>
          </div>
        ) : (
          <>
            <div className={styles.drawerHeader}>
              <h2>Ваш заказ</h2>
              <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {products.filter(p => orderItems[p.id] > 0).map(product => (
                <div key={product.id} className={styles.cartItem}>
                  <div className={styles.cartItemInfo}>
                    <h4>{product.name}</h4>
                    <p>{product.price} ₸ x {orderItems[product.id]}</p>
                  </div>
                  <div className={styles.cartItemTotal}>
                    {(product.price * orderItems[product.id]).toLocaleString()} ₸
                  </div>
                </div>
              ))}
              
              {totalItemsCount === 0 && (
                <div className={styles.emptyCart}>
                  Корзина пуста
                </div>
              )}

              {totalItemsCount > 0 && (
                <div className={styles.checkoutSection}>
                  <h3>Доставка</h3>
                  
                  <div className={styles.addressSelector}>
                    <label>Адрес доставки:</label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input 
                          type="radio" 
                          checked={!isNewAddress} 
                          onChange={() => setIsNewAddress(false)} 
                        />
                        Выбрать из сохраненных
                      </label>
                      <label className={styles.radioLabel}>
                        <input 
                          type="radio" 
                          checked={isNewAddress} 
                          onChange={() => setIsNewAddress(true)} 
                        />
                        Новый адрес
                      </label>
                    </div>

                    {!isNewAddress ? (
                      <select 
                        className={styles.selectInput}
                        value={selectedAddress}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                      >
                        {profile?.savedAddresses?.map((addr, idx) => (
                          <option key={idx} value={addr}>{addr}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text"
                        className={styles.textInput}
                        placeholder="Введите новый адрес доставки..."
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                      />
                    )}
                  </div>
                  
                  <div className={styles.paymentInfo}>
                    <span className={styles.infoIcon}>ℹ️</span>
                    <span>Оплата производится курьеру при получении заказа.</span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.drawerFooter}>
              <div className={styles.totalRow}>
                <span>Итого:</span>
                <span className={styles.totalAmount}>{totalAmount.toLocaleString()} ₸</span>
              </div>
              <button 
                className={styles.templateBtn} 
                onClick={handleSaveTemplate}
                disabled={totalItemsCount === 0}
              >
                Сохранить как "Стандартная пятница"
              </button>
              <button 
                className={styles.submitOrderBtn} 
                onClick={submitOrder}
                disabled={submitting || totalAmount === 0}
              >
                {submitting ? 'Оформляем...' : 'Разместить заказ'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogWithCart;
