import { useEffect, useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { getClientProfile } from '../api/clientPortal';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../i18n';
import { useAuth } from '../utils/AuthContext';

export default function ClientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { logout: authLogout } = useAuth();
  const [clientName, setClientName] = useState(t('layout.client'));

  const routeTitle = (() => {
    const path = location.pathname;
    if (path.includes('/client/orders')) return t('routerTitles.clientOrders');
    if (path.includes('/client/history')) return t('routerTitles.clientHistory');
    if (path.includes('/client/payments')) return t('routerTitles.clientPayments');
    if (path.includes('/client/profile')) return t('routerTitles.clientProfile');
    return t('routerTitles.clientDashboard');
  })();

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
    const fetchProfile = async () => {
      try {
        const profile = await getClientProfile();
        setClientName(profile.name);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 pb-[env(safe-area-inset-bottom)]">
      <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm"
            title={t('common.mainMenu')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{routeTitle}</h1>
            <p className="text-xs text-gray-500">{clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button onClick={handleLogout} className="text-orange-600 font-medium">
            {t('layout.exit')}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 pb-[env(safe-area-inset-bottom)] z-50">
        <NavLink
          to="/client/dashboard"
          end
          className={({ isActive }) =>
            `flex flex-col items-center py-3 ${isActive ? 'text-orange-600' : 'text-gray-500'}`
          }
        >
          <span className="text-xl leading-none">⌂</span>
          <span className="text-[11px] font-medium mt-1">{t('layout.overview')}</span>
        </NavLink>
        <NavLink
          to="/client/orders"
          className={({ isActive }) =>
            `flex flex-col items-center py-3 ${isActive ? 'text-orange-600' : 'text-gray-500'}`
          }
        >
          <span className="text-xl leading-none">＋</span>
          <span className="text-[11px] font-medium mt-1">{t('layout.orders')}</span>
        </NavLink>
        <NavLink
          to="/client/history"
          className={({ isActive }) =>
            `flex flex-col items-center py-3 ${isActive ? 'text-orange-600' : 'text-gray-500'}`
          }
        >
          <span className="text-xl leading-none">☰</span>
          <span className="text-[11px] font-medium mt-1">{t('layout.history')}</span>
        </NavLink>
        <NavLink
          to="/client/payments"
          className={({ isActive }) =>
            `flex flex-col items-center py-3 ${isActive ? 'text-orange-600' : 'text-gray-500'}`
          }
        >
          <span className="text-xl leading-none">₸</span>
          <span className="text-[11px] font-medium mt-1">{t('layout.payments')}</span>
        </NavLink>
        <NavLink
          to="/client/profile"
          className={({ isActive }) =>
            `flex flex-col items-center py-3 ${isActive ? 'text-orange-600' : 'text-gray-500'}`
          }
        >
          <span className="text-xl leading-none">◯</span>
          <span className="text-[11px] font-medium mt-1">{t('layout.profile')}</span>
        </NavLink>
      </nav>
    </div>
  );
}
