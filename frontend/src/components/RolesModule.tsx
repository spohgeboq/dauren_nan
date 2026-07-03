import React, { useState } from 'react';
import { ArrowLeft, Plus, ShieldCheck, Save, Users } from 'lucide-react';
import styles from './RolesModule.module.css';

interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

interface RolePermissions {
  [key: string]: Permission;
}

interface Role {
  id: string;
  name: string;
  employeeCount: number;
  isSystemAdmin: boolean;
  permissions: RolePermissions;
}

const MODULES_LIST = [
  { id: 'pos', name: 'Касса (POS)' },
  { id: 'clients', name: 'Клиенты' },
  { id: 'orders', name: 'Заказы клиентов' },
  { id: 'routes', name: 'Маршруты доставки' },
  { id: 'production', name: 'Производство' },
  { id: 'inventory', name: 'Сырье и Склад' },
  { id: 'purchases', name: 'Закупки сырья' },
  { id: 'employees', name: 'Сотрудники' },
  { id: 'roles', name: 'Роли и доступы' }
];

const DEFAULT_PERMISSIONS: RolePermissions = MODULES_LIST.reduce((acc, mod) => {
  acc[mod.id] = { view: false, edit: false, delete: false };
  return acc;
}, {} as RolePermissions);

const MOCK_ROLES: Role[] = [
  {
    id: 'r1', name: 'Администратор', employeeCount: 2, isSystemAdmin: true,
    permissions: MODULES_LIST.reduce((acc, mod) => {
      acc[mod.id] = { view: true, edit: true, delete: true };
      return acc;
    }, {} as RolePermissions)
  },
  {
    id: 'r2', name: 'Кассир', employeeCount: 3, isSystemAdmin: false,
    permissions: {
      ...DEFAULT_PERMISSIONS,
      pos: { view: true, edit: true, delete: false },
      clients: { view: true, edit: false, delete: false }
    }
  },
  {
    id: 'r3', name: 'Пекарь', employeeCount: 4, isSystemAdmin: false,
    permissions: {
      ...DEFAULT_PERMISSIONS,
      production: { view: true, edit: true, delete: false },
      inventory: { view: true, edit: false, delete: false }
    }
  },
  {
    id: 'r4', name: 'Водитель', employeeCount: 5, isSystemAdmin: false,
    permissions: {
      ...DEFAULT_PERMISSIONS,
      routes: { view: true, edit: false, delete: false }
    }
  }
];

interface RolesModuleProps {
  onBack: () => void;
}

const RolesModule: React.FC<RolesModuleProps> = ({ onBack }) => {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [activeRoleId, setActiveRoleId] = useState<string>('r1');
  const [hasChanges, setHasChanges] = useState(false);

  const activeRole = roles.find(r => r.id === activeRoleId);

  const handleRoleNameChange = (newName: string) => {
    if (!activeRole || activeRole.isSystemAdmin) return;
    setRoles(prev => prev.map(r => r.id === activeRoleId ? { ...r, name: newName } : r));
    setHasChanges(true);
  };

  const handlePermissionToggle = (moduleId: string, permType: keyof Permission) => {
    if (!activeRole || activeRole.isSystemAdmin) return;

    setRoles(prev => prev.map(role => {
      if (role.id === activeRoleId) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleId]: {
              ...role.permissions[moduleId],
              [permType]: !role.permissions[moduleId][permType]
            }
          }
        };
      }
      return role;
    }));
    setHasChanges(true);
  };

  const handleCreateRole = () => {
    const newRole: Role = {
      id: `new_${Date.now()}`,
      name: 'Новая роль',
      employeeCount: 0,
      isSystemAdmin: false,
      permissions: { ...DEFAULT_PERMISSIONS }
    };
    setRoles([...roles, newRole]);
    setActiveRoleId(newRole.id);
    setHasChanges(true);
  };

  const handleSave = () => {
    // В реальном приложении здесь был бы API вызов
    setHasChanges(false);
  };

  // Switch UI Component
  const ToggleSwitch = ({ checked, disabled, onChange }: { checked: boolean, disabled?: boolean, onChange: () => void }) => (
    <div 
      className={`${styles.toggleSwitch} ${checked ? styles.toggleOn : styles.toggleOff} ${disabled ? styles.toggleDisabled : ''}`}
      onClick={() => { if (!disabled) onChange(); }}
    >
      <div className={`${styles.toggleKnob} ${checked ? styles.knobOn : styles.knobOff}`} />
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className={styles.title}>Роли и доступы</h1>
        </div>
        <div className={styles.headerRight}>
          {hasChanges && (
            <button className={styles.saveBtn} onClick={handleSave}>
              <Save size={18} />
              Сохранить изменения
            </button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.workspace}>
          
          {/* Left Panel: Roles List */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Список ролей</h2>
            </div>
            
            <div className={styles.rolesList}>
              {roles.map(role => (
                <button
                  key={role.id}
                  className={`${styles.roleCard} ${activeRoleId === role.id ? styles.roleCardActive : ''}`}
                  onClick={() => setActiveRoleId(role.id)}
                >
                  <div className={styles.roleCardInfo}>
                    <ShieldCheck size={18} className={activeRoleId === role.id ? styles.iconActive : styles.iconInactive} />
                    <span className={styles.roleCardName}>{role.name}</span>
                  </div>
                  <div className={styles.roleCardCount}>
                    {role.employeeCount} чел.
                  </div>
                </button>
              ))}
            </div>

            <div className={styles.sidebarFooter}>
              <button className={styles.createRoleBtn} onClick={handleCreateRole}>
                <Plus size={18} />
                Создать роль
              </button>
            </div>
          </aside>

          {/* Right Panel: Role Settings */}
          <section className={styles.detailsArea}>
            {activeRole ? (
              <div className={styles.settingsContainer}>
                
                {/* Role Header Settings */}
                <div className={styles.settingsHeader}>
                  <div className={styles.roleNameInputGroup}>
                    <label className={styles.inputLabel}>Название роли</label>
                    <input 
                      type="text"
                      className={styles.roleNameInput}
                      value={activeRole.name}
                      onChange={(e) => handleRoleNameChange(e.target.value)}
                      disabled={activeRole.isSystemAdmin}
                    />
                    {activeRole.isSystemAdmin && (
                      <span className={styles.adminHint}>Системная роль. Изменение невозможно.</span>
                    )}
                  </div>
                  <div className={styles.statsBadge}>
                    <Users size={16} />
                    <span>Привязано сотрудников: {activeRole.employeeCount}</span>
                  </div>
                </div>

                {/* Permissions Matrix */}
                <div className={styles.matrixContainer}>
                  <h3 className={styles.matrixTitle}>Матрица прав доступа</h3>
                  
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Модуль системы</th>
                          <th className={styles.textCenter}>Просмотр</th>
                          <th className={styles.textCenter}>Создание / Изменение</th>
                          <th className={styles.textCenter}>Удаление</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MODULES_LIST.map(mod => {
                          const perms = activeRole.permissions[mod.id] || { view: false, edit: false, delete: false };
                          return (
                            <tr key={mod.id}>
                              <td className={styles.moduleNameCell}>
                                {mod.name}
                              </td>
                              <td className={styles.textCenter}>
                                <ToggleSwitch 
                                  checked={perms.view} 
                                  disabled={activeRole.isSystemAdmin}
                                  onChange={() => handlePermissionToggle(mod.id, 'view')}
                                />
                              </td>
                              <td className={styles.textCenter}>
                                <ToggleSwitch 
                                  checked={perms.edit} 
                                  disabled={activeRole.isSystemAdmin || (!perms.view && !perms.edit)} 
                                  onChange={() => handlePermissionToggle(mod.id, 'edit')}
                                />
                              </td>
                              <td className={styles.textCenter}>
                                <ToggleSwitch 
                                  checked={perms.delete} 
                                  disabled={activeRole.isSystemAdmin || (!perms.view && !perms.delete)} 
                                  onChange={() => handlePermissionToggle(mod.id, 'delete')}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Выберите роль слева для настройки прав.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default RolesModule;
