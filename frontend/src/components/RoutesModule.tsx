import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Printer, CheckCircle2, XCircle, MapPin, Truck, ChevronRight, Package, Clock, ShieldAlert } from 'lucide-react';
import { api } from '../utils/api';
import CreateRouteModal from './CreateRouteModal';
import styles from './RoutesModule.module.css';

type PointStatus = 'PENDING' | 'DELIVERED' | 'CANCELLED';
type RouteStatus = 'BUILDING' | 'IN_TRANSIT' | 'COMPLETED';

interface RoutePoint {
  id: number;
  storeName: string;
  time: string | null;
  totalSum: number;
  status: PointStatus;
}

const ROUTE_STATUS_MAP: Record<RouteStatus, string> = {
  BUILDING: 'Сборка',
  IN_TRANSIT: 'В пути',
  COMPLETED: 'Завершен'
};

const POINT_STATUS_MAP: Record<PointStatus, string> = {
  PENDING: 'Ожидает',
  DELIVERED: 'Доставлено',
  CANCELLED: 'Отмена'
};

interface LoadItem {
  id: number;
  productId: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
  };
}

interface DeliveryRoute {
  id: number;
  name: string;
  driverId: number | null;
  driver?: {
    id: number;
    name: string;
  };
  status: RouteStatus;
  loadItems: LoadItem[];
  points: RoutePoint[];
}

interface RoutesModuleProps {
  onBack: () => void;
}

const RoutesModule: React.FC<RoutesModuleProps> = ({ onBack }) => {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'load' | 'points'>('points');
  const [selectedDate, setSelectedDate] = useState('Завтра');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, [selectedDate]);

  const fetchRoutes = async () => {
    try {
      const data = await api.get(`/routes?date=${encodeURIComponent(selectedDate)}`);
      setRoutes(data);
      if (data.length > 0 && !data.find((r: DeliveryRoute) => r.id === activeRouteId)) {
        setActiveRouteId(data[0].id);
      } else if (data.length === 0) {
        setActiveRouteId(null);
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  };

  const activeRoute = routes.find(r => r.id === activeRouteId);

  // Helper to calculate progress
  const getProgress = (route: DeliveryRoute) => {
    const total = route.points.length;
    const completed = route.points.filter(p => p.status === 'DELIVERED').length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
  };

  const updatePointStatus = async (routeId: number, pointId: number, newStatus: PointStatus) => {
    try {
      await api.patch(`/routes/${routeId}/points/${pointId}/status`, { status: newStatus });
      fetchRoutes(); // Refetch to get updated data
    } catch (error) {
      console.error('Failed to update point status:', error);
    }
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
            <button 
              className={styles.createRouteBtn} 
              title="Создать маршрут"
              onClick={() => setIsCreateModalOpen(true)}
            >
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
                    <span className={`${styles.statusBadge} ${route.status === 'IN_TRANSIT' ? styles.statusInTransit : styles.statusBuilding}`}>
                      {ROUTE_STATUS_MAP[route.status]}
                    </span>
                  </div>
                  
                  <div className={styles.routeDriver}>
                    Водитель: <strong>{route.driver?.name || 'Не назначен'}</strong>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressText}>
                      <span>Прогресс</span>
                      <span>{completed} из {total} точек</span>
                    </div>
                    <div className={styles.progressBarBg}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${percentage}%`, backgroundColor: route.status === 'IN_TRANSIT' ? '#10b981' : '#3b82f6' }}
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
                  <p className={styles.detailsDriver}>Водитель: {activeRoute.driver?.name || 'Не назначен'}</p>
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
                            <td className={styles.loadItemName}>{item.product?.name || `Товар #${item.productId}`}</td>
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
                          <div className={`${styles.timelineDot} ${point.status === 'DELIVERED' ? styles.dotCompleted : point.status === 'CANCELLED' ? styles.dotCanceled : styles.dotPending}`}>
                            {point.status === 'DELIVERED' ? <CheckCircle2 size={14} /> : point.status === 'CANCELLED' ? <XCircle size={14} /> : <div className={styles.innerDot} />}
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
                              {point.status === 'PENDING' ? (
                                <>
                                  <button 
                                    className={styles.actionBtnSuccess}
                                    onClick={() => updatePointStatus(activeRoute.id, point.id, 'DELIVERED')}
                                  >
                                    Доставлено
                                  </button>
                                  <button 
                                    className={styles.actionBtnDanger}
                                    onClick={() => updatePointStatus(activeRoute.id, point.id, 'CANCELLED')}
                                  >
                                    Отмена
                                  </button>
                                </>
                              ) : (
                                <span className={`${styles.pointStatusBadge} ${point.status === 'DELIVERED' ? styles.badgeSuccess : styles.badgeDanger}`}>
                                  {POINT_STATUS_MAP[point.status]}
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

      <CreateRouteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchRoutes}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default RoutesModule;
