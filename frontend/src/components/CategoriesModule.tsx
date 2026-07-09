import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Search, Plus, Trash2, Edit2, 
  Flame, Wheat, Cookie, Cake, Coffee, Sun, Star, ShoppingBag, X 
} from 'lucide-react';
import styles from './CategoriesModule.module.css';
import { api } from '../utils/api';

interface Category {
  id: string | number;
  name: string;
  isActive: boolean;
  iconName: string;
  sortOrder: number;
  _count?: {
    products: number;
  };
}

const AVAILABLE_ICONS = [
  { name: 'Flame', component: Flame, color: '#f97316', bg: '#ffedd5' }, // Orange
  { name: 'Wheat', component: Wheat, color: '#eab308', bg: '#fef9c3' }, // Yellow
  { name: 'Cookie', component: Cookie, color: '#8b5cf6', bg: '#ede9fe' }, // Purple
  { name: 'Cake', component: Cake, color: '#ec4899', bg: '#fce7f3' }, // Pink
  { name: 'Coffee', component: Coffee, color: '#64748b', bg: '#f1f5f9' }, // Slate
  { name: 'Sun', component: Sun, color: '#eab308', bg: '#fef9c3' },
  { name: 'Star', component: Star, color: '#3b82f6', bg: '#eff6ff' }, // Blue
  { name: 'ShoppingBag', component: ShoppingBag, color: '#10b981', bg: '#ecfdf5' }, // Green
];

interface CategoriesModuleProps {
  onBack: () => void;
}

const CategoriesModule: React.FC<CategoriesModuleProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Flame');
  const [newSortOrder, setNewSortOrder] = useState('1');

  const fetchCategories = async () => {
    try {
      const data = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories
      .filter(c => (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, searchQuery]);

  const toggleStatus = async (id: string | number, currentActive: boolean) => {
    try {
      const updated = await api.patch(`/categories/${id}`, { isActive: !currentActive });
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err) {
      console.error('Error toggling category status:', err);
    }
  };

  const deleteCategory = async (id: string | number) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewName('');
    setNewIcon('Flame');
    setNewSortOrder((categories.length + 1).toString());
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setNewName(cat.name);
    setNewIcon(cat.iconName);
    setNewSortOrder(cat.sortOrder.toString());
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      if (editingId !== null) {
        const updated = await api.patch(`/categories/${editingId}`, {
          name: newName,
          iconName: newIcon,
          sortOrder: parseInt(newSortOrder) || 0
        });
        setCategories(prev => prev.map(c => c.id === editingId ? updated : c));
      } else {
        const added = await api.post('/categories', {
          name: newName,
          iconName: newIcon,
          sortOrder: parseInt(newSortOrder) || 0,
          isActive: true
        });
        setCategories([...categories, added]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  // Helper to render icon component
  const renderIcon = (iconName: string, size: number = 24) => {
    const iconData = AVAILABLE_ICONS.find(i => i.name === iconName) || AVAILABLE_ICONS[0];
    const IconComponent = iconData.component;
    return <IconComponent size={size} color={iconData.color} />;
  };

  const getIconBg = (iconName: string) => {
    const iconData = AVAILABLE_ICONS.find(i => i.name === iconName) || AVAILABLE_ICONS[0];
    return iconData.bg;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Категории товаров</h1>
        </div>
      </header>

      <main className={styles.main}>
        {/* Top Panel */}
        <div className={styles.topPanel}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Поиск категорий..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.primaryBtn} onClick={openAddModal}>
            <Plus size={18} />
            Создать категорию
          </button>
        </div>

        {/* Grid Area */}
        <div className={styles.grid}>
          {filteredCategories.map(cat => (
            <div key={cat.id} className={`${styles.card} ${!cat.isActive ? styles.cardHidden : ''}`}>
              
              <div className={styles.cardHeader}>
                <div 
                  className={styles.iconBox}
                  style={{ backgroundColor: getIconBg(cat.iconName) }}
                >
                  {renderIcon(cat.iconName, 24)}
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.iconBtn} onClick={() => openEditModal(cat)} title="Редактировать">
                    <Edit2 size={16} />
                  </button>
                  <button className={styles.iconBtn} onClick={() => deleteCategory(cat.id)} title="Удалить">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.catName}>{cat.name}</h3>
                <span className={styles.itemCount}>Товаров внутри: {cat._count?.products || 0}</span>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.statusText}>
                  {cat.isActive ? 'Отображается на кассе' : 'Скрыта (В архиве)'}
                </span>
                <div 
                  className={`${styles.toggleSwitch} ${cat.isActive ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() => toggleStatus(cat.id, cat.isActive)}
                >
                  <div className={`${styles.toggleKnob} ${cat.isActive ? styles.knobOn : styles.knobOff}`} />
                </div>
              </div>

            </div>
          ))}
          
          {filteredCategories.length === 0 && (
            <div className={styles.emptyState}>
              <p>Категории не найдены</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingId ? 'Редактировать категорию' : 'Новая категория'}</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.modalForm}>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Название категории</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Например: Сезонная выпечка"
                  required
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Выберите иконку</label>
                <div className={styles.iconGrid}>
                  {AVAILABLE_ICONS.map(iconData => {
                    const IconComp = iconData.component;
                    const isSelected = newIcon === iconData.name;
                    return (
                      <div 
                        key={iconData.name}
                        className={`${styles.iconSelectBox} ${isSelected ? styles.iconSelectBoxActive : ''}`}
                        onClick={() => setNewIcon(iconData.name)}
                        style={{ backgroundColor: isSelected ? iconData.bg : '#f8fafc' }}
                      >
                        <IconComp size={24} color={isSelected ? iconData.color : '#64748b'} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Порядок сортировки (цифра)</label>
                <input 
                  type="number" 
                  className={styles.formInput} 
                  value={newSortOrder}
                  onChange={(e) => setNewSortOrder(e.target.value)}
                  placeholder="1"
                  min="1"
                />
                <span className={styles.helpText}>Определяет, какой по счету категория будет на кассе POS.</span>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitBtn} disabled={!newName.trim()}>
                  {editingId ? 'Сохранить изменения' : 'Создать категорию'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesModule;
