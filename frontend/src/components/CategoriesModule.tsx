import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Plus, Trash2, Edit2, 
  Flame, Wheat, Cookie, Cake, Coffee, Sun, Star, ShoppingBag, X 
} from 'lucide-react';
import styles from './CategoriesModule.module.css';

interface Category {
  id: string;
  name: string;
  itemCount: number;
  isActive: boolean;
  iconName: string;
  sortOrder: number;
}

const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Тандырные лепешки', itemCount: 8, isActive: true, iconName: 'Flame', sortOrder: 1 },
  { id: 'c2', name: 'Формовой хлеб', itemCount: 12, isActive: true, iconName: 'Wheat', sortOrder: 2 },
  { id: 'c3', name: 'Сдоба и Булочки', itemCount: 25, isActive: true, iconName: 'Cookie', sortOrder: 3 },
  { id: 'c4', name: 'Кондитерские изделия', itemCount: 10, isActive: true, iconName: 'Cake', sortOrder: 4 },
  { id: 'c5', name: 'Напитки', itemCount: 15, isActive: true, iconName: 'Coffee', sortOrder: 5 },
  { id: 'c6', name: 'Сезонная выпечка', itemCount: 4, isActive: false, iconName: 'Sun', sortOrder: 6 },
];

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
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Flame');
  const [newSortOrder, setNewSortOrder] = useState('1');

  const filteredCategories = useMemo(() => {
    return categories
      .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, searchQuery]);

  const toggleStatus = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const deleteCategory = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (editingId) {
      setCategories(prev => prev.map(c => 
        c.id === editingId 
          ? { ...c, name: newName, iconName: newIcon, sortOrder: parseInt(newSortOrder) || 0 }
          : c
      ));
    } else {
      const newCat: Category = {
        id: `cat_${Date.now()}`,
        name: newName,
        itemCount: 0,
        isActive: true,
        iconName: newIcon,
        sortOrder: parseInt(newSortOrder) || 0
      };
      setCategories([...categories, newCat]);
    }
    
    setIsModalOpen(false);
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
                <span className={styles.itemCount}>Товаров внутри: {cat.itemCount}</span>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.statusText}>
                  {cat.isActive ? 'Отображается на кассе' : 'Скрыта (В архиве)'}
                </span>
                <div 
                  className={`${styles.toggleSwitch} ${cat.isActive ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() => toggleStatus(cat.id)}
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
