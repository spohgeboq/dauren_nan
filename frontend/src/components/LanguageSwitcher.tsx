import React from 'react';
import { useI18n, type Locale } from '../i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  const options: Array<{ value: Locale; label: string }> = [
    { value: 'ru', label: 'RU' },
    { value: 'kz', label: 'KZ' },
  ];

  return (
    <div className="inline-flex rounded-xl border border-bakery-100 bg-white p-1 shadow-sm" aria-label={t('common.language')}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`min-h-9 rounded-lg px-3 text-xs font-extrabold transition-colors ${
            locale === option.value
              ? 'bg-bakery-600 text-white shadow-sm'
              : 'text-bakery-700 hover:bg-bakery-50'
          }`}
          onClick={() => setLocale(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
