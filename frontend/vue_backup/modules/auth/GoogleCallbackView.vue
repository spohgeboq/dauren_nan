<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <section class="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
      <div v-if="loading" class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-bakery-100 border-t-bakery-700"></div>
      <div v-else class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-lg font-black text-red-600">!</div>

      <h1 class="mt-5 text-2xl font-black text-gray-950">
        {{ loading ? t('auth.googleCallback.loading') : t('auth.googleCallback.errorTitle') }}
      </h1>
      <p class="mt-3 text-sm font-medium leading-6 text-gray-600">
        {{ message }}
      </p>

      <router-link
        v-if="!loading"
        to="/login"
        class="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-bakery-700 px-5 text-sm font-extrabold text-white hover:bg-bakery-800"
      >
        {{ t('auth.googleCallback.backToLogin') }}
      </router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api';
import { useI18n } from '../../i18n';
import { dashboardPathForUser } from '../../utils/authNavigation';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const loading = ref(true);
const error = ref('');

const message = computed(() => error.value || t('auth.googleCallback.loadingText'));

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : '';
  const authError = typeof route.query.error === 'string' ? route.query.error : '';

  if (authError || !token) {
    loading.value = false;
    error.value = t(`auth.googleErrors.${authError || 'missing_token'}`);
    return;
  }

  try {
    localStorage.setItem('token', token);
    localStorage.removeItem('user');

    const response = await api.get('/me');
    const user = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));

    await router.replace(dashboardPathForUser(user));
  } catch (callbackError) {
    console.error(callbackError);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    loading.value = false;
    error.value = t('auth.googleErrors.callback_failed');
  }
});
</script>
