import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, UserPlus, Search, Filter, ShieldCheck, UserCog, Car, ChefHat, CheckCircle2, UserX, X } from 'lucide-react';
import styles from './EmployeesModule.module.css';
import { api } from '../utils/api';

type EmployeeRole = 'Администратор' | 'Кассир' | 'Пекарь' | 'Водитель';
type EmployeeStatus = 'Активен' | 'Уволен';

interface Employee {
  id: string | number;
  fullName: string;
  role: EmployeeRole;
  phone: string;
  login: string;
  status: EmployeeStatus;
  isOnShift: boolean;
  fixedSalary: number;
}

const ROLE_MAP_TO_BACKEND: Record<EmployeeRole, string> = {
  'Администратор': 'ADMIN',
  'Кассир': 'CASHIER',
  'Пекарь': 'BAKER',
  'Водитель': 'DRIVER',
};

const ROLE_MAP_FROM_BACKEND: Record<string, EmployeeRole> = {
  'ADMIN': 'Администратор',
  'CASHIER': 'Кассир',
  'BAKER': 'Пекарь',
  'DRIVER': 'Водитель',
};

const STATUS_MAP_FROM_BACKEND: Record<string, EmployeeStatus> = {
  'ACTIVE': 'Активен',
  'FIRED': 'Уволен',
};

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
  const [employees, setEmployees] = useState<Employee[]>([]);
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
  const [newEmpSalary, setNewEmpSalary] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editEmpName, setEditEmpName] = useState('');
  const [editEmpPhone, setEditEmpPhone] = useState('');
  const [editEmpRole, setEditEmpRole] = useState<EmployeeRole>('Водитель');
  const [editEmpLogin, setEditEmpLogin] = useState('');
  const [editEmpPassword, setEditEmpPassword] = useState('');
  const [editEmpSalary, setEditEmpSalary] = useState('');

  const fetchEmployees = async () => {
    try {
      const data = await api.get('/users');
      const mapped = data.map((emp: any) => ({
        id: emp.id,
        fullName: emp.name || '',
        phone: emp.phone || '',
        role: ROLE_MAP_FROM_BACKEND[emp.role] || 'Водитель',
        login: emp.login || '',
        status: STATUS_MAP_FROM_BACKEND[emp.status] || 'Активен',
        isOnShift: emp.isOnShift || false,
        fixedSalary: Number(emp.fixedSalary) || 0,
      }));
      setEmployees(mapped);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Stats
  const activeEmployees = employees.filter(e => e.status === 'Активен');
  const totalCount = activeEmployees.length;
  const onShiftCount = employees.filter(e => e.isOnShift && e.status === 'Активен').length;
  const driversCount = employees.filter(e => e.role === 'Водитель' && e.status === 'Активен').length;

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = (emp.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (emp.phone || '').includes(searchQuery) || 
                            (emp.login || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'Все' || emp.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [employees, searchQuery, filterRole]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpRole) return;

    try {
      const loginVal = newEmpLogin.trim() || `user_${Date.now()}`;
      const saved = await api.post('/users', {
        email: `${loginVal}@daurennan.kz`,
        password: newEmpPassword || 'password123',
        name: newEmpName,
        phone: newEmpPhone,
        login: loginVal,
        pin: newEmpPin || undefined,
        role: ROLE_MAP_TO_BACKEND[newEmpRole],
        fixedSalary: Number(newEmpSalary) || 0,
      });

      const mapped: Employee = {
        id: saved.id,
        fullName: saved.name || '',
        phone: saved.phone || '',
        role: ROLE_MAP_FROM_BACKEND[saved.role] || 'Водитель',
        login: saved.login || '',
        status: STATUS_MAP_FROM_BACKEND[saved.status] || 'Активен',
        isOnShift: saved.isOnShift || false,
        fixedSalary: Number(saved.fixedSalary) || 0,
      };

      setEmployees([mapped, ...employees]);
      setIsModalOpen(false);
      
      // Reset form
      setNewEmpName('');
      setNewEmpPhone('');
      setNewEmpRole('Водитель');
      setNewEmpLogin('');
      setNewEmpPassword('');
      setNewEmpPin('');
      setNewEmpSalary('');
    } catch (err) {
      console.error('Error adding employee:', err);
    }
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditEmpName(emp.fullName);
    setEditEmpPhone(emp.phone);
    setEditEmpRole(emp.role);
    setEditEmpLogin(emp.login);
    setEditEmpPassword(''); // don't show old password
    setEditEmpSalary(emp.fixedSalary ? String(emp.fixedSalary) : '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const payload: any = {
        name: editEmpName,
        phone: editEmpPhone,
        role: ROLE_MAP_TO_BACKEND[editEmpRole],
        login: editEmpLogin,
        fixedSalary: Number(editEmpSalary) || 0,
      };
      if (editEmpPassword.trim() !== '') {
        payload.password = editEmpPassword;
      }

      await api.patch(`/users/${selectedEmployee.id}`, payload);
      await fetchEmployees();
      setSelectedEmployee(null);
    } catch (err) {
      console.error('Error updating employee:', err);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      const currentUserStr = localStorage.getItem('user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.id === selectedEmployee.id) {
          alert('Вы не можете удалить свою собственную учетную запись! Если вы удалите себя, вы потеряете доступ к системе.');
          return;
        }
      }
    } catch (e) {
      console.error('Error checking current user', e);
    }

    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника? Это действие необратимо!')) {
      try {
        await api.delete(`/users/${selectedEmployee.id}`);
        await fetchEmployees();
        setSelectedEmployee(null);
      } catch (err) {
        console.error('Error deleting employee:', err);
      }
    }
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
                  <th className={styles.textRight}>Зарплата</th>
                  <th className={styles.textRight}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => {
                  const isFired = emp.status === 'Уволен';
                  return (
                    <tr 
                      key={emp.id} 
                      className={`${styles.tableRow} ${isFired ? styles.rowFired : ''}`}
                      onClick={() => handleOpenEdit(emp)}
                      style={{ cursor: 'pointer' }}
                    >
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
                        {emp.fixedSalary > 0 ? `${emp.fixedSalary.toLocaleString('ru-RU')} ₸` : 'Не указана'}
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

      {/* Edit Employee Modal */}
      {selectedEmployee && (
        <div className={styles.modalOverlay} onClick={() => setSelectedEmployee(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Редактировать сотрудника</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedEmployee(null)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className={styles.modalForm}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionSubtitle}>Основная информация</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>ФИО</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={editEmpName}
                      onChange={(e) => setEditEmpName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Телефон</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={editEmpPhone}
                      onChange={(e) => setEditEmpPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Роль</label>
                    <select 
                      className={styles.formSelect}
                      value={editEmpRole}
                      onChange={(e) => setEditEmpRole(e.target.value as EmployeeRole)}
                    >
                      <option value="Администратор">Администратор</option>
                      <option value="Кассир">Кассир</option>
                      <option value="Пекарь">Пекарь</option>
                      <option value="Водитель">Водитель</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Фиксированная ЗП (₸/мес)</label>
                    <input 
                      type="number" 
                      className={styles.formInput} 
                      value={editEmpSalary}
                      onChange={(e) => setEditEmpSalary(e.target.value)}
                      placeholder="Например: 150000"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionSubtitle}>Доступ к системе</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Логин</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={editEmpLogin}
                      onChange={(e) => setEditEmpLogin(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Новый пароль (оставьте пустым, чтобы не менять)</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder="Новый пароль"
                      value={editEmpPassword}
                      onChange={(e) => setEditEmpPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalActions} style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className={styles.cancelBtn} 
                  style={{ color: '#ef4444', backgroundColor: '#fee2e2' }}
                  onClick={handleDeleteEmployee}
                >
                  Удалить
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setSelectedEmployee(null)}>
                    Отмена
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Сохранить
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Фиксированная ЗП (₸/мес)</label>
                    <input 
                      type="number" 
                      className={styles.formInput} 
                      value={newEmpSalary}
                      onChange={(e) => setNewEmpSalary(e.target.value)}
                      placeholder="Например: 150000"
                    />
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
