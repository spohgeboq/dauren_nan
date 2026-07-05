<template>
  <div class="inline-flex rounded-xl border border-bakery-100 bg-white p-1 shadow-sm" :aria-label="t('common.language')">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="min-h-9 rounded-lg px-3 text-xs font-extrabold transition-colors"
      :class="locale === option.value ? 'bg-bakery-600 text-white shadow-sm' : 'text-bakery-700 hover:bg-bakery-50'"
      @click="setLocale(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n, type Locale } from '../i18n';

const { locale, setLocale, t } = useI18n();

const options: Array<{ value: Locale; label: string }> = [
  { value: 'ru', label: 'RU' },
  { value: 'kz', label: 'KZ' },
];
</script>
