import React, { useState } from 'react';
import { ArrowLeft, Plus, Printer, CheckCircle2, XCircle, MapPin, Truck, ChevronRight, Package, Clock, ShieldAlert } from 'lucide-react';
import styles from './RoutesModule.module.css';

type PointStatus = 'Ожидает' | 'Доставлено' | 'Отмена';
type RouteStatus = 'Сборка' | 'В пути' | 'Завершен';

interface RoutePoint {
  id: string;
  storeName: string;
  time: string;
  totalSum: number;
  status: PointStatus;
}

interface LoadItem {
  id: string;
  name: string;
  quantity: number;
}

interface DeliveryRoute {
  id: string;
  name: string;
  driver: string;
  status: RouteStatus;
  loadItems: LoadItem[];
  points: RoutePoint[];
}

const MOCK_ROUTES: DeliveryRoute[] = [
  {
    id: 'R1',
    name: 'Маршрут #1 (Левый берег)',
    driver: 'Серик Ахметов',
    status: 'В пути',
    loadItems: [
      { id: 'i1', name: 'Таба нан', quantity: 150 },
      { id: 'i2', name: 'Хлеб Пшеничный', quantity: 80 },
      { id: 'i3', name: 'Багет французский', quantity: 45 },
      { id: 'i4', name: 'Круассан классический', quantity: 60 }
    ],
    points: [
      { id: 'p1', storeName: 'Супермаркет "Анвар"', time: '07:00 - 08:00', totalSum: 45000, status: 'Доставлено' },
      { id: 'p2', storeName: 'Магазин "Самал"', time: '08:15 - 08:45', totalSum: 12500, status: 'Доставлено' },
      { id: 'p3', storeName: 'Кофейня "Зерно"', time: '09:00 - 09:30', totalSum: 8400, status: 'Ожидает' },
      { id: 'p4', storeName: 'Продуктовый "Айгерим"', time: '09:45 - 10:15', totalSum: 15000, status: 'Ожидает' },
      { id: 'p5', storeName: 'Минимаркет "24/7"', time: '10:30 - 11:00', totalSum: 9000, status: 'Ожидает' }
    ]
  },
  {
    id: 'R2',
    name: 'Маршрут #2 (Юго-Восток)',
    driver: 'Азамат Нурланов',
    status: 'Сборка',
    loadItems: [
      { id: 'i1', name: 'Хлеб Бородинский', quantity: 100 },
      { id: 'i2', name: 'Батон нарезной', quantity: 120 },
      { id: 'i3', name: 'Синнабон', quantity: 30 }
    ],
    points: [
      { id: 'p6', storeName: 'Столовая "Вкусно"', time: '06:30 - 07:30', totalSum: 32000, status: 'Ожидает' },
      { id: 'p7', storeName: 'Магазин "У дома"', time: '08:00 - 08:30', totalSum: 5500, status: 'Ожидает' },
      { id: 'p8', storeName: 'Супермаркет "Магнум"', time: '09:00 - 10:00', totalSum: 85000, status: 'Ожидает' }
    ]
  }
];

interface RoutesModuleProps {
  onBack: () => void;
}

const RoutesModule: React.FC<RoutesModuleProps> = ({ onBack }) => {
  const [routes, setRoutes] = useState<DeliveryRoute[]>(MOCK_ROUTES);
  const [activeRouteId, setActiveRouteId] = useState<string>(MOCK_ROUTES[0].id);
  const [activeTab, setActiveTab] = useState<'load' | 'points'>('points');
  const [selectedDate, setSelectedDate] = useState('Завтра');

  const activeRoute = routes.find(r => r.id === activeRouteId);

  // Helper to calculate progress
  const getProgress = (route: DeliveryRoute) => {
    const total = route.points.length;
    const completed = route.points.filter(p => p.status === 'Доставлено').length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
  };

  const updatePointStatus = (routeId: string, pointId: string, newStatus: PointStatus) => {
    setRoutes(prevRoutes => prevRoutes.map(route => {
      if (route.id === routeId) {
        return {
          ...route,
          points: route.points.map(p => p.id === pointId ? { ...p, status: newStatus } : p)
        };
      }
      return route;
    }));
  };

  const totalCars = routes.length;
  const totalPointsAll = routes.reduce((acc, r) => acc + r.points.length, 0);

  return (
    <div className={styles.layout}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Маршруты доставки</h1>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.dateSelector}>
            <button 
              className={selectedDate === 'Сегодня' ? styles.dateBtnActive : styles.dateBtn}
              onClick={() => setSelectedDate('Сегодня')}
            >
              Сегодня
            </button>
            <button 
              className={selectedDate === 'Завтра' ? styles.dateBtnActive : styles.dateBtn}
              onClick={() => setSelectedDate('Завтра')}
            >
              Завтра
            </button>
          </div>
          
          <div className={styles.quickStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Машин на линии:</span>
              <span className={styles.statValue}>{totalCars}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Всего точек:</span>
              <span className={styles.statValue}>{totalPointsAll}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Split View */}
      <main className={styles.mainGrid}>
        
        {/* Left Column: Route List */}
        <div className={styles.leftCol}>
          <div className={styles.leftColHeader}>
            <h2>Активные маршруты</h2>
            <button className={styles.createRouteBtn} title="Создать маршрут">
              <Plus size={18} />
            </button>
          </div>
          
          <div className={styles.routesList}>
            {routes.map(route => {
              const { total, completed, percentage } = getProgress(route);
              const isActive = route.id === activeRouteId;
              
              return (
                <div 
                  key={route.id} 
                  className={`${styles.routeCard} ${isActive ? styles.routeCardActive : ''}`}
                  onClick={() => setActiveRouteId(route.id)}
                >
                  <div className={styles.routeCardTop}>
                    <div className={styles.routeNameWrapper}>
                      <Truck size={18} className={isActive ? styles.iconActive : styles.iconMuted} />
                      <h3 className={styles.routeName}>{route.name}</h3>
                    </div>
                    <span className={`${styles.statusBadge} ${route.status === 'В пути' ? styles.statusInTransit : styles.statusBuilding}`}>
                      {route.status}
                    </span>
                  </div>
                  
                  <div className={styles.routeDriver}>
                    Водитель: <strong>{route.driver}</strong>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressText}>
                      <span>Прогресс</span>
                      <span>{completed} из {total} точек</span>
                    </div>
                    <div className={styles.progressBarBg}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${percentage}%`, backgroundColor: route.status === 'В пути' ? '#10b981' : '#3b82f6' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Route Details */}
        <div className={styles.rightCol}>
          {activeRoute ? (
            <div className={styles.detailsContainer}>
              
              <div className={styles.detailsHeader}>
                <div>
                  <h2 className={styles.detailsTitle}>{activeRoute.name}</h2>
                  <p className={styles.detailsDriver}>Водитель: {activeRoute.driver}</p>
                </div>
                <button className={styles.printBtn}>
                  <Printer size={18} />
                  Распечатать лист
                </button>
              </div>

              {/* Tabs */}
              <div className={styles.tabsContainer}>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'load' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('load')}
                >
                  <Package size={18} />
                  Лист погрузки
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'points' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('points')}
                >
                  <MapPin size={18} />
                  Точки доставки
                </button>
              </div>

              {/* Tab Content */}
              <div className={styles.tabContent}>
                
                {/* 1. Loading List */}
                {activeTab === 'load' && (
                  <div className={styles.loadList}>
                    <table className={styles.loadTable}>
                      <thead>
                        <tr>
                          <th>Наименование продукции</th>
                          <th className={styles.textRight}>Количество (шт)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeRoute.loadItems.map(item => (
                          <tr key={item.id}>
                            <td className={styles.loadItemName}>{item.name}</td>
                            <td className={styles.loadItemQty}>{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 2. Delivery Points (Timeline) */}
                {activeTab === 'points' && (
                  <div className={styles.timeline}>
                    {activeRoute.points.map((point, index) => {
                      const isLast = index === activeRoute.points.length - 1;
                      
                      return (
                        <div key={point.id} className={styles.timelineNode}>
                          {/* Timeline Line */}
                          {!isLast && <div className={styles.timelineLine}></div>}
                          
                          {/* Timeline Dot */}
                          <div className={`${styles.timelineDot} ${point.status === 'Доставлено' ? styles.dotCompleted : point.status === 'Отмена' ? styles.dotCanceled : styles.dotPending}`}>
                            {point.status === 'Доставлено' ? <CheckCircle2 size={14} /> : point.status === 'Отмена' ? <XCircle size={14} /> : <div className={styles.innerDot} />}
                          </div>

                          {/* Node Content */}
                          <div className={styles.pointCard}>
                            <div className={styles.pointInfo}>
                              <h4 className={styles.pointName}>{point.storeName}</h4>
                              <div className={styles.pointMeta}>
                                <div className={styles.metaItem}>
                                  <Clock size={14} />
                                  {point.time}
                                </div>
                                <div className={styles.metaItemSum}>
                                  {point.totalSum.toLocaleString('ru-RU')} ₸
                                </div>
                              </div>
                            </div>
                            
                            <div className={styles.pointActions}>
                              {point.status === 'Ожидает' ? (
                                <>
                                  <button 
                                    className={styles.actionBtnSuccess}
                                    onClick={() => updatePointStatus(activeRoute.id, point.id, 'Доставлено')}
                                  >
                                    Доставлено
                                  </button>
                                  <button 
                                    className={styles.actionBtnDanger}
                                    onClick={() => updatePointStatus(activeRoute.id, point.id, 'Отмена')}
                                  >
                                    Отмена
                                  </button>
                                </>
                              ) : (
                                <span className={`${styles.pointStatusBadge} ${point.status === 'Доставлено' ? styles.badgeSuccess : styles.badgeDanger}`}>
                                  {point.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <MapPin size={48} className={styles.emptyIcon} />
              <p>Выберите маршрут для просмотра деталей</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoutesModule;
