<template>
  <main class="min-h-screen bg-[#f7f3ed] px-4 py-6 text-gray-950 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-extrabold uppercase tracking-wider text-bakery-700">{{ t('applicant.eyebrow') }}</p>
          <h1 class="mt-2 text-3xl font-black sm:text-4xl">{{ t('applicant.title', { name: userName }) }}</h1>
          <p class="mt-3 max-w-2xl text-sm font-medium leading-6 text-gray-600">{{ t('applicant.subtitle') }}</p>
        </div>

        <div class="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center rounded-xl border border-bakery-200 bg-white px-4 text-sm font-extrabold text-bakery-800 shadow-sm hover:bg-bakery-50"
            @click="logout"
          >
            {{ t('layout.exit') }}
          </button>
        </div>
      </header>

      <section class="mt-8 rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div v-if="loading" class="flex min-h-48 items-center justify-center">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-bakery-100 border-t-bakery-700"></div>
        </div>

        <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {{ error }}
        </div>

        <div v-else class="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <p class="text-sm font-extrabold uppercase tracking-wider text-gray-500">{{ t('applicant.statusTitle') }}</p>
            <h2 class="mt-3 text-2xl font-black">{{ statusTitle }}</h2>
            <p class="mt-3 text-sm font-medium leading-6 text-gray-600">{{ statusText }}</p>

            <dl v-if="registrationRequest" class="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div class="rounded-xl bg-gray-50 p-4">
                <dt class="font-bold text-gray-500">{{ t('applicant.requestName') }}</dt>
                <dd class="mt-1 font-extrabold text-gray-950">{{ registrationRequest.name }}</dd>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <dt class="font-bold text-gray-500">{{ t('applicant.requestPhone') }}</dt>
                <dd class="mt-1 font-extrabold text-gray-950">{{ registrationRequest.phone }}</dd>
              </div>
              <div class="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                <dt class="font-bold text-gray-500">{{ t('applicant.requestAddress') }}</dt>
                <dd class="mt-1 font-extrabold text-gray-950">{{ registrationRequest.address }}</dd>
              </div>
            </dl>

            <div class="mt-6 flex flex-wrap gap-3">
              <router-link
                v-if="!registrationRequest"
                to="/welcome#delivery-request"
                class="inline-flex min-h-11 items-center justify-center rounded-xl bg-bakery-700 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-bakery-800"
              >
                {{ t('applicant.createRequest') }}
              </router-link>
              <button
                type="button"
                class="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-extrabold text-gray-800 shadow-sm hover:bg-gray-50"
                @click="loadRequest"
              >
                {{ t('applicant.refresh') }}
              </button>
              <button
                v-if="registrationRequest?.status === 'approved'"
                type="button"
                class="inline-flex min-h-11 items-center justify-center rounded-xl bg-green-700 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-green-800"
                @click="goToClientCabinet"
              >
                {{ t('applicant.openCabinet') }}
              </button>
            </div>
          </div>

          <aside class="rounded-2xl bg-bakery-950 p-5 text-white">
            <p class="text-sm font-extrabold uppercase tracking-wider text-bakery-200">{{ t('applicant.nextTitle') }}</p>
            <ol class="mt-5 space-y-4">
              <li v-for="step in steps" :key="step.title" class="flex gap-3">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black">{{ step.number }}</span>
                <div>
                  <p class="font-extrabold">{{ step.title }}</p>
                  <p class="mt-1 text-sm font-medium leading-5 text-bakery-100">{{ step.text }}</p>
                </div>
              </li>
            </ol>
          </aside>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
import {
  getMyClientRegistrationRequest,
  type ClientRegistrationRequest,
} from '../../api/clientRegistrationRequests';
import LanguageSwitcher from '../../components/LanguageSwitcher.vue';
import { useI18n } from '../../i18n';
import { dashboardPathForUser } from '../../utils/authNavigation';

const router = useRouter();
const { t } = useI18n();
const loading = ref(true);
const error = ref('');
const registrationRequest = ref<ClientRegistrationRequest | null>(null);

const cachedUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
});

const userName = computed(() => cachedUser.value?.name || cachedUser.value?.email || t('applicant.user'));

const statusTitle = computed(() => {
  if (!registrationRequest.value) {
    return t('applicant.status.none.title');
  }

  return t(`applicant.status.${registrationRequest.value.status}.title`);
});

const statusText = computed(() => {
  if (!registrationRequest.value) {
    return t('applicant.status.none.text');
  }

  return t(`applicant.status.${registrationRequest.value.status}.text`);
});

const steps = computed(() => [
  { number: '1', title: t('applicant.steps.request.title'), text: t('applicant.steps.request.text') },
  { number: '2', title: t('applicant.steps.review.title'), text: t('applicant.steps.review.text') },
  { number: '3', title: t('applicant.steps.access.title'), text: t('applicant.steps.access.text') },
]);

const loadRequest = async () => {
  loading.value = true;
  error.value = '';

  try {
    registrationRequest.value = await getMyClientRegistrationRequest();
  } catch (requestError: any) {
    error.value = requestError.response?.data?.message || t('applicant.loadError');
  } finally {
    loading.value = false;
  }
};

const goToClientCabinet = async () => {
  localStorage.removeItem('user');
  const response = await api.get('/me');
  const user = response.data.data;
  localStorage.setItem('user', JSON.stringify(user));
  await router.push(dashboardPathForUser(user));
};

const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (logoutError) {
    console.error(logoutError);
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  await router.push('/login');
};

onMounted(loadRequest);
</script>
