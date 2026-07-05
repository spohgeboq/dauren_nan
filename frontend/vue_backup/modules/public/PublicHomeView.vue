<template>
  <main class="min-h-screen bg-[#f7f3ed] text-gray-950">
    <header class="border-b border-black/5 bg-white/85 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-bakery-700 text-lg font-extrabold text-white shadow-sm">
            D
          </div>
          <div>
            <p class="text-lg font-extrabold leading-tight">Daurennan</p>
            <p class="text-xs font-bold uppercase tracking-wider text-bakery-700">{{ t('publicHome.brandCaption') }}</p>
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
          <a href="#benefits" @click.prevent="scrollTo('benefits')" class="hover:text-bakery-700 transition-colors">{{ t('publicHome.nav.benefits') }}</a>
          <a href="#catalog" @click.prevent="scrollTo('catalog')" class="hover:text-bakery-700 transition-colors">{{ t('publicHome.nav.catalog') }}</a>
          <a href="#delivery-request" @click.prevent="scrollTo('delivery-request')" class="hover:text-bakery-700 transition-colors">{{ t('publicHome.nav.request') }}</a>
        </nav>

        <div class="flex flex-wrap items-center gap-2">
          <LanguageSwitcher />
          <router-link
            to="/login"
            class="inline-flex min-h-11 items-center justify-center rounded-xl border border-bakery-200 bg-white px-4 text-sm font-extrabold text-bakery-800 shadow-sm hover:bg-bakery-50"
          >
            {{ t('publicHome.login') }}
          </router-link>
          <router-link
            v-if="hasToken"
            to="/dashboard"
            class="inline-flex min-h-11 items-center justify-center rounded-xl bg-bakery-800 px-4 text-sm font-extrabold text-white shadow-sm hover:bg-bakery-900"
          >
            {{ t('publicHome.dashboard') }}
          </router-link>
        </div>
      </div>
    </header>

    <section id="benefits" class="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:px-8 lg:py-14">
      <div class="flex flex-col justify-center">
        <div class="mb-6 inline-flex w-fit rounded-full border border-bakery-200 bg-white px-4 py-2 text-sm font-extrabold text-bakery-800 shadow-sm">
          {{ t('publicHome.badge') }}
        </div>

        <h1 class="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
          {{ t('publicHome.title') }}
        </h1>
        <p class="mt-6 max-w-2xl text-lg font-medium leading-8 text-gray-600">
          {{ t('publicHome.subtitle') }}
        </p>

        <div class="mt-8 grid gap-3 sm:grid-cols-3">
          <div
            v-for="item in metrics"
            :key="item.valueKey"
            class="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
          >
            <p class="text-2xl font-black text-bakery-800">{{ t(item.valueKey) }}</p>
            <p class="mt-1 text-sm font-bold text-gray-500">{{ t(item.labelKey) }}</p>
          </div>
        </div>

        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          <div
            v-for="item in benefits"
            :key="item.titleKey"
            class="flex gap-3 rounded-2xl border border-black/5 bg-white/75 p-4 shadow-sm"
          >
            <component :is="item.icon" class="mt-0.5 h-5 w-5 shrink-0 text-bakery-700" />
            <div>
              <h2 class="text-base font-extrabold text-gray-950">{{ t(item.titleKey) }}</h2>
              <p class="mt-1 text-sm font-medium leading-6 text-gray-600">{{ t(item.textKey) }}</p>
            </div>
          </div>
        </div>
      </div>

      <aside id="delivery-request" class="rounded-[2rem] border border-black/5 bg-white p-5 shadow-2xl shadow-bakery-900/10 sm:p-6">
        <div class="overflow-hidden rounded-3xl bg-bakery-900">
          <div class="relative min-h-56 p-6 text-white">
            <img
              src="../../assets/hero.png"
              alt=""
              class="absolute right-3 top-6 h-40 w-40 opacity-80 sm:h-52 sm:w-52"
            />
            <div class="relative max-w-xs">
              <p class="text-sm font-extrabold uppercase tracking-wider text-bakery-200">{{ t('publicHome.formEyebrow') }}</p>
              <h2 class="mt-3 text-3xl font-black leading-tight">{{ t('publicHome.formTitle') }}</h2>
              <p class="mt-3 text-sm font-medium leading-6 text-bakery-100">{{ t('publicHome.formText') }}</p>
            </div>
          </div>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="submitRequest">
          <div>
            <label class="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('publicHome.fields.name') }}</label>
            <input v-model.trim="form.name" required type="text" class="field" :placeholder="t('publicHome.placeholders.name')" />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('publicHome.fields.type') }}</label>
              <select v-model="form.type" required class="field">
                <option value="store">{{ t('publicHome.clientTypes.store') }}</option>
                <option value="organization">{{ t('publicHome.clientTypes.organization') }}</option>
                <option value="regular">{{ t('publicHome.clientTypes.regular') }}</option>
                <option value="retail">{{ t('publicHome.clientTypes.retail') }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('publicHome.fields.phone') }}</label>
              <input v-maska data-maska="+7 (###) ###-##-##" v-model.trim="form.phone" required type="tel" class="field" placeholder="+7 (777) 000-00-00" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('publicHome.fields.contact') }}</label>
              <input v-model.trim="form.contact_person" type="text" class="field" :placeholder="t('publicHome.placeholders.contact')" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('publicHome.fields.email') }}</label>
              <input v-model.trim="form.email" type="email" class="field" placeholder="shop@example.kz" />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('publicHome.fields.address') }}</label>
            <input v-model.trim="form.address" required type="text" class="field" :placeholder="t('publicHome.placeholders.address')" />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('publicHome.fields.time') }}</label>
              <input v-model.trim="form.preferred_delivery_time" type="text" class="field" :placeholder="t('publicHome.placeholders.time')" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('publicHome.fields.comment') }}</label>
              <input v-model.trim="form.comment" type="text" class="field" :placeholder="t('publicHome.placeholders.comment')" />
            </div>
          </div>

          <p v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {{ error }}
          </p>

          <button
            type="submit"
            :disabled="submitting"
            class="flex min-h-14 w-full items-center justify-center rounded-2xl bg-bakery-700 px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-bakery-900/15 transition hover:bg-bakery-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ submitting ? t('publicHome.submitting') : t('publicHome.submit') }}
          </button>
        </form>
      </aside>
    </section>

    <section id="catalog" class="border-t border-black/5 bg-[#fffaf7]">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div class="max-w-3xl">
          <p class="text-sm font-black uppercase tracking-wider text-emerald-700">{{ t('publicHome.catalog.eyebrow') }}</p>
          <h2 class="mt-3 text-3xl font-black leading-tight text-gray-950 sm:text-4xl">
            {{ t('publicHome.catalog.title') }}
          </h2>
          <p class="mt-4 max-w-2xl text-base font-medium leading-7 text-gray-600">
            {{ t('publicHome.catalog.subtitle') }}
          </p>
        </div>

        <div
          class="mt-9 grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          :class="{ 'opacity-80': catalogLoading && !publicProducts.length }"
        >
          <article
            v-for="product in catalogProducts"
            :key="product.id"
            class="group overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div class="aspect-square bg-[#efe8e3] relative overflow-hidden flex items-center justify-center">
              <img
                v-if="product.image_url && product.image_url !== fallbackProductImage"
                :src="product.image_url"
                :alt="product.name"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                @error="useFallbackImage"
              />
              <div v-else class="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <span class="text-7xl sm:text-8xl drop-shadow-md">🍞</span>
              </div>
            </div>

            <div class="px-5 py-4 bg-white text-center">
              <h3 class="font-bold text-gray-900 text-[15px] sm:text-base leading-tight truncate">
                {{ product.name }}
              </h3>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="border-y border-black/5 bg-white">
      <div class="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        <div
          v-for="step in steps"
          :key="step.titleKey"
          class="rounded-2xl border border-gray-100 bg-gray-50 p-5"
        >
          <p class="text-sm font-black uppercase tracking-wider text-bakery-700">{{ t(step.numberKey) }}</p>
          <h3 class="mt-3 text-lg font-black text-gray-950">{{ t(step.titleKey) }}</h3>
          <p class="mt-2 text-sm font-medium leading-6 text-gray-600">{{ t(step.textKey) }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Clock3, ShieldCheck, Truck, WalletCards } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import LanguageSwitcher from '../../components/LanguageSwitcher.vue';
import { useI18n } from '../../i18n';
import { createClientRegistrationRequest } from '../../api/clientRegistrationRequests';
import type { ClientType } from '../../api/clients';
import { getPublicCatalogProducts, type PublicCatalogProduct } from '../../api/products';
import { vMaska } from 'maska/vue';

type CatalogProduct = PublicCatalogProduct;

const { t } = useI18n();
const router = useRouter();
const submitting = ref(false);
const error = ref('');
const hasToken = computed(() => Boolean(localStorage.getItem('token')));
const publicProducts = ref<PublicCatalogProduct[]>([]);
const catalogLoading = ref(false);
const fallbackProductImage = new URL('../../assets/hero.png', import.meta.url).href;

const scrollTo = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Update URL hash without jumping
    window.history.pushState(null, '', `#${id}`);
  }
};

const form = reactive({
  name: '',
  type: 'store' as ClientType,
  phone: '',
  email: '',
  address: '',
  contact_person: '',
  preferred_delivery_time: '',
  comment: '',
});

const benefits = [
  { icon: Truck, titleKey: 'publicHome.benefits.delivery.title', textKey: 'publicHome.benefits.delivery.text' },
  { icon: Clock3, titleKey: 'publicHome.benefits.fresh.title', textKey: 'publicHome.benefits.fresh.text' },
  { icon: WalletCards, titleKey: 'publicHome.benefits.payment.title', textKey: 'publicHome.benefits.payment.text' },
  { icon: ShieldCheck, titleKey: 'publicHome.benefits.control.title', textKey: 'publicHome.benefits.control.text' },
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

const fallbackProducts = computed<CatalogProduct[]>(() => [
  {
    id: -1,
    name: t('publicHome.catalog.fallback.classic.name'),
    image_url: fallbackProductImage,
  },
  {
    id: -2,
    name: t('publicHome.catalog.fallback.rye.name'),
    image_url: fallbackProductImage,
  },
  {
    id: -3,
    name: t('publicHome.catalog.fallback.bun.name'),
    image_url: fallbackProductImage,
  },
  {
    id: -4,
    name: t('publicHome.catalog.fallback.flatbread.name'),
    image_url: fallbackProductImage,
  },
]);

const catalogProducts = computed<CatalogProduct[]>(() => (
  publicProducts.value.length ? publicProducts.value : fallbackProducts.value
));

const useFallbackImage = (event: Event) => {
  const image = event.target as HTMLImageElement;

  if (image.dataset.fallbackApplied !== 'true') {
    image.dataset.fallbackApplied = 'true';
    image.src = fallbackProductImage;
  }
};

const loadCatalog = async () => {
  catalogLoading.value = true;

  try {
    publicProducts.value = await getPublicCatalogProducts();
  } catch {
    publicProducts.value = [];
  } finally {
    catalogLoading.value = false;
  }
};

onMounted(loadCatalog);

const submitRequest = async () => {
  submitting.value = true;
  error.value = '';

  try {
    const request = await createClientRegistrationRequest({
      ...form,
      email: form.email || undefined,
      contact_person: form.contact_person || undefined,
      preferred_delivery_time: form.preferred_delivery_time || undefined,
      comment: form.comment || undefined,
    });

    await router.push({
      name: 'DeliveryRequestSent',
      query: { id: request.id },
    });
  } catch (requestError: any) {
    error.value = requestError.response?.data?.message || t('publicHome.submitError');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.field {
  @apply w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-sm outline-none transition focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100;
}
</style>
