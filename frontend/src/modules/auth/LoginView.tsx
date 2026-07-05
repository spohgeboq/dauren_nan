import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { supportsBrowserGoogleAuth } from '../../config/appSurface';
import { useI18n } from '../../i18n';
import { useAuth } from '../../utils/AuthContext';
import { dashboardPathForUser } from '../../utils/authNavigation';

export default function LoginView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'email' | 'pin'>('email');
  const [pinCode, setPinCode] = useState('');

  const [form, setForm] = useState({ email: '', password: '' });

  const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  const googleLoginUrl = `${apiBaseUrl}/auth/google/redirect`;

  const getDeviceUuid = () => {
    let uuid = localStorage.getItem('device_uuid');
    if (!uuid) {
      uuid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      localStorage.setItem('device_uuid', uuid);
    }
    return uuid;
  };

  const processLoginResponse = (response: any) => {
    if (response.data.token) {
      login(response.data.token, response.data.user);

      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
        return;
      }

      navigate(dashboardPathForUser(response.data.user));
    } else {
      setErrorMessage(t('auth.tokenError'));
    }
  };

  const appendNum = (num: string) => {
    if (pinCode.length < 4) {
      setPinCode(pinCode + num);
    }
    setErrorMessage('');
  };

  const deleteNum = () => {
    setPinCode(pinCode.slice(0, -1));
    setErrorMessage('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
        device_uuid: getDeviceUuid(),
      });
      processLoginResponse(response);
    } catch (error: any) {
      if (error.response?.status === 422 || error.response?.status === 401) {
        setErrorMessage(t('auth.invalidCredentials'));
      } else {
        setErrorMessage(t('auth.connectionError'));
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length !== 4) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/auth/pin-login', {
        pin_code: pinCode,
        device_uuid: getDeviceUuid(),
      });
      processLoginResponse(response);
    } catch (error: any) {
      if (error.response?.status === 422 || error.response?.status === 401) {
        setErrorMessage(error.response?.data?.errors?.pin_code?.[0] || 'Неверный ПИН-код');
      } else {
        setErrorMessage(t('auth.connectionError'));
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-20 h-20 bg-bakery-600 text-white rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg mb-6">
          🥐
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('auth.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-3xl sm:px-10 border border-gray-100">
          <div className="space-y-6">
            {supportsBrowserGoogleAuth && (
              <a
                href={googleLoginUrl}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-extrabold text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:ring-offset-2"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-xs font-black text-blue-600">
                  G
                </span>
                {t('auth.google')}
              </a>
            )}

            {supportsBrowserGoogleAuth && (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {t('auth.or')}
                </span>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>
            )}

            <div className="flex border-b border-gray-200 mb-6">
              <button
                type="button"
                className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
                  loginMode === 'email'
                    ? 'border-bakery-600 text-bakery-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setLoginMode('email')}
              >
                Email
              </button>
              <button
                type="button"
                className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
                  loginMode === 'pin'
                    ? 'border-bakery-600 text-bakery-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setLoginMode('pin')}
              >
                PIN-код
              </button>
            </div>

            {loginMode === 'email' ? (
              <form className="space-y-6" onSubmit={handleLogin}>
                {errorMessage && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('auth.email')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-bakery-500 focus:border-bakery-500 sm:text-sm"
                      placeholder="admin@daurennan.kz"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('auth.password')}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-bakery-500 focus:border-bakery-500 sm:text-sm"
                      placeholder="******"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {!showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-bakery-600 hover:bg-bakery-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 transition-colors disabled:opacity-50"
                  >
                    {loading ? t('auth.loading') : t('auth.submit')}
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handlePinLogin}>
                {errorMessage && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 text-center mb-4">
                    Введите 4-значный ПИН-код
                  </label>

                  <div className="flex justify-center mb-6 space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`w-12 h-14 rounded-xl flex items-center justify-center text-3xl font-bold border-2 ${
                          pinCode.length >= i
                            ? 'border-bakery-600 bg-bakery-50 text-bakery-900'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        {pinCode.length >= i ? '•' : ''}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6 max-w-[280px] mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl font-extrabold text-gray-900 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
                        onClick={() => appendNum(num)}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-xl font-bold text-gray-500 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
                      onClick={() => setPinCode('')}
                    >
                      Сброс
                    </button>
                    <button
                      type="button"
                      className="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl font-extrabold text-gray-900 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
                      onClick={() => appendNum('0')}
                    >
                      0
                    </button>
                    <button
                      type="button"
                      className="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-700 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
                      onClick={deleteNum}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                      </svg>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || pinCode.length !== 4}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-bakery-600 hover:bg-bakery-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 transition-colors disabled:opacity-50"
                  >
                    {loading ? t('auth.loading') : 'Войти'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
