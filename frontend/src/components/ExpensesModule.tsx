import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Filter, Wallet, Receipt, CreditCard, Banknote, Car, Wrench, Home, Users, Search, X } from 'lucide-react';
import styles from './ExpensesModule.module.css';
import { api } from '../utils/api';

type ExpenseCategory = 'Аренда' | 'Зарплата' | 'ГСМ' | 'Ремонт' | 'Сырье' | 'Прочее';
type PaymentMethod = 'Наличные' | 'Kaspi';

interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  paymentMethod: PaymentMethod;
  amount: number;
}

const CATEGORY_MAP_TO_BACKEND: Record<ExpenseCategory, string> = {
  'Аренда': 'RENT',
  'Зарплата': 'SALARY',
  'ГСМ': 'FUEL',
  'Ремонт': 'REPAIR',
  'Сырье': 'RAW_MATERIAL',
  'Прочее': 'OTHER',
};

const CATEGORY_MAP_FROM_BACKEND: Record<string, ExpenseCategory> = {
  'RENT': 'Аренда',
  'SALARY': 'Зарплата',
  'FUEL': 'ГСМ',
  'REPAIR': 'Ремонт',
  'RAW_MATERIAL': 'Сырье',
  'OTHER': 'Прочее',
};

const PAYMENT_MAP_TO_BACKEND: Record<PaymentMethod, string> = {
  'Наличные': 'CASH',
  'Kaspi': 'KASPI',
};

const PAYMENT_MAP_FROM_BACKEND: Record<string, PaymentMethod> = {
  'CASH': 'Наличные',
  'KASPI': 'Kaspi',
};

const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
  'Аренда': <Home size={18} />,
  'Зарплата': <Users size={18} />,
  'ГСМ': <Car size={18} />,
  'Ремонт': <Wrench size={18} />,
  'Сырье': <Receipt size={18} />,
  'Прочее': <Wallet size={18} />
};

const categoryColors: Record<ExpenseCategory, string> = {
  'Аренда': '#3b82f6', // blue
  'Зарплата': '#f59e0b', // amber
  'ГСМ': '#ef4444', // red
  'Ремонт': '#8b5cf6', // purple
  'Сырье': '#10b981', // green
  'Прочее': '#64748b' // slate
};

interface ExpensesModuleProps {
  onBack: () => void;
}

const ExpensesModule: React.FC<ExpensesModuleProps> = ({ onBack }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>('07-2026'); // Mock current month filter
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'Все'>('Все');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Прочее');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [newPayment, setNewPayment] = useState<PaymentMethod>('Kaspi');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filterMonth && filterMonth !== 'Все') {
          queryParams.append('month', filterMonth);
        }
        if (filterCategory && filterCategory !== 'Все') {
          queryParams.append('category', CATEGORY_MAP_TO_BACKEND[filterCategory]);
        }
        const data = await api.get(`/expenses?${queryParams.toString()}`);
        const mapped = data.map((exp: any) => ({
          id: String(exp.id),
          date: exp.date.split('T')[0],
          category: CATEGORY_MAP_FROM_BACKEND[exp.category] || 'Прочее',
          description: exp.description || '',
          paymentMethod: PAYMENT_MAP_FROM_BACKEND[exp.paymentMethod] || 'Kaspi',
          amount: exp.amount,
        }));
        setExpenses(mapped);
      } catch (err) {
        console.error('Error fetching expenses:', err);
      }
    };
    fetchExpenses();
  }, [filterMonth, filterCategory]);

  // Logic
  const filteredExpenses = useMemo(() => {
    return expenses; // Filtered by API
  }, [expenses]);

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const expensesByCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    return Object.entries(totals)
      .map(([name, amount]) => ({ name: name as ExpenseCategory, amount }))
      .sort((a, b) => b.amount - a.amount); // Sort by highest
  }, [filteredExpenses]);

  const topCategory = expensesByCategory.length > 0 ? expensesByCategory[0] : null;

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(newAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) return;

    try {
      const saved = await api.post('/expenses', {
        date: newDate,
        category: CATEGORY_MAP_TO_BACKEND[newCategory] || 'OTHER',
        description: newDescription,
        paymentMethod: PAYMENT_MAP_TO_BACKEND[newPayment] || 'KASPI',
        amount: amountNum,
      });
      
      const mapped = {
        id: String(saved.id),
        date: saved.date.split('T')[0],
        category: CATEGORY_MAP_FROM_BACKEND[saved.category] || 'Прочее',
        description: saved.description || '',
        paymentMethod: PAYMENT_MAP_FROM_BACKEND[saved.paymentMethod] || 'Kaspi',
        amount: saved.amount,
      };

      setExpenses([mapped, ...expenses]);
      setIsModalOpen(false);
      
      // Reset
      setNewAmount('');
      setNewDescription('');
      setNewCategory('Прочее');
    } catch (err) {
      console.error('Error adding expense:', err);
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
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Расходы</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Добавить расход
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Analytics Widgets */}
        <div className={styles.widgetsGrid}>
          
          <div className={styles.widget}>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Расходы (Выбранный период)</span>
              <span className={styles.widgetValueBig}>{formatPrice(totalExpenses)}</span>
            </div>
          </div>
          
          <div className={styles.widget}>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Самая затратная категория</span>
              {topCategory ? (
                <div className={styles.topCategoryBox}>
                  <div className={styles.topCatNameWrapper}>
                    <span 
                      className={styles.colorDot} 
                      style={{ backgroundColor: categoryColors[topCategory.name] }}
                    />
                    <span className={styles.topCatName}>{topCategory.name}</span>
                  </div>
                  <span className={styles.topCatAmount}>{formatPrice(topCategory.amount)}</span>
                </div>
              ) : (
                <span className={styles.emptyVal}>Нет данных</span>
              )}
            </div>
          </div>

          <div className={styles.widgetVisual}>
            <span className={styles.widgetLabel}>Структура расходов</span>
            {totalExpenses > 0 ? (
              <div className={styles.stackedBarContainer}>
                <div className={styles.stackedBar}>
                  {expensesByCategory.map(cat => (
                    <div 
                      key={cat.name}
                      className={styles.barSegment}
                      style={{ 
                        width: `${(cat.amount / totalExpenses) * 100}%`,
                        backgroundColor: categoryColors[cat.name] 
                      }}
                      title={`${cat.name}: ${formatPrice(cat.amount)}`}
                    />
                  ))}
                </div>
                <div className={styles.barLegend}>
                  {expensesByCategory.slice(0, 3).map(cat => (
                    <div key={cat.name} className={styles.legendItem}>
                      <span className={styles.colorDot} style={{ backgroundColor: categoryColors[cat.name] }} />
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.emptyVal}>Нет данных за период</div>
            )}
          </div>
        </div>

        {/* Workspace */}
        <div className={styles.workspace}>
          
          {/* Filters */}
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
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'Все')}
              >
                <option value="Все">Все категории</option>
                <option value="Аренда">Аренда</option>
                <option value="Зарплата">Зарплаты</option>
                <option value="ГСМ">ГСМ</option>
                <option value="Ремонт">Ремонт</option>
                <option value="Сырье">Сырье</option>
                <option value="Прочее">Прочее</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Категория</th>
                  <th>Описание</th>
                  <th>Оплата</th>
                  <th className={styles.textRight}>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className={styles.tableRow}>
                    <td>
                      <span className={styles.cellDate}>{formatDate(exp.date)}</span>
                    </td>
                    <td>
                      <div className={styles.cellCategory}>
                        <div className={styles.catIcon} style={{ color: categoryColors[exp.category], backgroundColor: `${categoryColors[exp.category]}15` }}>
                          {categoryIcons[exp.category]}
                        </div>
                        <span className={styles.catName}>{exp.category}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.cellDesc}>{exp.description || '—'}</span>
                    </td>
                    <td>
                      {exp.paymentMethod === 'Kaspi' ? (
                        <div className={styles.badgeKaspi}>Kaspi</div>
                      ) : (
                        <div className={styles.badgeCash}>
                          <Banknote size={14} /> Наличные
                        </div>
                      )}
                    </td>
                    <td className={styles.textRight}>
                      <span className={styles.cellAmount}>- {formatPrice(exp.amount)}</span>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyTable}>
                      В этом периоде нет расходов
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Новый расход</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className={styles.modalForm}>
              
              <div className={styles.hugeInputGroup}>
                <label className={styles.formLabelCenter}>Сумма расхода (₸)</label>
                <input 
                  type="number" 
                  className={styles.hugeInput}
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0"
                  autoFocus
                  required
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Категория</label>
                  <select 
                    className={styles.formSelect}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                  >
                    <option value="Аренда">Аренда</option>
                    <option value="Зарплата">Зарплата</option>
                    <option value="ГСМ">ГСМ</option>
                    <option value="Ремонт">Ремонт</option>
                    <option value="Сырье">Сырье</option>
                    <option value="Прочее">Прочее</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Дата</label>
                  <input 
                    type="date"
                    className={styles.formInput}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Описание (на что ушли деньги)</label>
                <input 
                  type="text"
                  className={styles.formInput}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Например: Покупка запчастей на Газель"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Откуда списано</label>
                <div className={styles.paymentToggleBox}>
                  <button 
                    type="button"
                    className={`${styles.paymentToggleBtn} ${newPayment === 'Наличные' ? styles.paymentActive : ''}`}
                    onClick={() => setNewPayment('Наличные')}
                  >
                    <Banknote size={18} />
                    Из кассы (Наличные)
                  </button>
                  <button 
                    type="button"
                    className={`${styles.paymentToggleBtn} ${newPayment === 'Kaspi' ? styles.paymentActive : ''}`}
                    onClick={() => setNewPayment('Kaspi')}
                  >
                    <CreditCard size={18} />
                    Переводом (Kaspi)
                  </button>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitBtn} disabled={!newAmount || parseInt(newAmount) <= 0 || !newDescription.trim()}>
                  Зафиксировать расход
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesModule;
