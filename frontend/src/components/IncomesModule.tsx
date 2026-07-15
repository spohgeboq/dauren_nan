import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Filter, Banknote, CreditCard, ShoppingCart, Truck, PiggyBank, Briefcase, X } from 'lucide-react';
import styles from './IncomesModule.module.css';
import { api } from '../utils/api';

type IncomeSource = 'POS' | 'DELIVERY' | 'DEBT_PAYMENT' | 'MANUAL' | 'Все';
type PaymentMethod = 'Наличные' | 'Kaspi';

interface Income {
  id: string;
  date: string;
  source: IncomeSource;
  description: string;
  paymentMethod: PaymentMethod;
  amount: number;
  isAuto: boolean;
}

const SOURCE_MAP_TO_BACKEND: Record<IncomeSource, string> = {
  'POS': 'POS',
  'DELIVERY': 'DELIVERY',
  'DEBT_PAYMENT': 'DEBT_PAYMENT',
  'MANUAL': 'MANUAL',
  'Все': 'Все'
};

const SOURCE_MAP_FROM_BACKEND: Record<string, IncomeSource> = {
  'POS': 'POS',
  'DELIVERY': 'DELIVERY',
  'DEBT_PAYMENT': 'DEBT_PAYMENT',
  'MANUAL': 'MANUAL',
};

const sourceNames: Record<IncomeSource, string> = {
  'POS': 'Розница (Магазин)',
  'DELIVERY': 'Опт (Доставка)',
  'DEBT_PAYMENT': 'Погашение долга',
  'MANUAL': 'Ручной ввод',
  'Все': 'Все источники'
};

const PAYMENT_MAP_TO_BACKEND: Record<PaymentMethod, string> = {
  'Наличные': 'CASH',
  'Kaspi': 'KASPI',
};

const PAYMENT_MAP_FROM_BACKEND: Record<string, PaymentMethod> = {
  'CASH': 'Наличные',
  'KASPI': 'Kaspi',
};

const sourceIcons: Record<IncomeSource, React.ReactNode> = {
  'POS': <ShoppingCart size={18} />,
  'DELIVERY': <Truck size={18} />,
  'DEBT_PAYMENT': <PiggyBank size={18} />,
  'MANUAL': <Briefcase size={18} />,
  'Все': null
};

const sourceColors: Record<IncomeSource, string> = {
  'POS': '#3b82f6', // blue
  'DELIVERY': '#f59e0b', // amber
  'DEBT_PAYMENT': '#10b981', // green
  'MANUAL': '#64748b', // slate
  'Все': '#000'
};

interface IncomesModuleProps {
  onBack: () => void;
}

const IncomesModule: React.FC<IncomesModuleProps> = ({ onBack }) => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>('07-2026'); // Mock current month filter
  const [filterSource, setFilterSource] = useState<IncomeSource>('Все');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPayment, setNewPayment] = useState<PaymentMethod>('Kaspi');

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filterMonth && filterMonth !== 'Все') {
          queryParams.append('month', filterMonth);
        }
        if (filterSource && filterSource !== 'Все') {
          queryParams.append('source', SOURCE_MAP_TO_BACKEND[filterSource]);
        }
        const data = await api.get(`/incomes?${queryParams.toString()}`);
        const mapped = data.map((inc: any) => ({
          id: String(inc.id),
          date: inc.date.split('T')[0],
          source: SOURCE_MAP_FROM_BACKEND[inc.source] || 'MANUAL',
          description: inc.description || '',
          paymentMethod: PAYMENT_MAP_FROM_BACKEND[inc.paymentMethod] || 'Kaspi',
          amount: inc.amount,
          isAuto: inc.isAuto || false,
        }));
        setIncomes(mapped);
      } catch (err) {
        console.error('Error fetching incomes:', err);
      }
    };
    fetchIncomes();
  }, [filterMonth, filterSource]);

  const filteredIncomes = useMemo(() => {
    return incomes;
  }, [incomes]);

  const totalIncomes = filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0);

  const incomesBySource = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredIncomes.forEach(inc => {
      totals[inc.source] = (totals[inc.source] || 0) + inc.amount;
    });
    return Object.entries(totals)
      .map(([name, amount]) => ({ name: name as IncomeSource, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredIncomes]);

  const topSource = incomesBySource.length > 0 ? incomesBySource[0] : null;

  const handleDeleteIncome = async (inc: Income) => {
    if (inc.isAuto) {
      if (!window.confirm('ВНИМАНИЕ! Этот доход сгенерирован автоматически системой (POS, Доставка или Долг). Удаление может нарушить баланс. Вы уверены?')) return;
    } else {
      if (!window.confirm('Удалить этот доход?')) return;
    }

    try {
      await api.delete(`/incomes/${inc.id}`);
      setIncomes(incomes.filter(i => i.id !== inc.id));
    } catch (err) {
      console.error('Error deleting income:', err);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(newAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) return;

    try {
      const saved = await api.post('/incomes', {
        amount: amountNum,
        paymentMethod: PAYMENT_MAP_TO_BACKEND[newPayment] || 'KASPI',
        source: 'MANUAL',
        description: newDescription,
      });
      
      const mapped = {
        id: String(saved.id),
        date: saved.date.split('T')[0],
        source: SOURCE_MAP_FROM_BACKEND[saved.source] || 'MANUAL',
        description: saved.description || '',
        paymentMethod: PAYMENT_MAP_FROM_BACKEND[saved.paymentMethod] || 'Kaspi',
        amount: saved.amount,
        isAuto: saved.isAuto || false,
      };

      setIncomes([mapped, ...incomes]);
      setIsModalOpen(false);
      
      setNewAmount('');
      setNewDescription('');
    } catch (err) {
      console.error('Error adding income:', err);
    }
  };

  const formatPrice = (num: number) => num.toLocaleString('ru-RU') + ' ₸';
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
    return dateStr;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Доходы (Поступления)</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Внести доход
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.widgetsGrid}>
          
          <div className={styles.widget}>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Доходы (Выбранный период)</span>
              <span className={styles.widgetValueBig} style={{ color: '#3b82f6' }}>{formatPrice(totalIncomes)}</span>
            </div>
          </div>
          
          <div className={styles.widget}>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Основной источник</span>
              {topSource ? (
                <div className={styles.topCategoryBox}>
                  <div className={styles.topCatNameWrapper}>
                    <span 
                      className={styles.colorDot} 
                      style={{ backgroundColor: sourceColors[topSource.name] }}
                    />
                    <span className={styles.topCatName}>{sourceNames[topSource.name]}</span>
                  </div>
                  <span className={styles.topCatAmount}>{formatPrice(topSource.amount)}</span>
                </div>
              ) : (
                <span className={styles.emptyVal}>Нет данных</span>
              )}
            </div>
          </div>

          <div className={styles.widgetVisual}>
            <span className={styles.widgetLabel}>Структура доходов</span>
            {totalIncomes > 0 ? (
              <div className={styles.stackedBarContainer}>
                <div className={styles.stackedBar}>
                  {incomesBySource.map(src => (
                    <div 
                      key={src.name}
                      className={styles.barSegment}
                      style={{ 
                        width: `${(src.amount / totalIncomes) * 100}%`,
                        backgroundColor: sourceColors[src.name] 
                      }}
                      title={`${sourceNames[src.name]}: ${formatPrice(src.amount)}`}
                    />
                  ))}
                </div>
                <div className={styles.barLegend}>
                  {incomesBySource.map(src => (
                    <div key={src.name} className={styles.legendItem}>
                      <span className={styles.colorDot} style={{ backgroundColor: sourceColors[src.name] }} />
                      <span>{sourceNames[src.name]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.emptyVal}>Нет данных за период</div>
            )}
          </div>
        </div>

        <div className={styles.workspace}>
          <div className={styles.filtersBar}>
            <div className={styles.filterGroup}>
              <Filter size={18} className={styles.filterIcon} />
              <select 
                className={styles.filterSelect}
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="Все">За все время</option>
                <option value="07-2026">Июль 2026</option>
                <option value="06-2026">Июнь 2026</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <select 
                className={styles.filterSelect}
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as IncomeSource)}
              >
                <option value="Все">Все источники</option>
                <option value="POS">Розница (Магазин)</option>
                <option value="DELIVERY">Опт (Доставка)</option>
                <option value="DEBT_PAYMENT">Погашение долга</option>
                <option value="MANUAL">Ручной ввод</option>
              </select>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Источник</th>
                  <th>Описание</th>
                  <th>Оплата</th>
                  <th className={styles.textRight}>Сумма</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredIncomes.map(inc => (
                  <tr key={inc.id} className={styles.tableRow}>
                    <td>
                      <span className={styles.cellDate}>{formatDate(inc.date)}</span>
                    </td>
                    <td>
                      <div className={styles.cellSource}>
                        <div className={styles.sourceIcon} style={{ color: sourceColors[inc.source], backgroundColor: `${sourceColors[inc.source]}15` }}>
                          {sourceIcons[inc.source]}
                        </div>
                        <span className={styles.sourceName}>{sourceNames[inc.source]}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.cellDesc}>{inc.description || '—'}</span>
                    </td>
                    <td>
                      {inc.paymentMethod === 'Kaspi' ? (
                        <div className={styles.badgeKaspi}>Kaspi</div>
                      ) : (
                        <div className={styles.badgeCash}>
                          <Banknote size={14} /> Наличные
                        </div>
                      )}
                    </td>
                    <td className={styles.textRight}>
                      <span className={styles.cellAmount} style={{ color: '#3b82f6' }}>+ {formatPrice(inc.amount)}</span>
                      {inc.isAuto && <span className={styles.autoBadge}>Авто</span>}
                    </td>
                    <td>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteIncome(inc)}>
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredIncomes.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyTable}>
                      В этом периоде нет доходов
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Новое поступление</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className={styles.modalForm}>
              <div className={styles.hugeInputGroup}>
                <label className={styles.formLabelCenter}>Сумма дохода (₸)</label>
                <input 
                  type="number" 
                  className={styles.hugeInput}
                  style={{ color: '#3b82f6' }}
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0"
                  autoFocus
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Описание (откуда деньги)</label>
                <input 
                  type="text"
                  className={styles.formInput}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Например: Взнос учредителя"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Куда поступили</label>
                <div className={styles.paymentToggleBox}>
                  <button 
                    type="button"
                    className={`${styles.paymentToggleBtn} ${newPayment === 'Наличные' ? styles.paymentActive : ''}`}
                    onClick={() => setNewPayment('Наличные')}
                  >
                    <Banknote size={18} />
                    В кассу (Наличные)
                  </button>
                  <button 
                    type="button"
                    className={`${styles.paymentToggleBtn} ${newPayment === 'Kaspi' ? styles.paymentActive : ''}`}
                    onClick={() => setNewPayment('Kaspi')}
                  >
                    <CreditCard size={18} />
                    На счет (Kaspi)
                  </button>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitBtn} disabled={!newAmount || parseInt(newAmount) <= 0 || !newDescription.trim()}>
                  Добавить доход
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomesModule;
