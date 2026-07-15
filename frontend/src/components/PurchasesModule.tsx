import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Truck, AlertTriangle, FileText, CheckCircle2, X, Plus, Users, Landmark, Search } from 'lucide-react';
import styles from './PurchasesModule.module.css';
import { api } from '../utils/api';

interface Need {
  id: string | number;
  name: string;
  currentStock: number;
  minLimit: number;
  recommendedQty: number;
  unit: string;
}

interface Supplier {
  id: number;
  name: string;
  phone: string;
  balance: number;
}

type PurchaseStatus = 'В пути' | 'Доставлено' | 'Отменено';
type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

interface PurchaseItem {
  id: string | number;
  name: string;
  orderedQty: number;
  unit: string;
  price: number;
}

interface Purchase {
  id: string;
  dbId: number;
  date: string;
  supplier: Supplier | null;
  supplierId: number | null;
  invoiceNumber: string;
  totalSum: number;
  status: PurchaseStatus;
  paymentStatus: PaymentStatus;
  items: PurchaseItem[];
}

interface RawMaterial {
  id: number;
  name: string;
  stock: number;
  unit: string;
  costPerUnit: number;
}

interface PurchasesModuleProps {
  onBack: () => void;
}

const PurchasesModule: React.FC<PurchasesModuleProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'needs' | 'suppliers' | 'history'>('needs');
  const [needs, setNeeds] = useState<Need[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  const [isPayingSupplier, setIsPayingSupplier] = useState<Supplier | null>(null);
  
  // Create Purchase State
  const [newPurchaseDate, setNewPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newPurchaseSupplierName, setNewPurchaseSupplierName] = useState('');
  const [isPaidRightNow, setIsPaidRightNow] = useState(false);
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState<'Наличные' | 'Kaspi'>('Kaspi');
  const [purchaseItems, setPurchaseItems] = useState<{ rawMaterialId: string, quantity: string, scale: string, totalRowSum: string }[]>([]);

  // Payment State
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [needsData, purchasesData, suppliersData, rawMaterialsData] = await Promise.all([
        api.get('/purchases/needs'),
        api.get('/purchases'),
        api.get('/purchases/suppliers'),
        api.get('/inventory')
      ]);

      const statusMap: Record<string, PurchaseStatus> = {
        'IN_TRANSIT': 'В пути',
        'DELIVERED': 'Доставлено',
        'CANCELLED': 'Отменено',
        'В пути': 'В пути',
        'Доставлено': 'Доставлено',
        'Отменено': 'Отменено'
      };

      const mappedPurchases = (purchasesData || []).map((p: any) => ({
        id: `P-${String(p.id).padStart(3, '0')}`,
        dbId: p.id,
        date: new Date(p.date).toLocaleDateString('ru-RU'),
        supplier: p.supplier || null,
        supplierId: p.supplierId,
        invoiceNumber: p.invoiceNumber || '',
        totalSum: Number(p.totalSum) || 0,
        status: statusMap[p.status] || 'В пути',
        paymentStatus: p.paymentStatus,
        items: (p.items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          orderedQty: Number(item.orderedQty),
          unit: item.unit,
          price: Number(item.price)
        }))
      }));

      setNeeds(needsData || []);
      setPurchases(mappedPurchases);
      setSuppliers(suppliersData || []);
      setRawMaterials(rawMaterialsData || []);
    } catch (e) {
      console.error('Failed to load purchases data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats
  const needsCount = needs.length;
  const totalDebt = suppliers.reduce((sum, s) => sum + Number(s.balance), 0);
  const inTransitCount = purchases.filter(p => p.status === 'В пути').length;

  const selectedPurchase = purchases.find(p => p.id === selectedPurchaseId);

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurchaseId) return;

    const p = purchases.find(item => item.id === selectedPurchaseId);
    if (!p) return;

    try {
      await api.patch(`/purchases/${p.dbId}/receive`);
      setSelectedPurchaseId(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to receive purchase', err);
    }
  };

  const handlePaySupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPayingSupplier) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await api.post(`/purchases/suppliers/${isPayingSupplier.id}/pay`, { amount });
      setIsPayingSupplier(null);
      setPaymentAmount('');
      await fetchData();
    } catch (err) {
      console.error('Failed to pay supplier', err);
    }
  };

  const handleAddPurchaseItemRow = () => {
    setPurchaseItems([...purchaseItems, { rawMaterialId: '', quantity: '', scale: 'base', totalRowSum: '' }]);
  };

  const handleRemovePurchaseItemRow = (index: number) => {
    const newItems = [...purchaseItems];
    newItems.splice(index, 1);
    setPurchaseItems(newItems);
  };

  const handleUpdatePurchaseItemRow = (index: number, field: string, value: string) => {
    const newItems = [...purchaseItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPurchaseItems(newItems);
  };

  const handleCreatePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const items = purchaseItems.map(item => {
      const rm = rawMaterials.find(r => r.id.toString() === item.rawMaterialId);
      if (!rm) return null;
      
      let baseQty = parseFloat(item.quantity);
      if (item.scale === 'kg' && rm.unit === 'г') baseQty *= 1000;
      if (item.scale === 'L' && rm.unit === 'мл') baseQty *= 1000;
      if (item.scale === 'tons' && rm.unit === 'г') baseQty *= 1000000;

      return {
        name: rm.name,
        orderedQty: baseQty,
        unit: rm.unit,
        rawMaterialId: rm.id,
        price: parseFloat(item.totalRowSum) || 0
      };
    }).filter(Boolean);

    if (items.length === 0) return;

    const totalSum = items.reduce((sum, item) => sum + (item?.price || 0), 0);

    try {
      await api.post('/purchases', {
        date: new Date(newPurchaseDate).toISOString(),
        supplierName: newPurchaseSupplierName.trim(),
        totalSum,
        items,
        isPaidRightNow,
        paymentMethod: purchasePaymentMethod === 'Наличные' ? 'CASH' : 'KASPI'
      });

      setIsCreatingPurchase(false);
      setPurchaseItems([]);
      setNewPurchaseSupplierName('');
      setIsPaidRightNow(false);
      setPurchasePaymentMethod('Kaspi');
      setNewPurchaseDate(new Date().toISOString().split('T')[0]);
      setActiveTab('history');
      await fetchData();
    } catch (err) {
      console.error('Failed to create purchase order', err);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Закупки и Взаиморасчеты</h1>
        </div>
      </header>

      <main className={styles.main}>
        {/* Widgets */}
        <div className={styles.widgetsGrid}>
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
              <Landmark size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Наш долг поставщикам</span>
              <span className={styles.widgetValue}>{totalDebt.toLocaleString('ru-RU')} ₸</span>
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
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
              <AlertTriangle size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Срочно к закупке</span>
              <span className={styles.widgetValue}>{needsCount} позиций</span>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className={styles.workspace}>
          <div className={styles.tabsContainer}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'needs' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('needs')}
            >
              Потребности
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'suppliers' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('suppliers')}
            >
              Поставщики (Долги)
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Журнал приходов
            </button>
          </div>

          <div className={styles.tabContent}>
            
            {/* Needs Tab */}
            {activeTab === 'needs' && (
              <div className={styles.needsList}>
                {isLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Загрузка потребностей...</div>
                ) : (
                  needs.map(need => (
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
                          onClick={() => {
                            setIsCreatingPurchase(true);
                            setPurchaseItems([{ rawMaterialId: String(need.id), quantity: String(need.recommendedQty), scale: 'base', totalRowSum: '' }]);
                          }}
                        >
                          <Plus size={18} />
                          Сформировать заказ
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {!isLoading && needs.length === 0 && (
                  <div className={styles.emptyState}>
                    <CheckCircle2 size={48} className={styles.emptyIconSuccess} />
                    <p>Все запасы в норме, закупки не требуются.</p>
                  </div>
                )}
              </div>
            )}

            {/* Suppliers Tab */}
            {activeTab === 'suppliers' && (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Название поставщика</th>
                      <th className={styles.textRight}>Текущий долг (Баланс)</th>
                      <th className={styles.textRight}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map(sup => (
                      <tr key={sup.id} className={styles.tableRow}>
                        <td>
                          <div className={styles.supplierText}>{sup.name}</div>
                          <div className={styles.itemsCountText}>{sup.phone || 'Нет телефона'}</div>
                        </td>
                        <td className={styles.textRight}>
                          <span className={styles.sumText} style={{ color: Number(sup.balance) > 0 ? '#ef4444' : '#10b981' }}>
                            {Number(sup.balance).toLocaleString('ru-RU')} ₸
                          </span>
                        </td>
                        <td className={styles.textRight}>
                          <button 
                            className={styles.receiveBtn}
                            onClick={() => setIsPayingSupplier(sup)}
                            style={{ backgroundColor: '#10b981' }}
                            disabled={Number(sup.balance) <= 0}
                          >
                            Сделать выплату
                          </button>
                        </td>
                      </tr>
                    ))}
                    {suppliers.length === 0 && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Нет данных по поставщикам</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className={styles.tableContainer}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button className={styles.createOrderBtn} onClick={() => {
                    setIsCreatingPurchase(true);
                    setPurchaseItems([{ rawMaterialId: '', quantity: '', scale: 'base', totalRowSum: '' }]);
                  }}>
                    <Plus size={18} /> Новая накладная (Приход)
                  </button>
                </div>
                {isLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Загрузка истории...</div>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Закупка / Дата</th>
                        <th>Поставщик</th>
                        <th className={styles.textRight}>Сумма прихода</th>
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
                            <div className={styles.supplierText}>{purchase.supplier?.name || 'Неизвестен'}</div>
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
                                Оприходовать
                              </button>
                            ) : (
                              <button className={styles.viewBtn}>
                                <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Make Payment Modal */}
      {isPayingSupplier && (
        <div className={styles.modalOverlay} onClick={() => setIsPayingSupplier(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Выплата поставщику</h2>
              <button className={styles.closeBtn} onClick={() => setIsPayingSupplier(null)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePaySupplier} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className={styles.modalMetaInfo}>
                <div className={styles.metaRow}>
                  <span>Поставщик:</span>
                  <strong>{isPayingSupplier.name}</strong>
                </div>
                <div className={styles.metaRow}>
                  <span>Текущий долг:</span>
                  <strong style={{ color: '#ef4444' }}>{Number(isPayingSupplier.balance).toLocaleString('ru-RU')} ₸</strong>
                </div>
              </div>

              <div className={styles.formField}>
                <label>Сумма выплаты из кассы (₸)</label>
                <input 
                  type="number"
                  className={styles.inputField}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  min="1"
                  max={Number(isPayingSupplier.balance)}
                  required
                />
              </div>

              <div className={styles.modalAlert}>
                <CheckCircle2 size={20} className={styles.alertIcon} />
                <p>При подтверждении эта сумма будет списана из кассы и зафиксирована в Расходах, а долг перед поставщиком уменьшится.</p>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsPayingSupplier(null)}>Отмена</button>
                <button type="submit" className={styles.submitBtn}>Подтвердить выплату</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Purchase Modal */}
      {selectedPurchaseId && selectedPurchase && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPurchaseId(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Оприходование накладной</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedPurchaseId(null)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleReceive} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className={styles.modalMetaInfo}>
                <div className={styles.metaRow}>
                  <span>Заказ:</span>
                  <strong>{selectedPurchase.id}</strong>
                </div>
                <div className={styles.metaRow}>
                  <span>Сумма:</span>
                  <strong>{selectedPurchase.totalSum.toLocaleString('ru-RU')} ₸</strong>
                </div>
              </div>

              <div className={styles.modalAlert}>
                <CheckCircle2 size={20} className={styles.alertIcon} />
                <p>Нажимая «Подтвердить», вы пополняете склад, автоматически пересчитываете плавающую себестоимость сырья и вешаете этот долг на поставщика.</p>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setSelectedPurchaseId(null)}>Отмена</button>
                <button type="submit" className={styles.submitBtn}>Подтвердить приемку</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Purchase Modal */}
      {isCreatingPurchase && (
        <div className={styles.drawerOverlay} onClick={() => setIsCreatingPurchase(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ width: '600px', margin: 'auto', borderRadius: '12px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Новая накладная (Приход)</h2>
              <button className={styles.closeBtn} onClick={() => setIsCreatingPurchase(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreatePurchaseSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className={styles.drawerBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                  <div className={styles.formField}>
                    <label>Дата прихода</label>
                    <input 
                      type="date" 
                      className={styles.inputField} 
                      value={newPurchaseDate} 
                      onChange={e => setNewPurchaseDate(e.target.value)} 
                      required
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>От кого привезли? (Поставщик)</label>
                    <input 
                      type="text" 
                      className={styles.inputField} 
                      value={newPurchaseSupplierName} 
                      onChange={e => setNewPurchaseSupplierName(e.target.value)} 
                      placeholder="Например: ТОО Астык"
                      required
                    />
                  </div>
                </div>

                <div className={styles.divider} />
                <h3 className={styles.sectionSubtitle}>Что привезли?</h3>

                {purchaseItems.map((item, index) => {
                  const rm = rawMaterials.find(r => r.id.toString() === item.rawMaterialId);
                  const isWeight = rm?.unit === 'г';
                  const isLiquid = rm?.unit === 'мл';
                  
                  return (
                    <div key={index} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                      <button 
                        type="button" 
                        onClick={() => handleRemovePurchaseItemRow(index)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <X size={20} />
                      </button>
                      
                      <div className={styles.formField}>
                        <label>Выберите сырье</label>
                        <select 
                          className={styles.inputField} 
                          value={item.rawMaterialId} 
                          onChange={e => handleUpdatePurchaseItemRow(index, 'rawMaterialId', e.target.value)}
                          required
                        >
                          <option value="">-- Выберите --</option>
                          {rawMaterials.map(r => <option key={r.id} value={r.id}>{r.name} (хранится в {r.unit})</option>)}
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className={styles.formField}>
                            <label>Объем (сколько привезли?)</label>
                            <input 
                              type="number" 
                              className={styles.inputField} 
                              value={item.quantity} 
                              onChange={e => handleUpdatePurchaseItemRow(index, 'quantity', e.target.value)}
                              min="0.1" step="0.1" required
                            />
                          </div>
                          <div className={styles.formField}>
                            <label>В чем?</label>
                            <select 
                              className={styles.inputField} 
                              value={item.scale} 
                              onChange={e => handleUpdatePurchaseItemRow(index, 'scale', e.target.value)}
                            >
                              <option value="base">{rm ? rm.unit : 'Единицы'}</option>
                              {isWeight && <option value="kg">Килограммы (кг)</option>}
                              {isWeight && <option value="tons">Тонны (т)</option>}
                              {isLiquid && <option value="L">Литры (л)</option>}
                            </select>
                          </div>
                        </div>
                        <div className={styles.formField}>
                          <label>За сколько купили? (Итого ₸)</label>
                          <input 
                            type="number" 
                            className={styles.inputField} 
                            value={item.totalRowSum} 
                            onChange={e => handleUpdatePurchaseItemRow(index, 'totalRowSum', e.target.value)}
                            min="1" required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button 
                  type="button" 
                  onClick={handleAddPurchaseItemRow}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', background: 'transparent', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Plus size={18} /> Добавить позицию
                </button>

                <div style={{ padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '0.75rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '1.125rem', color: '#0369a1' }}>
                    <span>Общая сумма накладной:</span>
                    <span>
                      {purchaseItems.reduce((sum, item) => sum + (parseFloat(item.totalRowSum) || 0), 0).toLocaleString('ru-RU')} ₸
                    </span>
                  </div>
                </div>

                <div className={styles.divider} />
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isPaidRightNow} 
                      onChange={e => setIsPaidRightNow(e.target.checked)} 
                      style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    Оплатить сразу (создать расход и закрыть долг автоматически)
                  </label>
                  
                  {isPaidRightNow && (
                    <div className={styles.formField}>
                      <label>Способ оплаты</label>
                      <select 
                        className={styles.inputField} 
                        value={purchasePaymentMethod} 
                        onChange={e => setPurchasePaymentMethod(e.target.value as 'Наличные' | 'Kaspi')}
                      >
                        <option value="Kaspi">Kaspi</option>
                        <option value="Наличные">Наличные из кассы</option>
                      </select>
                    </div>
                  )}
                </div>

              </div>

              <div className={styles.drawerFooter} style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#ffffff' }}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsCreatingPurchase(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitBtn} disabled={purchaseItems.length === 0}>
                  {isPaidRightNow ? 'Сохранить и Оплатить' : 'Сохранить (В пути / В долг)'}
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
