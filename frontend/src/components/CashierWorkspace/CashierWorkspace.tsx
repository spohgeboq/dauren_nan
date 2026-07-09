import React, { useState, useEffect } from 'react';
import { LogOut, ShoppingBag, X, CreditCard, Banknote, QrCode, Minus, Plus } from 'lucide-react';
import styles from './CashierWorkspace.module.css';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const CashierWorkspace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/cashier/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (e) {
      console.error('Failed to fetch products', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Автоматически открываем корзину при добавлении первого товара
    if (cart.length === 0) setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleManualQuantity = (id: number, val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    
    if (num <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => 
        item.id === id ? { ...item, quantity: num } : item
      ));
    }
  };

  const totalSum = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handlePayment = async (method: string) => {
    if (cart.length === 0 || !user) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/cashier/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(c => ({ productId: c.id, quantity: c.quantity, price: c.price })),
          paymentMethod: method,
          cashierId: user.id
        })
      });
      if (res.ok) {
        setCart([]);
        setIsPaymentModalOpen(false);
        setIsCartOpen(false);
        fetchProducts(); // Обновляем остатки
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <ShoppingBag size={32} className={styles.logoIcon} />
          <h1>Касса</h1>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Выйти</span>
        </button>
      </header>

      {/* Main Grid */}
      <main className={styles.mainGrid}>
        {products.map(product => (
          <div 
            key={product.id} 
            className={styles.productTile}
            onClick={() => addToCart(product)}
          >
            <div className={styles.productName}>{product.name}</div>
            <div className={styles.productPrice}>{product.price} ₸</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>На витрине: {product.stock}</div>
          </div>
        ))}
      </main>

      {/* Floating Cart */}
      <div className={`${styles.floatingCart} ${isCartOpen ? styles.open : ''}`}>
        <div className={styles.cartHeader}>
          <h2>Текущий чек</h2>
          <button className={styles.closeCartBtn} onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>Чек пуст</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>{item.price} ₸ / шт</span>
                </div>
                <div className={styles.itemControls}>
                  <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, -1)}>
                    <Minus size={16} />
                  </button>
                  <input 
                    type="number" 
                    className={styles.qtyInput} 
                    value={item.quantity === 0 ? '' : item.quantity}
                    onChange={(e) => handleManualQuantity(item.id, e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                  <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, 1)}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <button className={styles.cartToggleBtn} onClick={() => setIsCartOpen(!isCartOpen)}>
          <ShoppingBag size={24} style={{ color: cart.length > 0 ? 'var(--primary-gold)' : 'var(--primary-dark)' }} />
          <span>Чек ({totalItems})</span>
        </button>

        <div className={styles.totalDisplay}>
          <span className={styles.totalLabel}>К оплате</span>
          <span className={styles.totalSum}>{totalSum.toLocaleString()} ₸</span>
        </div>

        <button 
          className={styles.payBtn} 
          disabled={cart.length === 0}
          onClick={() => setIsPaymentModalOpen(true)}
        >
          <span>ОПЛАТИТЬ</span>
        </button>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Выберите способ оплаты</h2>
            <div className={styles.paymentMethods}>
              <button className={styles.methodBtn} onClick={() => handlePayment('CASH')}>
                <Banknote size={48} color="#1e8e3e" />
                <span>Наличные</span>
              </button>
              <button className={styles.methodBtn} onClick={() => handlePayment('CARD')}>
                <CreditCard size={48} color="#3B82F6" />
                <span>Карта</span>
              </button>
              <button className={styles.methodBtn} onClick={() => handlePayment('QR')}>
                <QrCode size={48} color="var(--primary-gold)" />
                <span>Каспи / QR</span>
              </button>
              <button className={styles.methodBtn} onClick={() => handlePayment('DEBT')}>
                <Banknote size={48} color="#dc3545" />
                <span>В долг</span>
              </button>
            </div>
            <button className={styles.cancelModalBtn} onClick={() => setIsPaymentModalOpen(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierWorkspace;
