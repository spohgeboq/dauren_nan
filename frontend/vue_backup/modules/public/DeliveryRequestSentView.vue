<template>
  <main class="flex min-h-screen items-center justify-center bg-[#f7f3ed] px-4 py-10 text-gray-950">
    <section class="w-full max-w-2xl rounded-[2rem] border border-black/5 bg-white p-6 text-center shadow-2xl shadow-bakery-950/10 sm:p-10">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/20">
        <CheckCircle2 class="h-8 w-8" />
      </div>

      <p class="mt-6 text-sm font-extrabold uppercase tracking-wider text-bakery-700">
        {{ t('deliveryRequestSent.eyebrow') }}
      </p>
      <h1 class="mt-3 text-3xl font-black leading-tight text-gray-950 sm:text-4xl">
        {{ t('deliveryRequestSent.title') }}
      </h1>
      <p class="mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-gray-600">
        {{ t('deliveryRequestSent.text') }}
      </p>

      <div class="mt-8 grid gap-3 text-left sm:grid-cols-3">
        <div
          v-for="item in items"
          :key="item.titleKey"
          class="rounded-2xl border border-gray-100 bg-gray-50 p-4"
        >
          <component :is="item.icon" class="h-5 w-5 text-bakery-700" />
          <h2 class="mt-3 text-sm font-black text-gray-950">{{ t(item.titleKey) }}</h2>
          <p class="mt-1 text-sm font-medium leading-6 text-gray-600">{{ t(item.textKey) }}</p>
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <router-link
          to="/"
          class="inline-flex min-h-12 items-center justify-center rounded-xl bg-bakery-700 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-bakery-800"
        >
          {{ t('deliveryRequestSent.home') }}
        </router-link>
        <router-link
          to="/login"
          class="inline-flex min-h-12 items-center justify-center rounded-xl border border-bakery-200 bg-white px-5 text-sm font-extrabold text-bakery-800 shadow-sm hover:bg-bakery-50"
        >
          {{ t('deliveryRequestSent.login') }}
        </router-link>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { CheckCircle2, ClipboardCheck, PhoneCall, Truck } from 'lucide-vue-next';
import { useI18n } from '../../i18n';

const { t } = useI18n();

const items = [
  { icon: ClipboardCheck, titleKey: 'deliveryRequestSent.steps.review.title', textKey: 'deliveryRequestSent.steps.review.text' },
  { icon: PhoneCall, titleKey: 'deliveryRequestSent.steps.call.title', textKey: 'deliveryRequestSent.steps.call.text' },
  { icon: Truck, titleKey: 'deliveryRequestSent.steps.delivery.title', textKey: 'deliveryRequestSent.steps.delivery.text' },
];
</script>
