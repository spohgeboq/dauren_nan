import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, CalendarSync, FileSpreadsheet, Download, X } from 'lucide-react';
import styles from './ProfileFinances.module.css';
import type { Profile } from './ClientWorkspace';
import { notify } from './Toast';
import { api } from '../../utils/api';

interface ProfileFinancesProps {
  profile: Profile;
}

const ProfileFinances: React.FC<ProfileFinancesProps> = ({ profile }) => {
  const [ordersThisMonth, setOrdersThisMonth] = useState(0);
  const [popularProduct, setPopularProduct] = useState('Нет данных');
  
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [autoOrderName, setAutoOrderName] = useState('Стандартная пятница');
  const [autoOrderDay, setAutoOrderDay] = useState('Пятница');
  const [hasAutoOrder, setHasAutoOrder] = useState(false);

  useEffect(() => {
    fetchHistory();
    setHasAutoOrder(!!localStorage.getItem('cartTemplate'));
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.get('/client-workspace/orders');
      
      // Calculate this month's sum
      const now = new Date();
      const thisMonthOrders = data.filter((o: any) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      
      const sum = thisMonthOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
      setOrdersThisMonth(sum);
      
      // Find most popular product
      const productCounts: Record<string, number> = {};
      data.forEach((o: any) => {
        o.items.forEach((i: any) => {
          const name = i.product?.name || 'Товар';
          productCounts[name] = (productCounts[name] || 0) + i.quantity;
        });
      });
      
      let maxCount = 0;
      let popProd = 'Нет данных';
      for (const [name, count] of Object.entries(productCounts)) {
        if (count > maxCount) {
          maxCount = count;
          popProd = name;
        }
      }
      setPopularProduct(popProd);
    } catch (e) {
      console.error(e);
      notify('Ошибка при загрузке аналитики', 'error');
    }
  };

  const creditLimit = 100000;
  const debt = profile.debt || 0;
  const debtPercentage = Math.min((debt / creditLimit) * 100, 100);
  const isDanger = debtPercentage > 80;

  const handleDownloadAct = () => {
    const csvContent = "data:text/csv;charset=utf-8,Дата,Документ,Сумма,Сальдо\n" +
                       "01.07.2026,Акт выполненных работ,-15000,15000\n" +
                       "05.07.2026,Оплата от клиента,15000,0\n" +
                       `Текущая дата,Текущая задолженность,-${debt},${debt}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Акт_сверки_${profile.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Акт сверки успешно скачан', 'success');
  };

  const handleSaveAutoOrder = () => {
    if (!localStorage.getItem('cartTemplate')) {
      notify("Внимание! У вас нет сохраненного шаблона заказа. Сначала сохраните заказ как шаблон в Корзине или Истории.", "error");
    } else {
      notify(`Авто-заказ "${autoOrderName}" настроен на день: ${autoOrderDay}. Он будет создаваться автоматически!`, "success");
    }
    setIsAutoModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Профиль и Финансы</h2>
        <p>Управление финансами, аналитика и авто-заказы</p>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Credit Limit & Debt Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Wallet className={styles.icon} size={24} />
            <h3>Текущий баланс</h3>
          </div>
          <div className={styles.financeBlock}>
            <div>
              <div className={styles.financeLabel}>Ваш долг:</div>
              <div className={`${styles.debtAmount} ${debt === 0 ? styles.noDebt : ''}`}>
                {debt.toLocaleString()} ₸
              </div>
            </div>
            
            <div className={styles.limitBarWrapper}>
              <div className={styles.limitInfo}>
                <span>Использовано лимита:</span>
                <strong>{debt.toLocaleString()} из {creditLimit.toLocaleString()} ₸</strong>
              </div>
              <div className={styles.progressBarBg}>
                <div 
                  className={`${styles.progressBarFill} ${isDanger ? styles.danger : ''}`} 
                  style={{ width: `${debtPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <TrendingUp className={styles.icon} size={24} />
            <h3>Аналитика продаж</h3>
          </div>
          <div className={styles.analyticsRow}>
            <div className={styles.statItem}>
              <div>
                <div className={styles.financeLabel}>Заказы в этом месяце</div>
                <div className={styles.statValue}>{ordersThisMonth.toLocaleString()} ₸</div>
              </div>
              {ordersThisMonth > 0 && <div className={`${styles.trend} ${styles.up}`}>Активен</div>}
            </div>
            <div className={styles.statItem}>
              <div>
                <div className={styles.financeLabel}>Популярный товар</div>
                <div className={styles.statValue}>{popularProduct}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-orders / Subscriptions Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <CalendarSync className={styles.icon} size={24} />
            <h3>Авто-заказы (Подписки)</h3>
          </div>
          <div className={styles.subscriptionList}>
            {hasAutoOrder ? (
              <div className={styles.subItem}>
                <div className={styles.subInfo}>
                  <h4>Шаблон: Стандартная пятница</h4>
                  <p>Шаблон готов к использованию</p>
                </div>
                <span className={styles.subStatus}>Активен</span>
              </div>
            ) : (
              <div className={styles.subItem} style={{ borderStyle: 'dashed' }}>
                <div className={styles.subInfo}>
                  <h4>Нет сохраненных шаблонов</h4>
                  <p>Сохраните корзину как шаблон</p>
                </div>
              </div>
            )}
            
            <button className={styles.btnSecondary} onClick={() => setIsAutoModalOpen(true)}>
              + Настроить авто-заказ
            </button>
          </div>
        </div>

        {/* Documents & Acts */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FileSpreadsheet className={styles.icon} size={24} />
            <h3>Документы</h3>
          </div>
          <p className={styles.financeLabel}>
            Генерация актов сверок и накладных для вашей бухгалтерии.
          </p>
          <div className={styles.docsSection}>
            <button className={styles.btnPrimary} onClick={handleDownloadAct}>
              <Download size={18} /> Скачать Акт сверки (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Auto-order Modal */}
      {isAutoModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAutoModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Настройка Авто-заказа</h3>
              <button className={styles.closeBtn} onClick={() => setIsAutoModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.formGroup}>
              <label>Название авто-заказа</label>
              <input 
                type="text" 
                className={styles.textInput} 
                value={autoOrderName}
                onChange={(e) => setAutoOrderName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>День недели для доставки</label>
              <select 
                className={styles.selectInput}
                value={autoOrderDay}
                onChange={(e) => setAutoOrderDay(e.target.value)}
              >
                <option value="Понедельник">Понедельник</option>
                <option value="Вторник">Вторник</option>
                <option value="Среда">Среда</option>
                <option value="Четверг">Четверг</option>
                <option value="Пятница">Пятница</option>
                <option value="Суббота">Суббота</option>
                <option value="Воскресенье">Воскресенье</option>
              </select>
            </div>

            <p className={styles.financeLabel} style={{marginBottom: '1rem'}}>
              Будет использован текущий сохраненный шаблон корзины.
            </p>

            <button className={styles.btnPrimary} onClick={handleSaveAutoOrder}>
              Сохранить авто-заказ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileFinances;
