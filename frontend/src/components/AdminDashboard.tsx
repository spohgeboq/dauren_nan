import React from 'react';
import { 
  LogOut, 
  Calculator, 
  Users, 
  ClipboardList, 
  Truck, 
  ChefHat, 
  Wheat, 
  ShoppingCart, 
  UserCog, 
  ShieldCheck, 
  Receipt, 
  LineChart, 
  PackageOpen, 
  BookOpen, 
  Tags, 
  Car 
} from 'lucide-react';
import styles from './AdminDashboard.module.css';
import CashierWorkspace from './CashierWorkspace/CashierWorkspace';
import ClientsModule from './ClientsModule';
import OrdersModule from './OrdersModule';
import RoutesModule from './RoutesModule';
import ProductionModule from './ProductionModule';
import InventoryModule from './InventoryModule';
import PurchasesModule from './PurchasesModule';
import EmployeesModule from './EmployeesModule';

import ExpensesModule from './ExpensesModule';
import IncomesModule from './IncomesModule';
import AnalyticsModule from './AnalyticsModule';
import ProductsModule from './ProductsModule';
import RecipesModule from './RecipesModule';
import CategoriesModule from './CategoriesModule';
import FleetModule from './FleetModule';

const AdminDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = React.useState<'main' | 'pos' | 'clients' | 'orders' | 'routes' | 'production' | 'inventory' | 'purchases' | 'employees' | 'roles' | 'expenses' | 'incomes' | 'analytics' | 'products' | 'recipes' | 'categories' | 'fleet'>('main');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const sections = [
    {
      title: 'Продажи и Клиенты',
      modules: [
        {
          title: 'Касса (POS)',
          description: 'Розничные продажи, корзина, оплата Kaspi и наличными, списание кассового остатка.',
          icon: <Calculator size={24} className={styles.iconGold} />
        },
        {
          title: 'Клиенты',
          description: 'Магазины, организации, привязка к водителям, история переназначений, долги.',
          icon: <Users size={24} className={styles.iconDark} />
        },
        {
          title: 'Заказы клиентов',
          description: 'Управление входящими заявками от клиентов.',
          icon: <ClipboardList size={24} className={styles.iconGold} />
        },
        {
          title: 'Маршруты доставки',
          description: 'Создание маршрута, выдача товара водителю и контроль доставок.',
          icon: <Truck size={24} className={styles.iconDark} />
        }
      ]
    },
    {
      title: 'Склад и Производство',
      modules: [
        {
          title: 'Производство',
          description: 'Ввод выпечки, списание сырья по рецептам и приход готовой продукции.',
          icon: <ChefHat size={24} className={styles.iconGold} />
        },
        {
          title: 'Сырье',
          description: 'Мука, дрожжи, соль: базовые единицы, упаковки и коэффициенты пересчета.',
          icon: <Wheat size={24} className={styles.iconDark} />
        },
        {
          title: 'Закупки сырья',
          description: 'Заявки на муку/дрожжи и автоматическое пополнение склада.',
          icon: <ShoppingCart size={24} className={styles.iconGold} />
        }
      ]
    },
    {
      title: 'Управление и Отчеты',
      modules: [
        {
          title: 'Сотрудники',
          description: 'Пользователи системы и их контактные данные.',
          icon: <UserCog size={24} className={styles.iconDark} />
        },
        {
          title: 'Доходы',
          description: 'Поступления с продаж, доставок и оплата долгов от магазинов.',
          icon: <ShieldCheck size={24} className={styles.iconGold} />
        },
        {
          title: 'Расходы',
          description: 'Аренда, зарплаты, ГСМ и прочие ежедневные расходы.',
          icon: <Receipt size={24} className={styles.iconDark} />
        },
        {
          title: 'Аналитика и отчеты',
          description: 'Сводка за день, расходы, долги клиентов, отчеты по водителям.',
          icon: <LineChart size={24} className={styles.iconGold} />
        }
      ]
    },
    {
      title: 'Справочники',
      modules: [
        {
          title: 'Товары',
          description: 'Управление товарами, загрузка картинок, цены и настройки.',
          icon: <PackageOpen size={24} className={styles.iconDark} />
        },
        {
          title: 'Рецепты',
          description: 'Нормы сырья на продукт: мука, дрожжи, соль, вода и упаковка.',
          icon: <BookOpen size={24} className={styles.iconGold} />
        },
        {
          title: 'Категории',
          description: 'Управление разделами хлеба и выпечки.',
          icon: <Tags size={24} className={styles.iconDark} />
        },
        {
          title: 'Справочник автомобилей',
          description: 'Управление парком машин для учета расходов.',
          icon: <Car size={24} className={styles.iconGold} />
        }
      ]
    }
  ];

  if (activeModule === 'pos') {
    return <CashierWorkspace onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'clients') {
    return <ClientsModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'orders') {
    return <OrdersModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'routes') {
    return <RoutesModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'production') {
    return <ProductionModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'inventory') {
    return <InventoryModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'purchases') {
    return <PurchasesModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'employees') {
    return <EmployeesModule onBack={() => setActiveModule('main')} />;
  }



  if (activeModule === 'expenses') {
    return <ExpensesModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'incomes') {
    return <IncomesModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'analytics') {
    return <AnalyticsModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'products') {
    return <ProductsModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'recipes') {
    return <RecipesModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'categories') {
    return <CategoriesModule onBack={() => setActiveModule('main')} />;
  }

  if (activeModule === 'fleet') {
    return <FleetModule onBack={() => setActiveModule('main')} />;
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Daurennan CRM</h1>
          <p>Главное меню модулей</p>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.profileBadge}>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>Администратор</span>
              <span className={styles.profileEmail}>admin@daurennan.kz</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Выйти">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.container}>
          {sections.map((section, idx) => (
            <div key={idx} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              
              <div className={styles.grid}>
                {section.modules.map((mod, modIdx) => (
                  <div 
                    key={modIdx} 
                    className={styles.card}
                    onClick={() => {
                      if (mod.title === 'Касса (POS)') {
                        setActiveModule('pos');
                      } else if (mod.title === 'Клиенты') {
                        setActiveModule('clients');
                      } else if (mod.title === 'Заказы клиентов') {
                        setActiveModule('orders');
                      } else if (mod.title === 'Маршруты доставки') {
                        setActiveModule('routes');
                      } else if (mod.title === 'Производство') {
                        setActiveModule('production');
                      } else if (mod.title === 'Сырье') {
                        setActiveModule('inventory');
                      } else if (mod.title === 'Закупки сырья') {
                        setActiveModule('purchases');
                      } else if (mod.title === 'Сотрудники') {
                        setActiveModule('employees');
                      } else if (mod.title === 'Роли и доступы') {
                        setActiveModule('roles');
                      } else if (mod.title === 'Доходы') {
                        setActiveModule('incomes');
                      } else if (mod.title === 'Расходы') {
                        setActiveModule('expenses');
                      } else if (mod.title === 'Аналитика и отчеты') {
                        setActiveModule('analytics');
                      } else if (mod.title === 'Товары') {
                        setActiveModule('products');
                      } else if (mod.title === 'Рецепты') {
                        setActiveModule('recipes');
                      } else if (mod.title === 'Категории') {
                        setActiveModule('categories');
                      } else if (mod.title === 'Справочник автомобилей') {
                        setActiveModule('fleet');
                      } else {
                        alert(`Модуль "${mod.title}" находится в стадии разработки.`);
                      }
                    }}
                  >
                    <div className={styles.iconWrapper}>
                      {mod.icon}
                    </div>
                    <h3 className={styles.cardTitle}>{mod.title}</h3>
                    <p className={styles.cardDesc}>{mod.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

// Forced reload for Vite HMR
