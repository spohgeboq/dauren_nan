import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { useI18n } from '../../i18n';
import { useAuth } from '../../utils/AuthContext';
import { dashboardPathForUser } from '../../utils/authNavigation';

export default function GoogleCallbackView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const message = error || t('auth.googleCallback.loadingText');

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token') || '';
      const authError = searchParams.get('error') || '';

      if (authError || !token) {
        setLoading(false);
        setError(t(`auth.googleErrors.${authError || 'missing_token'}`));
        return;
      }

      try {
        localStorage.setItem('token', token);
        localStorage.removeItem('user');

        const response = await api.get('/me');
        const user = response.data.data;
        login(token, user);

        navigate(dashboardPathForUser(user), { replace: true });
      } catch (callbackError) {
        console.error(callbackError);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        setError(t('auth.googleErrors.callback_failed'));
      }
    };

    processCallback();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        {loading ? (
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-bakery-100 border-t-bakery-700"></div>
        ) : (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-lg font-black text-red-600">
            !
          </div>
        )}

        <h1 className="mt-5 text-2xl font-black text-gray-950">
          {loading ? t('auth.googleCallback.loading') : t('auth.googleCallback.errorTitle')}
        </h1>
        <p className="mt-3 text-sm font-medium leading-6 text-gray-600">{message}</p>

        {!loading && (
          <Link
            to="/login"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-bakery-700 px-5 text-sm font-extrabold text-white hover:bg-bakery-800"
          >
            {t('auth.googleCallback.backToLogin')}
          </Link>
        )}
      </section>
    </div>
  );
}
