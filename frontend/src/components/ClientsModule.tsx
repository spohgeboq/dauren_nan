import React, { useState } from 'react';
import { ArrowLeft, Search, Plus, Store, User, Phone, MapPin, X, TrendingDown, Building2, PackageCheck } from 'lucide-react';
import styles from './ClientsModule.module.css';

interface Client {
  id: string;
  name: string;
  type: string;
  ownerName: string;
  phone: string;
  email: string;
  route: string;
  balance: number;
  deliveryTime: string;
}

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Продуктовый "Айгерим"', type: 'Магазин у дома', ownerName: 'Айгерим', phone: '+7 (701) 123-45-67', email: 'aigerim@mail.ru', route: 'Маршрут #1 (Центр)', balance: -15500, deliveryTime: '08:00 - 10:00' },
  { id: '2', name: 'Кофейня "Зерно"', type: 'Кафе', ownerName: 'Данияр', phone: '+7 (705) 987-65-43', email: 'zerno@cafe.kz', route: 'Маршрут #2 (Юг)', balance: 0, deliveryTime: '07:00 - 08:30' },
  { id: '3', name: 'Супермаркет "Алма"', type: 'Супермаркет', ownerName: 'ТОО АлмаТрейд', phone: '+7 (777) 555-44-33', email: 'info@alma.kz', route: 'Маршрут #1 (Центр)', balance: -45000, deliveryTime: '06:00 - 08:00' },
  { id: '4', name: 'Столовая "Вкусно"', type: 'Столовая', ownerName: 'Гульмира', phone: '+7 (707) 111-22-33', email: '-', route: 'Маршрут #3 (Север)', balance: 12000, deliveryTime: '09:00 - 11:00' },
  { id: '5', name: 'Минимаркет "24/7"', type: 'Магазин у дома', ownerName: 'Азамат', phone: '+7 (775) 333-22-11', email: 'aza24@yandex.ru', route: 'Маршрут #2 (Юг)', balance: -5000, deliveryTime: '09:00 - 12:00' },
];

const ROUTES = ['Все маршруты', 'Маршрут #1 (Центр)', 'Маршрут #2 (Юг)', 'Маршрут #3 (Север)'];
const CLIENT_TYPES = ['Магазин у дома', 'Супермаркет', 'Кафе', 'Ресторан', 'Столовая'];

interface ClientsModuleProps {
  onBack: () => void;
}

const ClientsModule: React.FC<ClientsModuleProps> = ({ onBack }) => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState('Все маршруты');
  const [debtorsOnly, setDebtorsOnly] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '', type: 'Магазин у дома', ownerName: '', phone: '', email: '', deliveryTime: ''
  });

  // Derived Stats
  const activeCount = clients.length;
  const totalDebt = clients.filter(c => c.balance < 0).reduce((acc, c) => acc + Math.abs(c.balance), 0);
  const shippedThisWeek = '1 250 000 ₸'; // Mocked

  // Filtering
  const filteredClients = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRoute = routeFilter === 'Все маршруты' || c.route === routeFilter;
    const matchDebt = debtorsOnly ? c.balance < 0 : true;
    return matchSearch && matchRoute && matchDebt;
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const id = (clients.length + 1).toString();
    const added: Client = {
      id,
      name: newClient.name || '',
      type: newClient.type || '',
      ownerName: newClient.ownerName || '',
      phone: newClient.phone || '',
      email: newClient.email || '',
      route: 'Не назначен', // Default
      balance: 0,
      deliveryTime: newClient.deliveryTime || '',
    };
    setClients([added, ...clients]);
    setIsModalOpen(false);
    setNewClient({ name: '', type: 'Магазин у дома', ownerName: '', phone: '', email: '', deliveryTime: '' });
  };

  return (
    <div className={styles.container}>
      {/* Header & Back */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Клиенты</h1>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Добавить клиента
        </button>
      </header>

      <main className={styles.main}>
        {/* Analytics Widgets */}
        <div className={styles.widgetsGrid}>
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#f1f5f9', color: '#3b82f6' }}>
              <Building2 size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Активных точек</span>
              <span className={styles.widgetValue}>{activeCount}</span>
            </div>
          </div>
          
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
              <TrendingDown size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Общая сумма долга</span>
              <span className={styles.widgetValue}>{totalDebt.toLocaleString('ru-RU')} ₸</span>
            </div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
              <PackageCheck size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Отгружено за неделю</span>
              <span className={styles.widgetValue}>{shippedThisWeek}</span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className={styles.filtersBar}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Поиск по названию или имени..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select 
            className={styles.routeSelect}
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
          >
            {ROUTES.map(route => (
              <option key={route} value={route}>{route}</option>
            ))}
          </select>

          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={debtorsOnly}
              onChange={(e) => setDebtorsOnly(e.target.checked)}
            />
            <span className={styles.checkboxText}>Только должники</span>
          </label>
        </div>

        {/* Clients Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Название точки</th>
                <th>Контактное лицо</th>
                <th>Маршрут</th>
                <th className={styles.textRight}>Баланс</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.clientNameCell}>
                      <div className={styles.clientAvatar}>
                        <Store size={18} />
                      </div>
                      <div>
                        <div className={styles.clientName}>{client.name}</div>
                        <div className={styles.clientType}>{client.type}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <div className={styles.contactName}>{client.ownerName}</div>
                      <div className={styles.contactPhone}>{client.phone}</div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.routeBadge}>
                      {client.route}
                    </div>
                  </td>
                  <td className={styles.textRight}>
                    {client.balance < 0 ? (
                      <div className={styles.debtBadge}>
                        {client.balance.toLocaleString('ru-RU')} ₸
                      </div>
                    ) : (
                      <div className={styles.positiveBalance}>
                        {client.balance === 0 ? '0 ₸' : `+${client.balance.toLocaleString('ru-RU')} ₸`}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    Ничего не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Новый клиент</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label>Название точки (магазина)</label>
                  <input required type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} placeholder='Например, "Айгерим"' />
                </div>
                
                <div className={styles.fieldGroup}>
                  <label>Тип заведения</label>
                  <select value={newClient.type} onChange={e => setNewClient({...newClient, type: e.target.value})}>
                    {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Имя владельца / ЛПР</label>
                  <input required type="text" value={newClient.ownerName} onChange={e => setNewClient({...newClient, ownerName: e.target.value})} placeholder='Например, Айгерим' />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Телефон</label>
                  <input required type="tel" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder='+7 (700) 000-00-00' />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Email (необязательно)</label>
                  <input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} placeholder='mail@example.com' />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Удобное время доставки</label>
                  <input type="text" value={newClient.deliveryTime} onChange={e => setNewClient({...newClient, deliveryTime: e.target.value})} placeholder='Например, 08:00 - 10:00' />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Добавить клиента
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsModule;
