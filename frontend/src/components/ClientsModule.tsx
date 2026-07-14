import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Store, User, Phone, MapPin, X, TrendingDown, Building2, PackageCheck, Check, Trash2, Key } from 'lucide-react';
import styles from './ClientsModule.module.css';
import { api } from '../utils/api';

interface Client {
  id: string | number;
  name: string;
  type: string;
  ownerName: string;
  phone: string;
  email: string;
  route: string;
  balance: number;
  deliveryTime: string;
}

interface ClientRequest {
  id: number;
  clientName: string;
  clientType: string;
  phone: string;
  contactName: string;
  address: string;
  deliveryTime: string;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const ROUTES = ['Все маршруты', 'Маршрут #1 (Центр)', 'Маршрут #2 (Юг)', 'Маршрут #3 (Север)'];
const CLIENT_TYPES = ['Магазин у дома', 'Супермаркет', 'Кафе', 'Ресторан', 'Столовая'];

interface ClientsModuleProps {
  onBack: () => void;
}

const ClientsModule: React.FC<ClientsModuleProps> = ({ onBack }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'CLIENTS' | 'REQUESTS'>('CLIENTS');
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState('Все маршруты');
  const [debtorsOnly, setDebtorsOnly] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '', type: 'Магазин у дома', ownerName: '', phone: '', email: '', deliveryTime: '',
    createAccount: false, login: '', password: ''
  });

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<ClientRequest | null>(null);
  const [approveData, setApproveData] = useState({ login: '', password: '' });

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (routeFilter && routeFilter !== 'Все маршруты') queryParams.append('route', routeFilter);
      if (debtorsOnly) queryParams.append('debtorsOnly', 'true');
      
      const [clientsData, requestsData] = await Promise.all([
        api.get(`/clients?${queryParams.toString()}`),
        api.get('/client-requests')
      ]);
      setClients(clientsData);
      setRequests(requestsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [routeFilter, debtorsOnly]);

  // Derived Stats
  const activeCount = clients.length;
  const totalDebt = clients.filter(c => c.balance < 0).reduce((acc, c) => acc + Math.abs(c.balance), 0);
  const shippedThisWeek = '1 250 000 ₸'; // Mocked
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;

  // Filtering
  const filteredClients = clients.filter(c => {
    const matchSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (c.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchRoute = routeFilter === 'Все маршруты' || c.route === routeFilter;
    const matchDebt = debtorsOnly ? c.balance < 0 : true;
    return matchSearch && matchRoute && matchDebt;
  });

  const filteredRequests = requests.filter(r => r.status === 'PENDING');

  const handleDeleteClient = async (id: string | number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого клиента? Это действие необратимо.')) return;
    try {
      await api.delete(`/clients/${id}`);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete client', error);
      alert('Ошибка при удалении клиента');
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: newClient.name,
        type: newClient.type,
        ownerName: newClient.ownerName,
        phone: newClient.phone,
        email: newClient.email,
        deliveryTime: newClient.deliveryTime,
      };
      if (newClient.createAccount) {
        payload.login = newClient.login;
        payload.password = newClient.password;
      }
      await api.post('/clients', payload);
      fetchData();
      setIsModalOpen(false);
      setNewClient({ name: '', type: 'Магазин у дома', ownerName: '', phone: '', email: '', deliveryTime: '', createAccount: false, login: '', password: '' });
    } catch (err) {
      console.error('Error adding client:', err);
      alert('Ошибка при добавлении клиента');
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pwd = "";
    for (let i = 0; i < 8; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    setApproveData(prev => ({ ...prev, password: pwd }));
    setNewClient(prev => ({ ...prev, password: pwd }));
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestToApprove) return;
    try {
      await api.patch(`/client-requests/${requestToApprove.id}/approve`, approveData);
      fetchData();
      setApproveModalOpen(false);
      setRequestToApprove(null);
      setApproveData({ login: '', password: '' });
      alert('Клиент успешно одобрен и аккаунт создан!');
    } catch (error) {
      console.error(error);
      alert('Ошибка при одобрении');
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Точно отклонить заявку?')) return;
    try {
      await api.patch(`/client-requests/${id}/reject`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
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
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
              <PackageCheck size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Новых заявок</span>
              <span className={styles.widgetValue}>{pendingRequests}</span>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'CLIENTS' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('CLIENTS')}
          >
            Все клиенты
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'REQUESTS' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('REQUESTS')}
          >
            Заявки на доставку {pendingRequests > 0 && <span className={styles.badge}>{pendingRequests}</span>}
          </button>
        </div>

        {activeTab === 'CLIENTS' ? (
          <>
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
                    <th className={styles.textRight}>Действия</th>
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
                          {client.route || 'Не назначен'}
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
                      <td className={styles.textRight}>
                        <button 
                          className={styles.rejectBtn} 
                          onClick={() => handleDeleteClient(client.id)}
                          title="Удалить клиента"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles.emptyState}>
                        Ничего не найдено
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Магазин</th>
                  <th>Адрес</th>
                  <th>Контакты</th>
                  <th>Комментарий</th>
                  <th className={styles.textRight}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => (
                  <tr key={req.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.clientNameCell}>
                        <div className={styles.clientAvatar}>
                          <Store size={18} />
                        </div>
                        <div>
                          <div className={styles.clientName}>{req.clientName}</div>
                          <div className={styles.clientType}>{req.clientType}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.routeBadge}>{req.address}</div>
                      {req.deliveryTime && <div style={{fontSize:'12px', marginTop:'4px', color:'#6b7280'}}>Время: {req.deliveryTime}</div>}
                    </td>
                    <td>
                      <div className={styles.contactCell}>
                        <div className={styles.contactName}>{req.contactName}</div>
                        <div className={styles.contactPhone}>{req.phone}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{fontSize:'13px', color:'#4b5563', maxWidth:'200px'}}>{req.comment || '—'}</div>
                    </td>
                    <td className={styles.textRight}>
                      <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
                        <button 
                          className={styles.approveBtn}
                          onClick={() => {
                            setRequestToApprove(req);
                            setApproveModalOpen(true);
                          }}
                        >
                          <Check size={16} /> Одобрить
                        </button>
                        <button 
                          className={styles.rejectBtn}
                          onClick={() => handleReject(req.id)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      Нет новых заявок
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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

              <div className={styles.authSection}>
                <label className={styles.checkboxLabel} style={{ marginTop: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={newClient.createAccount}
                    onChange={(e) => setNewClient({...newClient, createAccount: e.target.checked})}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>Создать аккаунт для приложения</span>
                </label>

                {newClient.createAccount && (
                  <div className={styles.authGrid}>
                    <div className={styles.fieldGroup}>
                      <label>Логин (без пробелов)</label>
                      <input required type="text" value={newClient.login} onChange={e => setNewClient({...newClient, login: e.target.value})} placeholder='my_shop' />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label>Пароль</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input required type="text" value={newClient.password} onChange={e => setNewClient({...newClient, password: e.target.value})} placeholder='Пароль' style={{ flex: 1 }} />
                        <button type="button" onClick={generatePassword} className={styles.secondaryBtn} style={{ padding: '0 12px' }} title="Сгенерировать">
                          <Key size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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

      {/* Approve Request Modal */}
      {approveModalOpen && requestToApprove && (
        <div className={styles.modalOverlay} onClick={() => setApproveModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h2>Одобрение заявки</h2>
              <button className={styles.closeBtn} onClick={() => setApproveModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleApproveSubmit} className={styles.form}>
              <p style={{ marginBottom: '16px', color: '#4b5563', fontSize: '14px', lineHeight: 1.5 }}>
                Создайте логин и пароль для <b>{requestToApprove.clientName}</b>, чтобы клиент мог заходить в приложение и делать заказы.
              </p>
              
              <div className={styles.fieldGroup} style={{ marginBottom: '16px' }}>
                <label>Логин</label>
                <input required type="text" value={approveData.login} onChange={e => setApproveData({...approveData, login: e.target.value})} placeholder='Например, shop123' />
              </div>
              
              <div className={styles.fieldGroup} style={{ marginBottom: '24px' }}>
                <label>Пароль</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input required type="text" value={approveData.password} onChange={e => setApproveData({...approveData, password: e.target.value})} placeholder='Надежный пароль' style={{ flex: 1 }} />
                  <button type="button" onClick={generatePassword} className={styles.secondaryBtn} style={{ padding: '0 12px' }}>
                    <Key size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setApproveModalOpen(false)}>Отмена</button>
                <button type="submit" className={styles.submitBtn}>Одобрить и создать</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsModule;
