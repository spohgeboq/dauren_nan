import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, Plus, Image as ImageIcon, UploadCloud, X } from 'lucide-react';
import styles from './ProductsModule.module.css';

type ProductCategory = 'Лепешки' | 'Хлеб' | 'Сдоба' | 'Прочее';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  weight: number; // in grams
  cost: number;
  price: number;
  isActive: boolean;
  imageUrl?: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', sku: 'TBN-001', name: 'Таба нан', category: 'Лепешки', weight: 350, cost: 70, price: 150, isActive: true },
  { id: '2', sku: 'UYN-002', name: 'Уй наны', category: 'Лепешки', weight: 400, cost: 80, price: 170, isActive: true },
  { id: '3', sku: 'PTR-003', name: 'Патыр нан', category: 'Лепешки', weight: 300, cost: 65, price: 140, isActive: true },
  { id: '4', sku: 'BTN-004', name: 'Батон нарезной', category: 'Хлеб', weight: 450, cost: 90, price: 200, isActive: true },
  { id: '5', sku: 'KRS-005', name: 'Круассан классический', category: 'Сдоба', weight: 80, cost: 120, price: 350, isActive: true },
  { id: '6', sku: 'BLH-006', name: 'Булочка с маком', category: 'Сдоба', weight: 100, cost: 45, price: 120, isActive: false },
];

interface ProductsModuleProps {
  onBack: () => void;
}

const ProductsModule: React.FC<ProductsModuleProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ProductCategory | 'Все'>('Все');

  // Modal (Drawer) State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('Лепешки');
  const [newWeight, setNewWeight] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'Все' || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategory]);

  const toggleStatus = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProd: Product = {
      id: Date.now().toString(),
      sku: `NEW-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      category: newCategory,
      weight: parseInt(newWeight) || 0,
      cost: parseInt(newCost) || 0,
      price: parseInt(newPrice) || 0,
      isActive: true
    };

    setProducts([newProd, ...products]);
    setIsDrawerOpen(false);
    
    // Reset
    setNewName('');
    setNewCategory('Лепешки');
    setNewWeight('');
    setNewCost('');
    setNewPrice('');
  };

  const formatPrice = (num: number) => num.toLocaleString('ru-RU') + ' ₸';
  
  const calculateMargin = (price: number, cost: number) => {
    if (price === 0) return 0;
    return Math.round(((price - cost) / price) * 100);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Справочник товаров</h1>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.workspace}>
          
          {/* Top Panel */}
          <div className={styles.topPanel}>
            <div className={styles.filtersWrapper}>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Поиск по названию или артикулу..." 
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className={styles.filterBox}>
                <Filter size={18} className={styles.filterIcon} />
                <select 
                  className={styles.filterSelect}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as ProductCategory | 'Все')}
                >
                  <option value="Все">Все категории</option>
                  <option value="Лепешки">Лепешки</option>
                  <option value="Хлеб">Хлеб</option>
                  <option value="Сдоба">Сдоба</option>
                  <option value="Прочее">Прочее</option>
                </select>
              </div>
            </div>

            <button className={styles.primaryBtn} onClick={() => setIsDrawerOpen(true)}>
              <Plus size={18} />
              Добавить товар
            </button>
          </div>

          {/* Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colPhoto}>Фото</th>
                  <th>Товар и Артикул</th>
                  <th>Категория</th>
                  <th>Вес</th>
                  <th className={styles.textRight}>Себестоимость</th>
                  <th className={styles.textRight}>Цена продажи</th>
                  <th className={styles.textRight}>Маржа</th>
                  <th className={styles.textCenter}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const marginPercent = calculateMargin(product.price, product.cost);
                  const isArchived = !product.isActive;

                  return (
                    <tr key={product.id} className={`${styles.tableRow} ${isArchived ? styles.rowArchived : ''}`}>
                      <td className={styles.colPhoto}>
                        <div className={styles.photoThumb}>
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                          ) : (
                            <ImageIcon size={20} className={styles.photoPlaceholder} />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.prodInfo}>
                          <span className={styles.prodName}>{product.name}</span>
                          <span className={styles.prodSku}>{product.sku}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.categoryBadge}>{product.category}</span>
                      </td>
                      <td>
                        <span className={styles.weightText}>{product.weight} г</span>
                      </td>
                      <td className={styles.textRight}>
                        <span className={styles.costText}>{formatPrice(product.cost)}</span>
                      </td>
                      <td className={styles.textRight}>
                        <span className={styles.priceText}>{formatPrice(product.price)}</span>
                      </td>
                      <td className={styles.textRight}>
                        <div className={styles.marginBadge}>
                          {marginPercent}%
                        </div>
                      </td>
                      <td className={styles.textCenter}>
                        <div 
                          className={`${styles.toggleSwitch} ${product.isActive ? styles.toggleOn : styles.toggleOff}`}
                          onClick={() => toggleStatus(product.id)}
                        >
                          <div className={`${styles.toggleKnob} ${product.isActive ? styles.knobOn : styles.knobOff}`} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.emptyTable}>
                      Товары не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Новый товар</h2>
              <button className={styles.closeBtn} onClick={() => setIsDrawerOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.drawerContent}>
              <form onSubmit={handleAddProduct} className={styles.drawerForm}>
                
                {/* Image Upload Zone */}
                <div className={styles.uploadZone}>
                  <UploadCloud size={32} className={styles.uploadIcon} />
                  <span className={styles.uploadTitle}>Загрузить фото</span>
                  <span className={styles.uploadSubtitle}>PNG, JPG до 5MB</span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Название товара</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Например: Круассан с шоколадом"
                    required
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Категория</label>
                    <select 
                      className={styles.formSelect}
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                    >
                      <option value="Лепешки">Лепешки</option>
                      <option value="Хлеб">Хлеб</option>
                      <option value="Сдоба">Сдоба</option>
                      <option value="Прочее">Прочее</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Вес (в граммах)</label>
                    <input 
                      type="number"
                      className={styles.formInput}
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      placeholder="Например: 350"
                      min="1"
                    />
                  </div>
                </div>

                <hr className={styles.divider} />

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Себестоимость (₸)</label>
                    <input 
                      type="number"
                      className={styles.formInput}
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Цена продажи (₸)</label>
                    <input 
                      type="number"
                      className={styles.formInput}
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>

                {newPrice && newCost && (
                  <div className={styles.marginPreview}>
                    Прогнозируемая маржа: <strong>{calculateMargin(parseInt(newPrice), parseInt(newCost))}%</strong>
                  </div>
                )}

              </form>
            </div>

            <div className={styles.drawerFooter}>
              <button type="button" className={styles.cancelBtn} onClick={() => setIsDrawerOpen(false)}>
                Отмена
              </button>
              <button type="button" className={styles.submitBtn} onClick={handleAddProduct} disabled={!newName.trim() || !newPrice}>
                Сохранить товар
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsModule;
