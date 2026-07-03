import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank, AlertCircle, Calendar } from 'lucide-react';
import styles from './AnalyticsModule.module.css';

interface AnalyticsModuleProps {
  onBack: () => void;
}

const MOCK_BAR_DATA = [
  { day: 'Пн', revenue: 2100000, expenses: 500000 },
  { day: 'Вт', revenue: 2400000, expenses: 400000 },
  { day: 'Ср', revenue: 2200000, expenses: 450000 },
  { day: 'Чт', revenue: 2800000, expenses: 600000 },
  { day: 'Пт', revenue: 3100000, expenses: 750000 },
  { day: 'Сб', revenue: 3500000, expenses: 800000 },
  { day: 'Вс', revenue: 2350000, expenses: 700000 },
];

const MOCK_PIE_DATA = [
  { name: 'Таба нан', percent: 45, color: '#0f172a' },
  { name: 'Тандырная лепешка', percent: 30, color: '#3b82f6' },
  { name: 'Батон нарезной', percent: 15, color: '#f59e0b' },
  { name: 'Круассаны', percent: 10, color: '#10b981' },
];

const MOCK_DEBTORS = [
  { id: 1, name: 'ИП "Айжан" (Ул. Абая 45)', amount: 450000, daysOverdue: 12 },
  { id: 2, name: 'ТОО "Best Market"', amount: 320000, daysOverdue: 5 },
  { id: 3, name: 'Магазин "У Дома"', amount: 150000, daysOverdue: 3 },
  { id: 4, name: 'Супермаркет "Южный"', amount: 125000, daysOverdue: 2 },
  { id: 5, name: 'ИП "Сержан"', amount: 105000, daysOverdue: 7 },
];

const MOCK_DRIVERS = [
  { id: 1, name: 'Серик Ахметов', points: 45, returns: 12000, status: 'На линии' },
  { id: 2, name: 'Азамат Ильясов', points: 42, returns: 8500, status: 'Завершил' },
  { id: 3, name: 'Максат Туленов', points: 38, returns: 15000, status: 'На линии' },
  { id: 4, name: 'Ерлан Жумабаев', points: 50, returns: 5000, status: 'Завершил' },
];

const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({ onBack }) => {
  const [period, setPeriod] = useState('Этот месяц');

  const formatCurrency = (val: number) => {
    return val.toLocaleString('ru-RU') + ' ₸';
  };

  const formatMillions = (val: number) => {
    return (val / 1000000).toFixed(1) + 'M ₸';
  };

  const maxBarVal = Math.max(...MOCK_BAR_DATA.map(d => d.revenue));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Аналитика и Отчеты</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.periodSelector}>
            <Calendar size={18} className={styles.periodIcon} />
            <select 
              className={styles.periodSelect}
              value={period}
              onChange={e => setPeriod(e.target.value)}
            >
              <option value="Сегодня">Сегодня</option>
              <option value="Эта неделя">Эта неделя</option>
              <option value="Этот месяц">Этот месяц</option>
              <option value="Этот год">Этот год</option>
            </select>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          {/* Revenue */}
          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Выручка</span>
              <div className={`${styles.cardIconBox} ${styles.iconBlue}`}>
                <DollarSign size={20} />
              </div>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardValue}>18 450 000 ₸</span>
              <div className={`${styles.trendBox} ${styles.trendUp}`}>
                <TrendingUp size={14} />
                <span>+12.5% к прошлому месяцу</span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Расходы</span>
              <div className={`${styles.cardIconBox} ${styles.iconRed}`}>
                <Wallet size={20} />
              </div>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardValue}>4 200 000 ₸</span>
              <div className={`${styles.trendBox} ${styles.trendUp}`}>
                {/* Green because lower expenses is good */}
                <TrendingDown size={14} />
                <span>-5.2% к прошлому месяцу</span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Чистая прибыль</span>
              <div className={`${styles.cardIconBox} ${styles.iconEmerald}`}>
                <PiggyBank size={20} />
              </div>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardValue}>14 250 000 ₸</span>
              <div className={`${styles.trendBox} ${styles.trendUp}`}>
                <TrendingUp size={14} />
                <span>+15.8% к прошлому месяцу</span>
              </div>
            </div>
          </div>

          {/* Debt */}
          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Общий долг клиентов</span>
              <div className={`${styles.cardIconBox} ${styles.iconAmber}`}>
                <AlertCircle size={20} />
              </div>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardValue}>1 150 000 ₸</span>
              <div className={`${styles.trendBox} ${styles.trendDown}`}>
                {/* Red because higher debt is bad */}
                <TrendingUp size={14} />
                <span>+2.1% к прошлому месяцу</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className={styles.chartsRow}>
          {/* Bar Chart (Revenue vs Expenses) */}
          <div className={styles.mainChartCard}>
            <h3 className={styles.chartTitle}>Выручка vs Расходы (за неделю)</h3>
            <div className={styles.mockBarChart}>
              <div className={styles.chartYAxis}>
                <span>4M</span>
                <span>3M</span>
                <span>2M</span>
                <span>1M</span>
                <span>0</span>
              </div>
              <div className={styles.chartGrid}>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
                
                <div className={styles.barsArea}>
                  {MOCK_BAR_DATA.map((data, idx) => (
                    <div key={idx} className={styles.barGroup}>
                      <div className={styles.barPairWrapper}>
                        <div 
                          className={styles.barRevenue} 
                          style={{ height: `${(data.revenue / 4000000) * 100}%` }}
                          title={`Выручка: ${formatCurrency(data.revenue)}`}
                        ></div>
                        <div 
                          className={styles.barExpense} 
                          style={{ height: `${(data.expenses / 4000000) * 100}%` }}
                          title={`Расходы: ${formatCurrency(data.expenses)}`}
                        ></div>
                      </div>
                      <span className={styles.barLabel}>{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendColorRev}></span>
                <span>Выручка</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColorExp}></span>
                <span>Расходы</span>
              </div>
            </div>
          </div>

          {/* Pie Chart (Top Sales) */}
          <div className={styles.sideChartCard}>
            <h3 className={styles.chartTitle}>Топ продаж по товарам</h3>
            <div className={styles.pieContainer}>
              {/* CSS Donut Chart Mock */}
              <div className={styles.donutChartWrapper}>
                <div className={styles.donutChart}>
                  {/* Conic gradient trick for donut */}
                  <div 
                    className={styles.donutSlices}
                    style={{
                      background: `conic-gradient(
                        #0f172a 0% 45%, 
                        #3b82f6 45% 75%, 
                        #f59e0b 75% 90%, 
                        #10b981 90% 100%
                      )`
                    }}
                  ></div>
                  <div className={styles.donutHole}>
                    <span className={styles.donutTotalLabel}>Всего</span>
                    <span className={styles.donutTotalValue}>18.4M</span>
                  </div>
                </div>
              </div>
              <div className={styles.pieLegendList}>
                {MOCK_PIE_DATA.map((item, idx) => (
                  <div key={idx} className={styles.pieLegendItem}>
                    <div className={styles.pieLegendLeft}>
                      <span className={styles.pieColorDot} style={{ backgroundColor: item.color }}></span>
                      <span className={styles.pieName}>{item.name}</span>
                    </div>
                    <span className={styles.piePercent}>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Widgets Row */}
        <div className={styles.bottomWidgetsRow}>
          
          {/* Top Debtors */}
          <div className={styles.tableWidget}>
            <div className={styles.tableWidgetHeader}>
              <h3 className={styles.chartTitle}>Топ-5 должников (Красные флаги)</h3>
              <button className={styles.viewAllBtn}>Смотреть всех</button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Клиент</th>
                    <th>Просрочка</th>
                    <th className={styles.textRight}>Сумма долга</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DEBTORS.map(debtor => (
                    <tr key={debtor.id}>
                      <td>
                        <span className={styles.clientName}>{debtor.name}</span>
                      </td>
                      <td>
                        <span className={styles.overdueBadge}>{debtor.daysOverdue} дней</span>
                      </td>
                      <td className={styles.textRight}>
                        <span className={styles.debtAmount}>{formatCurrency(debtor.amount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drivers Report */}
          <div className={styles.tableWidget}>
            <div className={styles.tableWidgetHeader}>
              <h3 className={styles.chartTitle}>Отчет по водителям (Эффективность)</h3>
              <button className={styles.viewAllBtn}>Подробнее</button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Водитель</th>
                    <th className={styles.textCenter}>Статус</th>
                    <th className={styles.textCenter}>Точек</th>
                    <th className={styles.textRight}>Возврат / Брак</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DRIVERS.map(driver => (
                    <tr key={driver.id}>
                      <td>
                        <span className={styles.driverName}>{driver.name}</span>
                      </td>
                      <td className={styles.textCenter}>
                        <span className={`${styles.statusBadge} ${driver.status === 'На линии' ? styles.statusActive : styles.statusDone}`}>
                          {driver.status}
                        </span>
                      </td>
                      <td className={styles.textCenter}>
                        <span className={styles.driverPoints}>{driver.points}</span>
                      </td>
                      <td className={styles.textRight}>
                        <span className={styles.driverReturns}>{formatCurrency(driver.returns)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default AnalyticsModule;
