import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Save, AlertTriangle, ArrowLeft, ClipboardList, TrendingUp, Settings2, X, Info, PackageOpen, Warehouse } from 'lucide-react';
import styles from './InventoryModule.module.css';
import { api } from '../utils/api';

interface InventoryItem {
  id: number;
  name: string;
  stock: number | string;
  minLimit: number | string;
  costPerUnit: number | string;
  unit: string;
}

interface InventoryModuleProps {
  onBack: () => void;
}

const InventoryModule: React.FC<InventoryModuleProps> = ({ onBack }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Drawer form inputs state
  const [editMinLimit, setEditMinLimit] = useState('');
  
  // Add new item state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemBaseUnit, setNewItemBaseUnit] = useState('г');
  const [newItemInputQty, setNewItemInputQty] = useState('');
  const [newItemInputScale, setNewItemInputScale] = useState('кг');
  const [newItemTotalCost, setNewItemTotalCost] = useState('');
  const [newItemMinLimitInput, setNewItemMinLimitInput] = useState('');

  // Adjustment form state
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustType, setAdjustType] = useState<'AUDIT' | 'WRITE_OFF'>('AUDIT');
  const [adjustRealStock, setAdjustRealStock] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const fetchInventory = async () => {
    try {
      const data = await api.get('/inventory');
      setInventory(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Stats
  const totalItemsCount = inventory.length;
  const criticalItemsCount = inventory.filter(item => Number(item.stock) < Number(item.minLimit)).length;
  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.stock) * Number(item.costPerUnit)), 0);

  const handleRowClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditMinLimit(String(item.minLimit));
    setIsAdjusting(false);
    setAdjustRealStock('');
    setAdjustReason('');
  };

  const closeDrawer = () => {
    setSelectedItem(null);
  };

  const handleSaveSettings = async () => {
    if (!selectedItem) return;
    try {
      const minLimitVal = parseFloat(editMinLimit);
      await api.patch(`/inventory/${selectedItem.id}`, {
        minLimit: isNaN(minLimitVal) ? Number(selectedItem.minLimit) : minLimitVal,
      });
      await fetchInventory();
      closeDrawer();
    } catch (err) {
      console.error('Failed to update inventory item settings', err);
    }
  };

  const handleAdjust = async () => {
    if (!selectedItem || !adjustRealStock) return;
    try {
      const realStock = parseFloat(adjustRealStock);
      if (isNaN(realStock)) return;

      const currentStock = Number(selectedItem.stock);
      const diff = realStock - currentStock;

      if (diff === 0) {
        alert('Разницы нет. Текущий остаток совпадает с реальным.');
        return;
      }

      const confirmMsg = diff < 0 
        ? `Внимание! Будет списано ${Math.abs(diff)} ${selectedItem.unit}. Это отразится в убытках. Продолжить?`
        : `Будет оприходован излишек: ${diff} ${selectedItem.unit}. Продолжить?`;

      if (!window.confirm(confirmMsg)) return;

      await api.post(`/inventory/adjust`, {
        rawMaterialId: selectedItem.id,
        type: adjustType,
        amount: diff,
        reason: adjustReason
      });

      await fetchInventory();
      closeDrawer();
    } catch (err) {
      console.error('Failed to adjust inventory', err);
      alert('Ошибка при корректировке');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это сырье? Это также удалит все связанные записи (корректировки, закупки). Эту операцию нельзя отменить!')) {
      return;
    }
    try {
      await api.delete(`/inventory/${id}`);
      setSelectedItem(null);
      await fetchInventory();
    } catch (err) {
      console.error('Failed to delete item', err);
      alert('Ошибка при удалении сырья');
    }
  };

  const getMultiplier = (scale: string, base: string) => {
    if (base === 'г') {
      if (scale === 'кг') return 1000;
      if (scale === 'т') return 1000000;
    }
    if (base === 'мл' && scale === 'л') return 1000;
    return 1;
  };

  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const multiplier = getMultiplier(newItemInputScale, newItemBaseUnit);
      const stockInBaseUnit = (parseFloat(newItemInputQty) || 0) * multiplier;
      const totalCost = parseFloat(newItemTotalCost) || 0;
      const costPerUnit = stockInBaseUnit > 0 ? totalCost / stockInBaseUnit : 0;
      const minLimitInBaseUnit = (parseFloat(newItemMinLimitInput) || 0) * multiplier;

      await api.post('/inventory', {
        name: newItemName,
        unit: newItemBaseUnit,
        minLimit: minLimitInBaseUnit,
        costPerUnit: costPerUnit,
        stock: stockInBaseUnit
      });
      setIsAddingItem(false);
      setNewItemName('');
      setNewItemInputQty('');
      setNewItemTotalCost('');
      setNewItemMinLimitInput('');
      await fetchInventory();
    } catch (err) {
      console.error('Failed to create new item', err);
      alert('Ошибка при добавлении сырья');
    }
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
          <h1 className={styles.title}>Сырье и Склад</h1>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => alert('Чтобы провести инвентаризацию конкретного сырья, кликните по нему в таблице и выберите вкладку "Списание / Сверка".')}>
            <ClipboardList size={18} />
            <span>Инвентаризация</span>
          </button>
          <button className={styles.primaryBtn} onClick={() => setIsAddingItem(true)}>
            <Plus size={18} />
            <span>Добавить сырье</span>
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Widgets */}
        <div className={styles.widgetsGrid}>
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <Warehouse size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Стоимость склада</span>
              <span className={styles.widgetValue}>{totalValue.toLocaleString('ru-RU')} ₸</span>
            </div>
          </div>
          
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Критические остатки</span>
              <span className={styles.widgetValue} style={{ color: criticalItemsCount > 0 ? '#ef4444' : 'inherit' }}>
                {criticalItemsCount} позиций
              </span>
            </div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
              <PackageOpen size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Всего позиций</span>
              <span className={styles.widgetValue}>{totalItemsCount}</span>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Наименование сырья</th>
                <th className={styles.textRight}>Текущий остаток</th>
                <th className={styles.textRight}>Мин. лимит</th>
                <th className={styles.textRight}>Себестоимость</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const isCritical = Number(item.stock) < Number(item.minLimit);
                return (
                  <tr 
                    key={item.id} 
                    className={`${styles.tableRow} ${isCritical ? styles.rowCritical : ''}`}
                    onClick={() => handleRowClick(item)}
                  >
                    <td>
                      <div className={styles.itemNameWrapper}>
                        {isCritical && <AlertTriangle size={16} className={styles.criticalIcon} />}
                        <span className={styles.itemName}>{item.name}</span>
                      </div>
                    </td>
                    <td className={styles.textRight}>
                      <span className={`${styles.stockValue} ${isCritical ? styles.textCritical : ''}`}>
                        {Number(item.stock).toLocaleString('ru-RU')} <span className={styles.unitText}>{item.unit}</span>
                      </span>
                    </td>
                    <td className={styles.textRight}>
                      <span className={styles.limitValue}>
                        {Number(item.minLimit).toLocaleString('ru-RU')} <span className={styles.unitText}>{item.unit}</span>
                      </span>
                    </td>
                    <td className={styles.textRight}>
                      <span className={styles.costValue}>
                        {Number(item.costPerUnit).toLocaleString('ru-RU')} ₸ <span className={styles.unitText}>/ {item.unit}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Drawer Overlay */}
      {selectedItem && (
        <div className={styles.drawerOverlay} onClick={closeDrawer}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitleWrapper}>
                <Settings2 size={24} className={styles.drawerIcon} />
                <h2 className={styles.drawerTitle}>Настройки сырья</h2>
              </div>
              <button className={styles.closeBtn} onClick={closeDrawer}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.drawerBody}>
              <div className={styles.drawerItemInfo}>
                <div className={styles.drawerItemName}>{selectedItem.name}</div>
                <div className={styles.drawerItemStock}>Остаток по базе: {Number(selectedItem.stock)} {selectedItem.unit}</div>
                <div className={styles.drawerItemCost}>Себестоимость: {Number(selectedItem.costPerUnit).toFixed(2)} ₸ / {selectedItem.unit}</div>
              </div>

              <div className={styles.tabsContainer} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <button 
                  onClick={() => setIsAdjusting(false)} 
                  style={{ background: 'none', border: 'none', fontWeight: !isAdjusting ? 'bold' : 'normal', color: !isAdjusting ? '#2563eb' : '#64748b', cursor: 'pointer' }}
                >
                  Настройки
                </button>
                <button 
                  onClick={() => setIsAdjusting(true)} 
                  style={{ background: 'none', border: 'none', fontWeight: isAdjusting ? 'bold' : 'normal', color: isAdjusting ? '#ef4444' : '#64748b', cursor: 'pointer' }}
                >
                  Списание / Сверка
                </button>
              </div>

              {!isAdjusting ? (
                <div className={styles.settingsGroup}>
                  <h3 className={styles.settingsSubtitle}>Пороговые значения</h3>
                  
                  <div className={styles.formField}>
                    <label>Минимальный остаток (лимит)</label>
                    <input 
                      type="number" 
                      className={styles.inputField} 
                      value={editMinLimit}
                      onChange={(e) => setEditMinLimit(e.target.value)}
                      placeholder="0"
                    />
                    <span className={styles.fieldHint}>Минимальный объем ({selectedItem.unit}), при достижении которого срабатывает предупреждение</span>
                  </div>
                </div>
              ) : (
                <div className={styles.settingsGroup}>
                  <h3 className={styles.settingsSubtitle} style={{ color: '#ef4444' }}>Корректировка остатков</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                    Введите ФАКТИЧЕСКИЙ остаток. Если он меньше базы, разница спишется в убытки.
                  </p>

                  <div className={styles.formField}>
                    <label>Тип корректировки</label>
                    <select 
                      className={styles.inputField}
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value as any)}
                    >
                      <option value="AUDIT">Инвентаризация (Плановая сверка)</option>
                      <option value="WRITE_OFF">Списание (Порча / Брак / Рассыпали)</option>
                    </select>
                  </div>

                  <div className={styles.formField}>
                    <label>Реальный фактический остаток ({selectedItem.unit})</label>
                    <input 
                      type="number" 
                      className={styles.inputField} 
                      value={adjustRealStock}
                      onChange={(e) => setAdjustRealStock(e.target.value)}
                      placeholder="Например: 25000"
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>Причина / Комментарий</label>
                    <input 
                      type="text" 
                      className={styles.inputField} 
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="Например: Скисла часть молока"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.drawerFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {!isAdjusting ? (
                <>
                  <button 
                    className={styles.secondaryBtn} 
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  >
                    <X size={18} />
                    Удалить
                  </button>
                  <button className={styles.saveBtn} onClick={handleSaveSettings} disabled={!editMinLimit}>
                    <Save size={18} />
                    Сохранить
                  </button>
                </>
              ) : (
                <button className={styles.saveBtn} onClick={handleAdjust} disabled={!adjustRealStock} style={{ backgroundColor: '#ef4444' }}>
                  <AlertTriangle size={18} />
                  Подтвердить корректировку
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {isAddingItem && (
        <div className={styles.drawerOverlay} onClick={() => setIsAddingItem(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()} style={{ width: '480px', margin: 'auto', borderRadius: '12px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Новое сырье</h2>
              <button className={styles.closeBtn} onClick={() => setIsAddingItem(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddNewItem} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className={styles.drawerBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                
                {/* 1. Основная информация */}
                <div className={styles.settingsGroup} style={{ gap: '1rem' }}>
                  <div className={styles.formField}>
                    <label>Название сырья</label>
                    <input 
                      type="text" 
                      className={styles.inputField} 
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Например: Мука 1 сорт"
                      required
                    />
                  </div>

                <div className={styles.formField}>
                  <label>Базовая единица (для расхода по рецептам)</label>
                  <select 
                    className={styles.inputField} 
                    value={newItemBaseUnit}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewItemBaseUnit(val);
                      if (val === 'г') setNewItemInputScale('кг');
                      else if (val === 'мл') setNewItemInputScale('л');
                      else setNewItemInputScale('шт');
                    }}
                  >
                    <option value="г">Граммы (г)</option>
                    <option value="мл">Миллилитры (мл)</option>
                    <option value="шт">Штуки (шт)</option>
                  </select>
                </div>

                </div>

                {/* 2. Завоз */}
                <div className={styles.settingsGroup} style={{ gap: '1rem', marginTop: '1rem' }}>
                  <h3 className={styles.settingsSubtitle}>Первоначальный завоз (необязательно)</h3>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div className={styles.formField} style={{ flex: 1 }}>
                      <label>Привезенный объем</label>
                      <input 
                        type="number" 
                        className={styles.inputField} 
                        value={newItemInputQty}
                        onChange={(e) => setNewItemInputQty(e.target.value)}
                        placeholder="Например: 500"
                      />
                    </div>
                    <div className={styles.formField} style={{ width: '140px' }}>
                      <label>Ед. изм.</label>
                      <select 
                        className={styles.inputField}
                        value={newItemInputScale}
                        onChange={(e) => setNewItemInputScale(e.target.value)}
                      >
                        {newItemBaseUnit === 'г' && (
                          <>
                            <option value="т">Тонны (т)</option>
                            <option value="кг">Кг (кг)</option>
                            <option value="г">Граммы (г)</option>
                          </>
                        )}
                        {newItemBaseUnit === 'мл' && (
                          <>
                            <option value="л">Литры (л)</option>
                            <option value="мл">Мл (мл)</option>
                          </>
                        )}
                        {newItemBaseUnit === 'шт' && <option value="шт">Штуки (шт)</option>}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formField}>
                    <label>Общая стоимость за этот объем (₸)</label>
                    <input 
                      type="number" 
                      className={styles.inputField} 
                      value={newItemTotalCost}
                      onChange={(e) => setNewItemTotalCost(e.target.value)}
                      placeholder="Например: 150000"
                    />
                    <div className={styles.hintBox}>
                      <Info size={16} />
                      Система автоматически высчитает себестоимость за 1 {newItemBaseUnit}
                    </div>
                  </div>
                </div>

                {/* 3. Уведомления */}
                <div className={styles.settingsGroup} style={{ gap: '1rem', marginTop: '1rem' }}>
                  <h3 className={styles.settingsSubtitle}>Настройка уведомлений</h3>

                  <div className={styles.formField}>
                    <label>Минимальный лимит ({newItemInputScale})</label>
                    <input 
                      type="number" 
                      className={styles.inputField} 
                      value={newItemMinLimitInput}
                      onChange={(e) => setNewItemMinLimitInput(e.target.value)}
                      placeholder="Например: 50"
                    />
                    <span className={styles.fieldHint} style={{ marginTop: '0.25rem' }}>
                      Если остаток упадет ниже этого значения, система предупредит вас.
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.drawerFooter}>
                <button type="submit" className={styles.saveBtn} disabled={!newItemName.trim()}>
                  <Save size={18} />
                  Сохранить сырье
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryModule;
