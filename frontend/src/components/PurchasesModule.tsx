import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Truck, AlertTriangle, FileText, CheckCircle2, X, Plus } from 'lucide-react';
import styles from './PurchasesModule.module.css';

interface Need {
  id: string;
  name: string;
  currentStock: number;
  minLimit: number;
  recommendedQty: number;
  unit: string;
}

type PurchaseStatus = 'В пути' | 'Доставлено' | 'Отменено';

interface PurchaseItem {
  id: string;
  name: string;
  orderedQty: number;
  unit: string;
}

interface Purchase {
  id: string;
  date: string;
  supplier: string;
  totalSum: number;
  status: PurchaseStatus;
  items: PurchaseItem[];
}

const MOCK_NEEDS: Need[] = [
  { id: 'n1', name: 'Мука высший сорт', currentStock: 450, minLimit: 500, recommendedQty: 20, unit: 'Мешок' },
  { id: 'n2', name: 'Дрожжи прессованные', currentStock: 15, minLimit: 20, recommendedQty: 5, unit: 'Коробка' },
  { id: 'n3', name: 'Масло подсолнечное', currentStock: 12, minLimit: 15, recommendedQty: 10, unit: 'Канистра' }
];

const MOCK_PURCHASES: Purchase[] = [
  {
    id: 'P-001', date: '04.07.2026', supplier: 'ТОО "Астык Трейд"', totalSum: 150000, status: 'В пути',
    items: [
      { id: 'i1', name: 'Мука высший сорт', orderedQty: 20, unit: 'Мешок' },
      { id: 'i2', name: 'Мука 1 сорт', orderedQty: 10, unit: 'Мешок' }
    ]
  },
  {
    id: 'P-002', date: '03.07.2026', supplier: 'ИП "Снабжение"', totalSum: 45000, status: 'В пути',
    items: [
      { id: 'i3', name: 'Дрожжи прессованные', orderedQty: 5, unit: 'Коробка' },
      { id: 'i4', name: 'Соль йодированная', orderedQty: 5, unit: 'Мешок' }
    ]
  },
  {
    id: 'P-003', date: '01.07.2026', supplier: 'ТОО "МайПродукт"', totalSum: 82000, status: 'Доставлено',
    items: [
      { id: 'i5', name: 'Масло подсолнечное', orderedQty: 10, unit: 'Канистра' },
      { id: 'i6', name: 'Маргарин', orderedQty: 5, unit: 'Коробка' }
    ]
  }
];

interface PurchasesModuleProps {
  onBack: () => void;
}

const PurchasesModule: React.FC<PurchasesModuleProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'needs' | 'history'>('needs');
  const [needs, setNeeds] = useState<Need[]>(MOCK_NEEDS);
  const [purchases, setPurchases] = useState<Purchase[]>(MOCK_PURCHASES);
  
  // Modals state
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [createOrderForNeed, setCreateOrderForNeed] = useState<Need | null>(null);
  
  // Create order form state
  const [newOrderSupplier, setNewOrderSupplier] = useState('');
  const [newOrderQty, setNewOrderQty] = useState('');

  // Stats
  const needsCount = needs.length;
  const inTransitOrders = purchases.filter(p => p.status === 'В пути');
  const inTransitCount = inTransitOrders.length;
  const activeDebt = inTransitOrders.reduce((sum, p) => sum + p.totalSum, 0);

  const selectedPurchase = purchases.find(p => p.id === selectedPurchaseId);

  const handleReceive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurchaseId) return;

    setPurchases(prev => prev.map(p => 
      p.id === selectedPurchaseId ? { ...p, status: 'Доставлено' } : p
    ));
    setSelectedPurchaseId(null);
  };

  const handleOpenCreateOrder = (need: Need) => {
    setCreateOrderForNeed(need);
    setNewOrderQty(String(need.recommendedQty));
    setNewOrderSupplier('');
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createOrderForNeed) return;

    const qty = parseInt(newOrderQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    const mockPrice = 4500; // Mock price per unit
    const newPurchase: Purchase = {
      id: `P-00${purchases.length + 1}`,
      date: new Date().toLocaleDateString('ru-RU'),
      supplier: newOrderSupplier,
      totalSum: qty * mockPrice,
      status: 'В пути',
      items: [
        {
          id: `new-${Date.now()}`,
          name: createOrderForNeed.name,
          orderedQty: qty,
          unit: createOrderForNeed.unit
        }
      ]
    };

    setPurchases([newPurchase, ...purchases]);
    setNeeds(prev => prev.filter(n => n.id !== createOrderForNeed.id));
    setCreateOrderForNeed(null);
    setActiveTab('history');
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
          <h1 className={styles.title}>Закупки сырья</h1>
        </div>
      </header>

      <main className={styles.main}>
        {/* Widgets */}
        <div className={styles.widgetsGrid}>
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Срочно к закупке (дефицит)</span>
              <span className={styles.widgetValue}>{needsCount} позиций</span>
            </div>
          </div>
          
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <Truck size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Заказы в пути</span>
              <span className={styles.widgetValue}>{inTransitCount} заказа</span>
            </div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
              <ShoppingCart size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Сумма активных заказов</span>
              <span className={styles.widgetValue}>{activeDebt.toLocaleString('ru-RU')} ₸</span>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className={styles.workspace}>
          
          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'needs' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('needs')}
            >
              Потребности
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Журнал закупок
            </button>
          </div>

          <div className={styles.tabContent}>
            
            {/* Needs Tab */}
            {activeTab === 'needs' && (
              <div className={styles.needsList}>
                {needs.map(need => (
                  <div key={need.id} className={styles.needCard}>
                    <div className={styles.needInfo}>
                      <h3 className={styles.needName}>{need.name}</h3>
                      <div className={styles.needMeta}>
                        Остаток: <span className={styles.stockWarning}>{need.currentStock}</span> (Мин: {need.minLimit})
                      </div>
                    </div>
                    
                    <div className={styles.needActionArea}>
                      <div className={styles.recommendationBox}>
                        <span className={styles.recommendationLabel}>Рекомендуется к закупке:</span>
                        <span className={styles.recommendationValue}>{need.recommendedQty} {need.unit}</span>
                      </div>
                      <button 
                        className={styles.createOrderBtn}
                        onClick={() => handleOpenCreateOrder(need)}
                      >
                        <Plus size={18} />
                        Сформировать заказ
                      </button>
                    </div>
                  </div>
                ))}
                
                {needs.length === 0 && (
                  <div className={styles.emptyState}>
                    <CheckCircle2 size={48} className={styles.emptyIconSuccess} />
                    <p>Все запасы в норме, закупки не требуются.</p>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Номер и Дата</th>
                      <th>Поставщик</th>
                      <th className={styles.textRight}>Сумма заказа</th>
                      <th className={styles.textRight}>Статус</th>
                      <th className={styles.textRight}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map(purchase => (
                      <tr key={purchase.id} className={styles.tableRow}>
                        <td>
                          <div className={styles.orderIdText}>{purchase.id}</div>
                          <div className={styles.orderDateText}>{purchase.date}</div>
                        </td>
                        <td>
                          <div className={styles.supplierText}>{purchase.supplier}</div>
                          <div className={styles.itemsCountText}>{purchase.items.length} позиций</div>
                        </td>
                        <td className={styles.textRight}>
                          <span className={styles.sumText}>{purchase.totalSum.toLocaleString('ru-RU')} ₸</span>
                        </td>
                        <td className={styles.textRight}>
                          <span className={`${styles.statusBadge} ${
                            purchase.status === 'В пути' ? styles.statusTransit : 
                            purchase.status === 'Доставлено' ? styles.statusSuccess : styles.statusDanger
                          }`}>
                            {purchase.status}
                          </span>
                        </td>
                        <td className={styles.textRight}>
                          {purchase.status === 'В пути' ? (
                            <button 
                              className={styles.receiveBtn}
                              onClick={() => setSelectedPurchaseId(purchase.id)}
                            >
                              Принять на склад
                            </button>
                          ) : (
                            <button className={styles.viewBtn}>
                              <FileText size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Receive Order Modal */}
      {selectedPurchaseId && selectedPurchase && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPurchaseId(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Приемка товара</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedPurchaseId(null)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleReceive}>
              <div className={styles.modalMetaInfo}>
                <div className={styles.metaRow}>
                  <span>Заказ:</span>
                  <strong>{selectedPurchase.id} от {selectedPurchase.date}</strong>
                </div>
                <div className={styles.metaRow}>
                  <span>Поставщик:</span>
                  <strong>{selectedPurchase.supplier}</strong>
                </div>
              </div>

              <div className={styles.itemsToReceive}>
                <h3 className={styles.sectionSubtitle}>Состав заказа:</h3>
                <div className={styles.verificationList}>
                  {selectedPurchase.items.map(item => (
                    <div key={item.id} className={styles.verificationItem}>
                      <span className={styles.vItemName}>{item.name}</span>
                      <div className={styles.vItemQty}>
                        Заказано: <strong>{item.orderedQty} {item.unit}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalAlert}>
                <CheckCircle2 size={20} className={styles.alertIcon} />
                <p>Нажимая «Подтвердить», вы автоматически пополняете складские остатки на указанное количество.</p>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setSelectedPurchaseId(null)}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Подтвердить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Create Order Modal */}
      {createOrderForNeed && (
        <div className={styles.modalOverlay} onClick={() => setCreateOrderForNeed(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Формирование заказа</h2>
              <button className={styles.closeBtn} onClick={() => setCreateOrderForNeed(null)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit}>
              <div className={styles.modalMetaInfo}>
                <div className={styles.metaRow}>
                  <span>Продукт:</span>
                  <strong>{createOrderForNeed.name}</strong>
                </div>
                <div className={styles.metaRow}>
                  <span>Остаток на складе:</span>
                  <strong>{createOrderForNeed.currentStock} {createOrderForNeed.unit}</strong>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Поставщик</label>
                <input 
                  type="text"
                  className={styles.formInput}
                  value={newOrderSupplier}
                  onChange={(e) => setNewOrderSupplier(e.target.value)}
                  placeholder='Например: ТОО "Астык Трейд"'
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Объем заказа ({createOrderForNeed.unit})</label>
                <input 
                  type="number" 
                  className={styles.formInput} 
                  value={newOrderQty}
                  onChange={(e) => setNewOrderQty(e.target.value)}
                  min="1"
                />
              </div>

              <div className={styles.orderSummaryBox}>
                <span className={styles.summaryLabel}>Итоговая сумма заказа:</span>
                <span className={styles.summaryTotal}>
                  {((parseInt(newOrderQty) || 0) * 4500).toLocaleString('ru-RU')} ₸
                </span>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setCreateOrderForNeed(null)}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitBtn} disabled={!newOrderQty || parseInt(newOrderQty) <= 0 || !newOrderSupplier.trim()}>
                  Отправить заявку
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PurchasesModule;
