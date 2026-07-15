import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank, AlertCircle, Calendar } from 'lucide-react';
import styles from './AnalyticsModule.module.css';
import { api } from '../utils/api';

interface AnalyticsModuleProps {
  onBack: () => void;
}

const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({ onBack }) => {
  const [period, setPeriod] = useState('Этот месяц');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async (selectedPeriod: string) => {
    try {
      setIsLoading(true);
      const periodMap: Record<string, string> = {
        'Сегодня': 'today',
        'Эта неделя': 'week',
        'Этот месяц': 'month',
        'Этот год': 'year'
      };
      const apiPeriod = periodMap[selectedPeriod] || 'month';
      const data = await api.get(`/analytics/stats?period=${apiPeriod}`);
      setStats(data);
    } catch (e) {
      console.error('Failed to fetch analytics stats', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(period);
  }, [period]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('ru-RU') + ' ₸';
  };

  const formatMillions = (val: number) => {
    return (val / 1000000).toFixed(1) + 'M ₸';
  };

  const revenue = stats?.revenue || 0;
  const expenses = stats?.expenses || 0;
  const profit = stats?.profit || 0;
  const debt = stats?.debt || 0;
  const debtors = stats?.debtors || [];
  const barData = stats?.barData || [];
  const pieData = stats?.pieData || [];
  const drivers = stats?.drivers || [];

  const maxBarVal = useMemo(() => {
    if (barData.length === 0) return 1;
    const vals = barData.flatMap((d: any) => [d.revenue, d.expenses]);
    return Math.max(...vals, 1);
  }, [barData]);

  const getPieBackground = () => {
    if (pieData.length === 0) {
      return 'conic-gradient(#e2e8f0 0% 100%)';
    }
    let currentPct = 0;
    const parts = pieData.map((item: any) => {
      const start = currentPct;
      currentPct += item.percent;
      return `${item.color} ${start}% ${currentPct}%`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  };

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
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '5rem' }}>Загрузка отчетов...</div>
        ) : (
          <>
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
                  <span className={styles.cardValue}>{formatCurrency(revenue)}</span>
                  <div className={`${styles.trendBox} ${styles.trendUp}`}>
                    <TrendingUp size={14} />
                    <span>В рамках выбранного периода</span>
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
                  <span className={styles.cardValue}>{formatCurrency(expenses)}</span>
                  <div className={`${styles.trendBox} ${styles.trendDown}`}>
                    <TrendingDown size={14} />
                    <span>Включая сырьевые себестоимости</span>
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
                  <span className={styles.cardValue}>{formatCurrency(profit)}</span>
                  <div className={`${styles.trendBox} ${styles.trendUp}`}>
                    <TrendingUp size={14} />
                    <span>Рентабельность под контролем</span>
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
                  <span className={styles.cardValue}>{formatCurrency(debt)}</span>
                  <div className={`${styles.trendBox} ${styles.trendDown}`}>
                    <TrendingDown size={14} />
                    <span>Дебиторская задолженность</span>
                  </div>
                </div>
              </div>

              {/* Cashbox */}
              <div className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>Баланс Кассы</span>
                  <div className={`${styles.cardIconBox} ${styles.iconBlue}`}>
                    <Wallet size={20} />
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534' }}>
                      Наличные: {formatCurrency(stats?.cashbox?.cash || 0)}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#be185d' }}>
                      Kaspi: {formatCurrency(stats?.cashbox?.kaspi || 0)}
                    </span>
                  </div>
                  <div className={`${styles.trendBox} ${styles.trendUp}`} style={{ marginTop: '0.5rem' }}>
                    <TrendingUp size={14} />
                    <span>Ожидаемый остаток</span>
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
                    <span>{formatMillions(maxBarVal)}</span>
                    <span>{formatMillions(maxBarVal * 0.75)}</span>
                    <span>{formatMillions(maxBarVal * 0.5)}</span>
                    <span>{formatMillions(maxBarVal * 0.25)}</span>
                    <span>0</span>
                  </div>
                  <div className={styles.chartGrid}>
                    <div className={styles.gridLine}></div>
                    <div className={styles.gridLine}></div>
                    <div className={styles.gridLine}></div>
                    <div className={styles.gridLine}></div>
                    <div className={styles.gridLine}></div>
                    
                    <div className={styles.barsArea}>
                      {barData.map((data: any, idx: number) => (
                        <div key={idx} className={styles.barGroup}>
                          <div className={styles.barPairWrapper}>
                            <div 
                              className={styles.barRevenue} 
                              style={{ height: `${(data.revenue / maxBarVal) * 100}%` }}
                              title={`Выручка: ${formatCurrency(data.revenue)}`}
                            ></div>
                            <div 
                              className={styles.barExpense} 
                              style={{ height: `${(data.expenses / maxBarVal) * 100}%` }}
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
                  <div className={styles.donutChartWrapper}>
                    <div className={styles.donutChart}>
                      <div 
                        className={styles.donutSlices}
                        style={{ background: getPieBackground() }}
                      ></div>
                      <div className={styles.donutHole}>
                        <span className={styles.donutTotalLabel}>Итого</span>
                        <span className={styles.donutTotalValue}>{formatMillions(revenue)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.pieLegendList}>
                    {pieData.map((item: any, idx: number) => (
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
                      {debtors.map((debtor: any) => (
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
                      {debtors.length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                            Должников нет
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Drivers Report */}
              <div className={styles.tableWidget}>
                <div className={styles.tableWidgetHeader}>
                  <h3 className={styles.chartTitle}>Отчет по водителям (Эффективность)</h3>
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
                      {drivers.map((driver: any) => (
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
                      {drivers.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                            Нет активных водителей в этом периоде
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AnalyticsModule;
