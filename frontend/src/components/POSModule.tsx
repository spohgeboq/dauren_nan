import React, { useState } from 'react';
import { Lock, Search, Plus, Minus, ArrowLeft, Coffee, Delete } from 'lucide-react';
import styles from './POSModule.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Хлеб Пшеничный', price: 150, category: 'Хлеб' },
  { id: '2', name: 'Багет', price: 250, category: 'Хлеб' },
  { id: '3', name: 'Круассан', price: 450, category: 'Выпечка' },
  { id: '4', name: 'Самса с говядиной', price: 350, category: 'Сытное' },
  { id: '5', name: 'Синнабон', price: 550, category: 'Выпечка' },
  { id: '6', name: 'Булочка с маком', price: 120, category: 'Выпечка' },
  { id: '7', name: 'Хлеб Бородинский', price: 180, category: 'Хлеб' },
  { id: '8', name: 'Сосиска в тесте', price: 250, category: 'Сытное' },
];

const CATEGORIES = ['Все', 'Хлеб', 'Выпечка', 'Сытное'];

interface POSModuleProps {
  onBack: () => void;
}

const POSModule: React.FC<POSModuleProps> = ({ onBack }) => {
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [startCash, setStartCash] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleNumpadClick = (val: string) => {
    if (val === 'backspace') {
      setStartCash(prev => prev.slice(0, -1));
    } else {
      setStartCash(prev => {
        if (prev === '0') return val;
        // Limit length if needed, max 9 digits
        if (prev.length > 8) return prev;
        return prev + val;
      });
    }
  };

  const handleOpenShift = () => {
    setIsShiftOpen(true);
  };

  const handleCloseShift = () => {
    setIsShiftOpen(false);
    setCart([]);
    setStartCash('');
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, newQty: number | string) => {
    let parsed = parseInt(newQty as string, 10);
    if (isNaN(parsed)) parsed = 0; // Разрешаем пустой инпут при вводе
    
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: parsed } : item))
    );
  };

  const removeItemIfZero = (id: string) => {
    setCart((prev) => prev.filter((item) => {
      if (item.id === id && item.quantity <= 0) return false;
      return true;
    }));
  };

  const increment = (id: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decrement = (id: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id && item.quantity > 0) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const totalSum = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'Все' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (!isShiftOpen) {
    return (
      <div className={styles.shiftScreen}>
        <button className={styles.backBtnShift} onClick={onBack}>
          <ArrowLeft size={20} /> Вернуться в панель
        </button>
        <div className={styles.shiftCard}>
          <div className={styles.shiftIconWrapper}>
            <Lock size={32} className={styles.shiftIcon} />
          </div>
          <h2 className={styles.shiftTitle}>Открытие смены</h2>
          <p className={styles.shiftSubtitle}>Введите сумму наличных в кассе на начало дня</p>
          
          <div className={styles.shiftDisplay}>
            {startCash || '0'} ₸
          </div>

          <div className={styles.numpadGrid}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button 
                key={num} 
                className={styles.numpadBtn}
                onClick={() => handleNumpadClick(num)}
              >
                {num}
              </button>
            ))}
            <button className={styles.numpadBtnZero} onClick={() => handleNumpadClick('0')}>
              0
            </button>
            <button className={styles.numpadBtn} onClick={() => handleNumpadClick('backspace')}>
              <Delete size={24} />
            </button>
          </div>

          <button className={styles.openShiftBtn} onClick={handleOpenShift}>
            Открыть смену
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.posLayout}>
      {/* Левая колонка - Каталог */}
      <div className={styles.catalogCol}>
        <div className={styles.catalogHeader}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={24} />
          </button>
          
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Поиск по названию..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.categories}>
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                className={`${styles.catBtn} ${activeCategory === cat ? styles.catBtnActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.productsGrid}>
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className={styles.productCard}
              onClick={() => addToCart(product)}
            >
              <div className={styles.productIconPlaceholder}>
                <Coffee size={32} className={styles.productIcon} />
              </div>
              <div className={styles.productInfo}>
                <span className={styles.productName}>{product.name}</span>
                <span className={styles.productPrice}>{product.price} ₸</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Правая колонка - Чек */}
      <div className={styles.receiptCol}>
        <div className={styles.receiptHeader}>
          <h3 className={styles.receiptTitle}>Текущий чек</h3>
          <button className={styles.closeShiftBtn} onClick={handleCloseShift}>
            Закрыть смену
          </button>
        </div>

        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>Корзина пуста</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.cartItemInfo}>
                  <div className={styles.cartItemName}>{item.name}</div>
                  <div className={styles.cartItemPrice}>{item.price} ₸</div>
                </div>
                
                <div className={styles.qtyControl}>
                  <button className={styles.qtyBtn} onClick={() => decrement(item.id)}>
                    <Minus size={16} />
                  </button>
                  <input 
                    type="number"
                    value={item.quantity.toString()}
                    onChange={(e) => updateQuantity(item.id, e.target.value)}
                    onBlur={() => removeItemIfZero(item.id)}
                    className={styles.qtyInput}
                  />
                  <button className={styles.qtyBtn} onClick={() => increment(item.id)}>
                    <Plus size={16} />
                  </button>
                </div>
                <div className={styles.cartItemTotal}>
                  {item.price * item.quantity} ₸
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.receiptFooter}>
          <div className={styles.totalRow}>
            <span>К оплате</span>
            <span className={styles.totalSum}>{totalSum} ₸</span>
          </div>

          <div className={styles.paymentButtons}>
            <button className={styles.payKaspi}>Kaspi</button>
            <button className={styles.payCash}>Наличные</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSModule;
