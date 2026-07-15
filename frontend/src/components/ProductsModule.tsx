import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Plus, Image as ImageIcon, UploadCloud, X, Edit2, Trash2 } from 'lucide-react';
import styles from './ProductsModule.module.css';
import { api } from '../utils/api';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: string | number;
  sku: string;
  name: string;
  categoryId: number;
  category?: Category;
  weight: number; // in grams
  cost: number;
  price: number;
  isActive: boolean;
  imageUrl?: string;
  description?: string;
  isHit?: boolean;
  recipe?: { id: number };
}

interface ProductsModuleProps {
  onBack: () => void;
}

const ProductsModule: React.FC<ProductsModuleProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | 'Все'>('Все');

  // Modal (Drawer) State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number>(0);
  const [newWeight, setNewWeight] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIsHit, setNewIsHit] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await api.get('/categories');
        setCategories(cats);
        if (cats.length > 0) {
          setNewCategoryId(cats[0].id);
        }
        
        const prods = await api.get('/products');
        setProducts(prods);
      } catch (err) {
        console.error('Error loading products module data:', err);
      }
    };
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategoryId === 'Все' || p.categoryId === filterCategoryId;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategoryId]);

  const toggleStatus = async (id: string | number, currentActive: boolean) => {
    try {
      const updated = await api.patch(`/products/${id}`, {
        isActive: !currentActive
      });
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      console.error('Error toggling product status:', err);
    }
  };

  const handleSaveProduct = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newName.trim()) {
      console.warn('Название товара пустое');
      return;
    }
    if (!newCategoryId && newCategoryId !== 0) {
      console.warn('Категория не выбрана');
      return;
    }

    const payload: any = {
      name: newName,
      categoryId: newCategoryId || (categories.length > 0 ? categories[0].id : 1),
      weight: parseInt(newWeight) || 0,
      cost: parseFloat(newCost) || 0,
      price: parseFloat(newPrice) || 0,
      isHit: newIsHit,
    };
    // Отправляем imageUrl только если он не пустой
    if (newImageUrl) {
      payload.imageUrl = newImageUrl;
    }
    // Отправляем описание
    if (newDescription.trim()) {
      payload.description = newDescription.trim();
    }

    console.log('Saving product:', payload);

    try {
      if (editingProductId) {
        const updated = await api.patch(`/products/${editingProductId}`, payload);
        setProducts(prev => prev.map(p => p.id === editingProductId ? updated : p));
      } else {
        const added = await api.post('/products', payload);
        setProducts([added, ...products]);
      }
      setIsDrawerOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Ошибка при сохранении товара. Проверьте консоль.');
    }
  };

  const openEditDrawer = (product: Product) => {
    setEditingProductId(product.id);
    setNewName(product.name);
    setNewCategoryId(product.categoryId);
    setNewWeight(product.weight.toString());
    setNewCost(product.cost.toString());
    setNewPrice(product.price.toString());
    setNewImageUrl(product.imageUrl || '');
    setNewDescription(product.description || '');
    setNewIsHit(product.isHit || false);
    setIsDrawerOpen(true);
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Ошибка при удалении товара.');
    }
  };

  const openAddDrawer = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const resetForm = () => {
    setEditingProductId(null);
    setNewName('');
    setNewWeight('');
    setNewCost('');
    setNewPrice('');
    setNewImageUrl('');
    setNewDescription('');
    setNewIsHit(false);
    if (categories.length > 0) setNewCategoryId(categories[0].id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await response.json();
      if (data.imageUrl) {
        // Backend returns e.g. /uploads/file-123.jpg
        setNewImageUrl(`http://localhost:5000${data.imageUrl}`);
      }
    } catch (err) {
      console.error('Error uploading image', err);
    } finally {
      setIsUploading(false);
    }
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
            </div>

            <button className={styles.primaryBtn} onClick={openAddDrawer}>
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
                  <th>Описание</th>
                  <th>Рецепт</th>
                  <th>Вес</th>
                  <th className={styles.textRight}>Себестоимость</th>
                  <th className={styles.textRight}>Цена продажи</th>
                  <th className={styles.textRight}>Маржа</th>
                  <th className={styles.textCenter}>Статус</th>
                  <th className={styles.textCenter}>Действия</th>
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
                        <span className={styles.categoryBadge}>{product.description ? (product.description.length > 20 ? product.description.substring(0, 20) + '...' : product.description) : 'Нет описания'}</span>
                      </td>
                      <td>
                        {product.recipe ? (
                          <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 500 }}>🟢 Привязан</span>
                        ) : (
                          <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 500 }}>🔴 Нет</span>
                        )}
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
                          onClick={() => toggleStatus(product.id, product.isActive)}
                        >
                          <div className={`${styles.toggleKnob} ${product.isActive ? styles.knobOn : styles.knobOff}`} />
                        </div>
                      </td>
                      <td className={styles.textCenter}>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => openEditDrawer(product)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B38B59' }}
                            title="Редактировать"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => handleDeleteProduct(product.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                            title="Удалить"
                          >
                            <Trash2 size={18} />
                          </button>
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
              <h2 className={styles.drawerTitle}>{editingProductId ? 'Редактировать товар' : 'Новый товар'}</h2>
              <button className={styles.closeBtn} onClick={() => setIsDrawerOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.drawerContent}>
              <form onSubmit={handleSaveProduct} className={styles.drawerForm}>
                
                {/* Image Upload Zone */}
                <div className={styles.uploadZone} style={{ position: 'relative', overflow: 'hidden' }}>
                  {newImageUrl ? (
                    <img src={newImageUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                  ) : (
                    <>
                      <UploadCloud size={32} className={styles.uploadIcon} />
                      <span className={styles.uploadTitle}>{isUploading ? 'Загрузка...' : 'Загрузить фото'}</span>
                      <span className={styles.uploadSubtitle}>PNG, JPG до 5MB</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    disabled={isUploading}
                  />
                </div>

                <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="isHitCheckbox"
                    checked={newIsHit} 
                    onChange={(e) => setNewIsHit(e.target.checked)} 
                  />
                  <label htmlFor="isHitCheckbox" style={{ margin: 0, fontWeight: 500, color: '#f59e0b', cursor: 'pointer' }}>
                    🌟 Отметить как "Хит продаж"
                  </label>
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
                    <label className={styles.formLabel}>Описание товара</label>
                    <textarea 
                      className={styles.formInput}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Опишите ваш товар..."
                      rows={3}
                      style={{ resize: 'vertical', minHeight: '80px' }}
                    />
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
              <button type="button" className={styles.submitBtn} onClick={() => handleSaveProduct()} disabled={!newName.trim()}>
                {editingProductId ? 'Сохранить изменения' : 'Сохранить товар'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsModule;
