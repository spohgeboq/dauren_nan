import React, { useState, useMemo } from 'react';
import { ArrowLeft, UserPlus, Search, Filter, ShieldCheck, UserCog, Car, ChefHat, CheckCircle2, UserX, X } from 'lucide-react';
import styles from './EmployeesModule.module.css';

type EmployeeRole = 'Администратор' | 'Кассир' | 'Пекарь' | 'Водитель';
type EmployeeStatus = 'Активен' | 'Уволен';

interface Employee {
  id: string;
  fullName: string;
  role: EmployeeRole;
  phone: string;
  login: string;
  status: EmployeeStatus;
  isOnShift: boolean;
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', fullName: 'Айдос Нурланов', role: 'Администратор', phone: '+7 701 111 2233', login: 'admin', status: 'Активен', isOnShift: true },
  { id: '2', fullName: 'Мадина Саматова', role: 'Кассир', phone: '+7 705 222 3344', login: 'madina_c', status: 'Активен', isOnShift: true },
  { id: '3', fullName: 'Бауыржан Оспанов', role: 'Пекарь', phone: '+7 707 333 4455', login: 'b_ospanov', status: 'Активен', isOnShift: true },
  { id: '4', fullName: 'Серик Ахметов', role: 'Водитель', phone: '+7 777 444 5566', login: 'serik_drv', status: 'Активен', isOnShift: false },
  { id: '5', fullName: 'Азамат Ильясов', role: 'Водитель', phone: '+7 701 555 6677', login: 'azamat_drv', status: 'Активен', isOnShift: true },
  { id: '6', fullName: 'Ерлан Жумабаев', role: 'Администратор', phone: '+7 702 123 4567', login: 'erlan_m', status: 'Активен', isOnShift: false },
  { id: '7', fullName: 'Ирина Ким', role: 'Кассир', phone: '+7 705 666 7788', login: 'irina_old', status: 'Уволен', isOnShift: false },
  { id: '8', fullName: 'Максат Туленов', role: 'Водитель', phone: '+7 777 888 9900', login: 'maksat_drv', status: 'Уволен', isOnShift: false },
];

const roleColors: Record<EmployeeRole, string> = {
  'Администратор': styles.badgeAdmin,
  'Кассир': styles.badgeCashier,
  'Пекарь': styles.badgeBaker,
  'Водитель': styles.badgeDriver
};

interface EmployeesModuleProps {
  onBack: () => void;
}

const EmployeesModule: React.FC<EmployeesModuleProps> = ({ onBack }) => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<EmployeeRole | 'Все'>('Все');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<EmployeeRole>('Водитель');
  const [newEmpLogin, setNewEmpLogin] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [newEmpPin, setNewEmpPin] = useState('');

  // Stats
  const activeEmployees = employees.filter(e => e.status === 'Активен');
  const totalCount = activeEmployees.length;
  const onShiftCount = employees.filter(e => e.isOnShift && e.status === 'Активен').length;
  const driversCount = employees.filter(e => e.role === 'Водитель' && e.status === 'Активен').length;

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            emp.phone.includes(searchQuery) || 
                            emp.login.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'Все' || emp.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [employees, searchQuery, filterRole]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpRole) return;

    const newEmp: Employee = {
      id: Date.now().toString(),
      fullName: newEmpName,
      phone: newEmpPhone,
      role: newEmpRole,
      login: newEmpLogin,
      status: 'Активен',
      isOnShift: false
    };

    setEmployees([newEmp, ...employees]);
    setIsModalOpen(false);
    
    // Reset form
    setNewEmpName('');
    setNewEmpPhone('');
    setNewEmpRole('Водитель');
    setNewEmpLogin('');
    setNewEmpPassword('');
    setNewEmpPin('');
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
          <h1 className={styles.title}>Сотрудники</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} />
            Добавить сотрудника
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Widgets */}
        <div className={styles.widgetsGrid}>
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
              <UserCog size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Всего сотрудников (Активные)</span>
              <span className={styles.widgetValue}>{totalCount} чел.</span>
            </div>
          </div>
          
          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <CheckCircle2 size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Сейчас на смене</span>
              <span className={styles.widgetValue}>{onShiftCount} чел.</span>
            </div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetIconWrapper} style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <Car size={24} />
            </div>
            <div className={styles.widgetInfo}>
              <span className={styles.widgetLabel}>Активные водители</span>
              <span className={styles.widgetValue}>{driversCount} чел.</span>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className={styles.workspace}>
          
          {/* Filters Bar */}
          <div className={styles.filtersBar}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Поиск по ФИО, телефону или логину..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className={styles.roleFilterBox}>
              <Filter size={18} className={styles.filterIcon} />
              <select 
                className={styles.roleSelect}
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as EmployeeRole | 'Все')}
              >
                <option value="Все">Все роли</option>
                <option value="Администратор">Администраторы</option>
                <option value="Кассир">Кассиры</option>
                <option value="Пекарь">Пекари</option>
                <option value="Водитель">Водители</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ФИО Сотрудника</th>
                  <th>Роль</th>
                  <th>Телефон</th>
                  <th>Логин (Система)</th>
                  <th className={styles.textRight}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => {
                  const isFired = emp.status === 'Уволен';
                  return (
                    <tr key={emp.id} className={`${styles.tableRow} ${isFired ? styles.rowFired : ''}`}>
                      <td>
                        <div className={styles.empName}>{emp.fullName}</div>
                      </td>
                      <td>
                        <span className={`${styles.roleBadge} ${roleColors[emp.role]}`}>
                          {emp.role}
                        </span>
                      </td>
                      <td>
                        <span className={styles.empPhone}>{emp.phone || '—'}</span>
                      </td>
                      <td>
                        <span className={styles.empLogin}>{emp.login || '—'}</span>
                      </td>
                      <td className={styles.textRight}>
                        {isFired ? (
                          <div className={styles.statusFired}>
                            <UserX size={14} /> Уволен
                          </div>
                        ) : (
                          <div className={styles.statusActive}>
                            Активен
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyTable}>
                      Сотрудники не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Карточка сотрудника</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className={styles.modalForm}>
              
              {/* General Info */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionSubtitle}>Основная информация</h3>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>ФИО</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    required
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Телефон</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={newEmpPhone}
                      onChange={(e) => setNewEmpPhone(e.target.value)}
                      placeholder="+7 (700) 000-00-00"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Роль в системе</label>
                    <select 
                      className={styles.formSelect}
                      value={newEmpRole}
                      onChange={(e) => setNewEmpRole(e.target.value as EmployeeRole)}
                    >
                      <option value="Водитель">Водитель</option>
                      <option value="Кассир">Кассир</option>
                      <option value="Пекарь">Пекарь</option>
                      <option value="Администратор">Администратор</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className={styles.divider} />

              {/* System Access */}
              <div className={styles.formSection}>
                <div className={styles.sectionTitleWrapper}>
                  <ShieldCheck size={18} className={styles.sectionIcon} />
                  <h3 className={styles.sectionSubtitle}>Доступы в систему</h3>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Логин</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={newEmpLogin}
                      onChange={(e) => setNewEmpLogin(e.target.value)}
                      placeholder="Например: i_ivanov"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Пароль</label>
                    <input 
                      type="password" 
                      className={styles.formInput} 
                      value={newEmpPassword}
                      onChange={(e) => setNewEmpPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {newEmpRole === 'Кассир' && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>PIN-код для быстрой кассы</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={newEmpPin}
                      onChange={(e) => setNewEmpPin(e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      placeholder="Например: 1234"
                    />
                    <span className={styles.formHint}>4 цифры. Позволяет кассиру быстро логиниться на планшете POS.</span>
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitBtn} disabled={!newEmpName.trim()}>
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesModule;
