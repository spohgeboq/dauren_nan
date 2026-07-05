import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock3, ShieldCheck, Truck, WalletCards } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useI18n } from '../../i18n';
import { createClientRegistrationRequest } from '../../api/clientRegistrationRequests';
import type { ClientType } from '../../api/clients';
import { getPublicCatalogProducts, type PublicCatalogProduct } from '../../api/products';

type CatalogProduct = PublicCatalogProduct;

export default function PublicHomeView() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const hasToken = Boolean(localStorage.getItem('token'));
  const [publicProducts, setPublicProducts] = useState<PublicCatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'store' as ClientType,
    phone: '',
    email: '',
    address: '',
    contact_person: '',
    preferred_delivery_time: '',
    comment: '',
  });

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  const benefits = [
    { Icon: Truck, titleKey: 'publicHome.benefits.delivery.title', textKey: 'publicHome.benefits.delivery.text' },
    { Icon: Clock3, titleKey: 'publicHome.benefits.fresh.title', textKey: 'publicHome.benefits.fresh.text' },
    { Icon: WalletCards, titleKey: 'publicHome.benefits.payment.title', textKey: 'publicHome.benefits.payment.text' },
    { Icon: ShieldCheck, titleKey: 'publicHome.benefits.control.title', textKey: 'publicHome.benefits.control.text' },
  ];

  const metrics = [
    { valueKey: 'publicHome.metrics.assortment.value', labelKey: 'publicHome.metrics.assortment.label' },
    { valueKey: 'publicHome.metrics.delivery.value', labelKey: 'publicHome.metrics.delivery.label' },
    { valueKey: 'publicHome.metrics.payments.value', labelKey: 'publicHome.metrics.payments.label' },
  ];

  const steps = [
    { numberKey: 'publicHome.steps.request.number', titleKey: 'publicHome.steps.request.title', textKey: 'publicHome.steps.request.text' },
    { numberKey: 'publicHome.steps.call.number', titleKey: 'publicHome.steps.call.title', textKey: 'publicHome.steps.call.text' },
    { numberKey: 'publicHome.steps.connect.number', titleKey: 'publicHome.steps.connect.title', textKey: 'publicHome.steps.connect.text' },
  ];

  const fallbackProducts = useMemo<CatalogProduct[]>(
    () => [
      { id: -1, name: t('publicHome.catalog.fallback.classic.name'), image_url: '' },
      { id: -2, name: t('publicHome.catalog.fallback.rye.name'), image_url: '' },
      { id: -3, name: t('publicHome.catalog.fallback.bun.name'), image_url: '' },
      { id: -4, name: t('publicHome.catalog.fallback.flatbread.name'), image_url: '' },
    ],
    [t]
  );

  const catalogProducts = publicProducts.length ? publicProducts : fallbackProducts;

  const useFallbackImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied !== 'true') {
      image.dataset.fallbackApplied = 'true';
      image.style.display = 'none';
    }
  };

  useEffect(() => {
    const loadCatalog = async () => {
      setCatalogLoading(true);
      try {
        const products = await getPublicCatalogProducts();
        setPublicProducts(products);
      } catch {
        setPublicProducts([]);
      } finally {
        setCatalogLoading(false);
      }
    };
    loadCatalog();
  }, []);

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const request = await createClientRegistrationRequest({
        ...form,
        email: form.email || undefined,
        contact_person: form.contact_person || undefined,
        preferred_delivery_time: form.preferred_delivery_time || undefined,
        comment: form.comment || undefined,
      });

      navigate(`/delivery-request/sent?id=${request.id}`);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || t('publicHome.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-[#f7f3ed] text-gray-950">
      <header className="border-b border-black/5 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bakery-700 text-lg font-extrabold text-white shadow-sm">
              D
            </div>
            <div>
              <p className="text-lg font-extrabold leading-tight">Daurennan</p>
              <p className="text-xs font-bold uppercase tracking-wider text-bakery-700">
                {t('publicHome.brandCaption')}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
            <a href="#benefits" onClick={(e) => { e.preventDefault(); scrollTo('benefits'); }} className="hover:text-bakery-700 transition-colors">
              {t('publicHome.nav.benefits')}
            </a>
            <a href="#catalog" onClick={(e) => { e.preventDefault(); scrollTo('catalog'); }} className="hover:text-bakery-700 transition-colors">
              {t('publicHome.nav.catalog')}
            </a>
            <a href="#delivery-request" onClick={(e) => { e.preventDefault(); scrollTo('delivery-request'); }} className="hover:text-bakery-700 transition-colors">
              {t('publicHome.nav.request')}
            </a>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-bakery-200 bg-white px-4 text-sm font-extrabold text-bakery-800 shadow-sm hover:bg-bakery-50"
            >
              {t('publicHome.login')}
            </Link>
            {hasToken && (
              <Link
                to="/dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-bakery-800 px-4 text-sm font-extrabold text-white shadow-sm hover:bg-bakery-900"
              >
                {t('publicHome.dashboard')}
              </Link>
            )}
          </div>
        </div>
      </header>

      <section
        id="benefits"
        className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:px-8 lg:py-14"
      >
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit rounded-full border border-bakery-200 bg-white px-4 py-2 text-sm font-extrabold text-bakery-800 shadow-sm">
            {t('publicHome.badge')}
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
            {t('publicHome.title')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-gray-600">
            {t('publicHome.subtitle')}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {metrics.map((item) => (
              <div key={item.valueKey} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <p className="text-2xl font-black text-bakery-800">{t(item.valueKey)}</p>
                <p className="mt-1 text-sm font-bold text-gray-500">{t(item.labelKey)}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {benefits.map((item) => (
              <div key={item.titleKey} className="flex gap-3 rounded-2xl border border-black/5 bg-white/75 p-4 shadow-sm">
                <item.Icon className="mt-0.5 h-5 w-5 shrink-0 text-bakery-700" />
                <div>
                  <h2 className="text-base font-extrabold text-gray-950">{t(item.titleKey)}</h2>
                  <p className="mt-1 text-sm font-medium leading-6 text-gray-600">{t(item.textKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside id="delivery-request" className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-2xl shadow-bakery-900/10 sm:p-6">
          <div className="overflow-hidden rounded-3xl bg-bakery-900">
            <div className="relative min-h-56 p-6 text-white">
              <div className="absolute right-3 top-6 h-40 w-40 opacity-80 sm:h-52 sm:w-52 flex items-center justify-center text-8xl">
                🥐
              </div>
              <div className="relative max-w-xs">
                <p className="text-sm font-extrabold uppercase tracking-wider text-bakery-200">
                  {t('publicHome.formEyebrow')}
                </p>
                <h2 className="mt-3 text-3xl font-black leading-tight">{t('publicHome.formTitle')}</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-bakery-100">
                  {t('publicHome.formText')}
                </p>
              </div>
            </div>
          </div>

          <form className="mt-5 space-y-4" onSubmit={submitRequest}>
            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">
                {t('publicHome.fields.name')}
              </label>
              <input
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                required
                type="text"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-sm outline-none transition focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100"
                placeholder={t('publicHome.placeholders.name')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  {t('publicHome.fields.type')}
                </label>
                <select
                  value={form.type}
                  onChange={(e) => updateForm('type', e.target.value)}
                  required
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-sm outline-none transition focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100"
                >
                  <option value="store">{t('publicHome.clientTypes.store')}</option>
                  <option value="organization">{t('publicHome.clientTypes.organization')}</option>
                  <option value="regular">{t('publicHome.clientTypes.regular')}</option>
                  <option value="retail">{t('publicHome.clientTypes.retail')}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  {t('publicHome.fields.phone')}
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  required
                  type="tel"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-sm outline-none transition focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100"
                  placeholder="+7 (777) 000-00-00"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  {t('publicHome.fields.contact')}
                </label>
                <input
                  value={form.contact_person}
                  onChange={(e) => updateForm('contact_person', e.target.value)}
                  type="text"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-sm outline-none transition focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100"
                  placeholder={t('publicHome.placeholders.contact')}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  {t('publicHome.fields.email')}
                </label>
                <input
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  type="email"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-sm outline-none transition focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100"
                  placeholder="shop@example.kz"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">
                {t('publicHome.fields.address')}
              </label>
              <input
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
                required
                type="text"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-sm outline-none transition focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100"
                placeholder={t('publicHome.placeholders.address')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  {t('publicHome.fields.time')}
                </label>
                <input
                  value={form.preferred_delivery_time}
                  onChange={(e) => updateForm('preferred_delivery_time', e.target.value)}
                  type="text"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-sm outline-none transition focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100"
                  placeholder={t('publicHome.placeholders.time')}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  {t('publicHome.fields.comment')}
                </label>
                <input
                  value={form.comment}
                  onChange={(e) => updateForm('comment', e.target.value)}
                  type="text"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-sm outline-none transition focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100"
                  placeholder={t('publicHome.placeholders.comment')}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-bakery-700 px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-bakery-900/15 transition hover:bg-bakery-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t('publicHome.submitting') : t('publicHome.submit')}
            </button>
          </form>
        </aside>
      </section>

      <section id="catalog" className="border-t border-black/5 bg-[#fffaf7]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wider text-emerald-700">
              {t('publicHome.catalog.eyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-gray-950 sm:text-4xl">
              {t('publicHome.catalog.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-gray-600">
              {t('publicHome.catalog.subtitle')}
            </p>
          </div>

          <div
            className={`mt-9 grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 ${
              catalogLoading && !publicProducts.length ? 'opacity-80' : ''
            }`}
          >
            {catalogProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="aspect-square bg-[#efe8e3] relative overflow-hidden flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={useFallbackImage}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <span className="text-7xl sm:text-8xl drop-shadow-md">🍞</span>
                    </div>
                  )}
                </div>
                <div className="px-5 py-4 bg-white text-center">
                  <h3 className="font-bold text-gray-900 text-[15px] sm:text-base leading-tight truncate">
                    {product.name}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {steps.map((step) => (
            <div key={step.titleKey} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-sm font-black uppercase tracking-wider text-bakery-700">
                {t(step.numberKey)}
              </p>
              <h3 className="mt-3 text-lg font-black text-gray-950">{t(step.titleKey)}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-600">{t(step.textKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
