import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut } from 'lucide-react';
import api from '../../api';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useI18n } from '../../i18n';
import { useAuth } from '../../utils/AuthContext';

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface MenuItem {
  to: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  iconClass: string;
  badgeKey: string;
  badgeClass: string;
  permissions?: string[];
  roles?: string[];
  group: string;
}

const menuItems: MenuItem[] = [
  {
    to: '/pos',
    titleKey: 'dashboard.modules.pos.title',
    descriptionKey: 'dashboard.modules.pos.description',
    icon: '🛒',
    iconClass: 'bg-bakery-50 text-bakery-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['sales.create'],
    group: 'sales',
  },
  {
    to: '/admin/products',
    titleKey: 'dashboard.modules.products.title',
    descriptionKey: 'dashboard.modules.products.description',
    icon: '⚙️',
    iconClass: 'bg-blue-50 text-blue-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['products.create', 'products.update', 'products.delete'],
    group: 'dictionaries',
  },
  {
    to: '/admin/recipes',
    titleKey: 'dashboard.modules.recipes.title',
    descriptionKey: 'dashboard.modules.recipes.description',
    icon: '📋',
    iconClass: 'bg-emerald-50 text-emerald-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['recipes.view'],
    group: 'dictionaries',
  },
  {
    to: '/production',
    titleKey: 'dashboard.modules.production.title',
    descriptionKey: 'dashboard.modules.production.description',
    icon: '🏭',
    iconClass: 'bg-bakery-50 text-bakery-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['production.create'],
    group: 'production',
  },
  {
    to: '/admin/raw-materials',
    titleKey: 'dashboard.modules.rawMaterials.title',
    descriptionKey: 'dashboard.modules.rawMaterials.description',
    icon: '🌾',
    iconClass: 'bg-amber-50 text-amber-700',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['raw-materials.view'],
    group: 'production',
  },
  {
    to: '/admin/categories',
    titleKey: 'dashboard.modules.categories.title',
    descriptionKey: 'dashboard.modules.categories.description',
    icon: '📁',
    iconClass: 'bg-purple-50 text-purple-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['products.create', 'products.update', 'products.delete'],
    group: 'dictionaries',
  },
  {
    to: '/admin/users',
    titleKey: 'dashboard.modules.users.title',
    descriptionKey: 'dashboard.modules.users.description',
    icon: '👥',
    iconClass: 'bg-indigo-50 text-indigo-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['users.view'],
    group: 'management',
  },
  {
    to: '/admin/roles',
    titleKey: 'dashboard.modules.roles.title',
    descriptionKey: 'dashboard.modules.roles.description',
    icon: '🔐',
    iconClass: 'bg-red-50 text-red-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['settings.manage'],
    group: 'management',
  },
  {
    to: '/admin/expenses',
    titleKey: 'dashboard.modules.expenses.title',
    descriptionKey: 'dashboard.modules.expenses.description',
    icon: '💸',
    iconClass: 'bg-pink-50 text-pink-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['expenses.view'],
    group: 'management',
  },
  {
    to: '/admin/purchases',
    titleKey: 'dashboard.modules.purchases.title',
    descriptionKey: 'dashboard.modules.purchases.description',
    icon: '🛒',
    iconClass: 'bg-orange-50 text-orange-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['purchases.view'],
    group: 'production',
  },
  {
    to: '/admin/reports',
    titleKey: 'dashboard.modules.reports.title',
    descriptionKey: 'dashboard.modules.reports.description',
    icon: '📊',
    iconClass: 'bg-indigo-50 text-indigo-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['reports.view'],
    group: 'management',
  },
  {
    to: '/admin/clients',
    titleKey: 'dashboard.modules.clients.title',
    descriptionKey: 'dashboard.modules.clients.description',
    icon: '🏪',
    iconClass: 'bg-indigo-50 text-indigo-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['clients.create', 'clients.update', 'clients.delete'],
    group: 'sales',
  },
  {
    to: '/admin/orders',
    titleKey: 'adminOrders.title',
    descriptionKey: 'adminOrders.subtitle',
    icon: '📝',
    iconClass: 'bg-yellow-50 text-yellow-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['drivers.manage'],
    group: 'sales',
  },
  {
    to: '/admin/deliveries/routes',
    titleKey: 'dashboard.modules.deliveryRoutes.title',
    descriptionKey: 'dashboard.modules.deliveryRoutes.description',
    icon: '🚚',
    iconClass: 'bg-cyan-50 text-cyan-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['drivers.manage'],
    group: 'sales',
  },
  {
    to: '/driver',
    titleKey: 'dashboard.modules.driver.title',
    descriptionKey: 'dashboard.modules.driver.description',
    icon: '🚚',
    iconClass: 'bg-blue-50 text-blue-600',
    badgeKey: 'dashboard.badges.pwa',
    badgeClass: 'bg-blue-500',
    permissions: ['deliveries.view'],
    roles: ['driver'],
    group: 'sales',
  },
  {
    to: '/client',
    titleKey: 'dashboard.modules.clientPortal.title',
    descriptionKey: 'dashboard.modules.clientPortal.description',
    icon: '🧾',
    iconClass: 'bg-emerald-50 text-emerald-600',
    badgeKey: 'dashboard.badges.cabinet',
    badgeClass: 'bg-blue-500',
    roles: ['client'],
    group: 'sales',
  },
  {
    to: '/admin/vehicles',
    titleKey: 'adminVehicles.title',
    descriptionKey: 'adminVehicles.subtitle',
    icon: '🚗',
    iconClass: 'bg-gray-50 text-gray-600',
    badgeKey: 'dashboard.badges.implemented',
    badgeClass: 'bg-green-500',
    permissions: ['expenses.create'],
    group: 'dictionaries',
  },
];

export default function DashboardView() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { logout: authLogout } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const initials = useMemo(() => {
    const name = currentUser?.name || '';
    return (
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'U'
    );
  }, [currentUser?.name]);

  const roleLabel = (role: string) =>
    ({
      admin: t('roles.admin'),
      baker: t('roles.baker'),
      seller: t('roles.seller'),
      driver: t('roles.driver'),
      client: t('roles.client'),
    })[role] || role;

  const hasAnyPermission = (permissions: string[] = []) => {
    if (!permissions.length) return true;
    const userPermissions = currentUser?.permissions || [];
    return permissions.some((p) => userPermissions.includes(p));
  };

  const hasAnyRole = (roles: string[] = []) => {
    if (!roles.length) return true;
    const userRoles = currentUser?.roles || [];
    return roles.some((r) => userRoles.includes(r));
  };

  const groupedMenuItems = useMemo(() => {
    if (!currentUser) return {};

    const visible = menuItems.filter(
      (item) => hasAnyPermission(item.permissions) && hasAnyRole(item.roles)
    );
    const groups: Record<string, MenuItem[]> = {};

    visible.forEach((item) => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });

    return groups;
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    }
    authLogout();
    navigate('/login');
  };

  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch {}
    }

    const fetchUser = async () => {
      try {
        const response = await api.get('/me');
        setCurrentUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {t('common.appName')}
            </h1>
            <p className="text-lg text-gray-500 mt-2 font-medium">{t('dashboard.subtitle')}</p>
          </div>

          <div className="w-full rounded-2xl border border-bakery-100/80 bg-white/95 p-3 shadow-[0_18px_45px_-30px_rgba(57,45,40,0.55)] ring-1 ring-white lg:w-auto">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-bakery-100 bg-bakery-50 text-lg font-extrabold text-bakery-800 shadow-inner">
                  {initials}
                  <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"></span>
                </div>

                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-px w-5 bg-bakery-300"></span>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-bakery-600">
                      {t('common.activeSession')}
                    </p>
                  </div>
                  <p className="truncate text-base font-extrabold leading-tight text-gray-950">
                    {currentUser?.name || t('common.loading')}
                  </p>
                  <p className="truncate text-sm font-medium text-gray-500">
                    {currentUser?.email || ''}
                  </p>
                </div>
              </div>

              <div className="hidden h-12 w-px bg-gradient-to-b from-transparent via-bakery-100 to-transparent sm:block"></div>

              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-wrap gap-1.5">
                  {(currentUser?.roles || []).map((role) => (
                    <span
                      key={role}
                      className="rounded-full border border-bakery-100 bg-bakery-50 px-2.5 py-1 text-xs font-extrabold text-bakery-800"
                    >
                      {roleLabel(role)}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 sm:ml-auto">
                  <LanguageSwitcher />
                  <Link
                    to="/profile"
                    title={t('common.profile')}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bakery-200 bg-white text-bakery-800 shadow-sm transition-colors hover:bg-bakery-50"
                  >
                    <UserIcon className="h-5 w-5" />
                  </Link>
                  <button
                    title={t('common.logout')}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-bakery-900 text-white shadow-sm transition-colors hover:bg-bakery-800"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {Object.keys(groupedMenuItems).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(groupedMenuItems).map(([group, items]) => (
              <div key={group}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    {t(`dashboard.groups.${group}`)}
                  </h2>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col h-full"
                    >
                      <div
                        className={`absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-xl ${item.badgeClass}`}
                      >
                        {t(item.badgeKey)}
                      </div>
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform shrink-0 ${item.iconClass}`}
                      >
                        {item.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{t(item.titleKey)}</h3>
                      <p className="text-gray-500 font-medium flex-1">{t(item.descriptionKey)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard.noModulesTitle')}</h2>
            <p className="text-gray-500 font-medium">{t('dashboard.noModulesText')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
