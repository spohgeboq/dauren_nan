import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, ClipboardList, AlertTriangle, PackageOpen, X, Settings2, Save, Warehouse } from 'lucide-react';
import styles from './InventoryModule.module.css';
import { api } from '../utils/api';

interface InventoryItem {
  id: string | number;
  name: string;
  currentStock: number;
  minLimit: number;
  costPerUnit: number;
  baseUnit: string;
  purchaseUnit: string;
  conversionRatio: number;
}

interface InventoryModuleProps {
  onBack: () => void;
}

const InventoryModule: React.FC<InventoryModuleProps> = ({ onBack }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Drawer form inputs state
  const [editMinLimit, setEditMinLimit] = useState('');
  const [editConversion, setEditConversion] = useState('');

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
  const criticalItemsCount = inventory.filter(item => item.currentStock < item.minLimit).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);

  const handleRowClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditMinLimit(String(item.minLimit));
    setEditConversion(String(item.conversionRatio));
  };

  const closeDrawer = () => {
    setSelectedItem(null);
  };

  const handleSaveSettings = async () => {
    if (!selectedItem) return;

    try {
      const minLimitVal = parseFloat(editMinLimit);
      const conversionVal = parseFloat(editConversion);

      await api.patch(`/inventory/${selectedItem.id}`, {
        minLimit: isNaN(minLimitVal) ? selectedItem.minLimit : minLimitVal,
        conversionRatio: isNaN(conversionVal) ? selectedItem.conversionRatio : conversionVal
      });

      await fetchInventory();
      closeDrawer();
    } catch (err) {
      console.error('Failed to update inventory item settings', err);
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
          <button className={styles.secondaryBtn}>
            <ClipboardList size={18} />
            <span>Инвентаризация</span>
          </button>
          <button className={styles.primaryBtn}>
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
                const isCritical = item.currentStock < item.minLimit;
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
                        {item.currentStock.toLocaleString('ru-RU')} <span className={styles.unitText}>{item.baseUnit}</span>
                      </span>
                    </td>
                    <td className={styles.textRight}>
                      <span className={styles.limitValue}>
                        {item.minLimit.toLocaleString('ru-RU')} <span className={styles.unitText}>{item.baseUnit}</span>
                      </span>
                    </td>
                    <td className={styles.textRight}>
                      <span className={styles.costValue}>
                        {item.costPerUnit.toLocaleString('ru-RU')} ₸ <span className={styles.unitText}>/ {item.baseUnit}</span>
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
                <div className={styles.drawerItemStock}>Остаток: {selectedItem.currentStock} {selectedItem.baseUnit}</div>
              </div>

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
                  <span className={styles.fieldHint}>Минимальный объем сырья, при достижении которого срабатывает предупреждение</span>
                </div>
              </div>

              <div className={styles.settingsGroup}>
                <h3 className={styles.settingsSubtitle}>Коэффициенты пересчета</h3>
                
                <div className={styles.formField}>
                  <label>Базовая единица (в чем храним)</label>
                  <input type="text" readOnly value={selectedItem.baseUnit} className={styles.inputField} />
                  <span className={styles.fieldHint}>Используется в рецептах и списаниях</span>
                </div>

                <div className={styles.formField}>
                  <label>Единица закупки (в чем покупаем)</label>
                  <input type="text" readOnly value={selectedItem.purchaseUnit} className={styles.inputField} />
                </div>

                <div className={styles.formField}>
                  <label>Коэффициент (в 1 закуп. ед.)</label>
                  <div className={styles.conversionFormula}>
                    <span className={styles.formulaText}>1 {selectedItem.purchaseUnit.toLowerCase()} =</span>
                    <input 
                      type="number" 
                      className={`${styles.inputField} ${styles.inputShort}`} 
                      value={editConversion}
                      onChange={(e) => setEditConversion(e.target.value)}
                    />
                    <span className={styles.formulaText}>{selectedItem.baseUnit}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <button className={styles.saveBtn} onClick={handleSaveSettings} disabled={!editMinLimit || !editConversion}>
                <Save size={18} />
                Сохранить настройки
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryModule;
