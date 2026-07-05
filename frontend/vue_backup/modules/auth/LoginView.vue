<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="absolute right-4 top-4">
      <LanguageSwitcher />
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div class="w-20 h-20 bg-bakery-600 text-white rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg mb-6">
        🥐
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{ t('auth.title') }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        {{ t('auth.subtitle') }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-3xl sm:px-10 border border-gray-100">
        <div class="space-y-6">
          <a
            v-if="supportsBrowserGoogleAuth"
            :href="googleLoginUrl"
            class="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-extrabold text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:ring-offset-2"
          >
            <span class="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-xs font-black text-blue-600">G</span>
            {{ t('auth.google') }}
          </a>

          <div v-if="supportsBrowserGoogleAuth" class="flex items-center gap-3">
            <div class="h-px flex-1 bg-gray-200"></div>
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">{{ t('auth.or') }}</span>
            <div class="h-px flex-1 bg-gray-200"></div>
          </div>

          <div class="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              :class="['flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors', loginMode === 'email' ? 'border-bakery-600 text-bakery-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
              @click="loginMode = 'email'"
            >
              Email
            </button>
            <button
              type="button"
              :class="['flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors', loginMode === 'pin' ? 'border-bakery-600 text-bakery-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
              @click="loginMode = 'pin'"
            >
              PIN-код
            </button>
          </div>

        <form v-if="loginMode === 'email'" class="space-y-6" @submit.prevent="handleLogin">
          
          <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              {{ t('auth.email') }}
            </label>
            <div class="mt-1">
              <input id="email" v-model="form.email" type="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-bakery-500 focus:border-bakery-500 sm:text-sm" placeholder="admin@daurennan.kz">
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              {{ t('auth.password') }}
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" required class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-bakery-500 focus:border-bakery-500 sm:text-sm" placeholder="******">
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none">
                <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-bakery-600 hover:bg-bakery-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 transition-colors disabled:opacity-50">
              <span v-if="loading">{{ t('auth.loading') }}</span>
              <span v-else>{{ t('auth.submit') }}</span>
            </button>
          </div>
        </form>

        <form v-else class="space-y-6" @submit.prevent="handlePinLogin">
          
          <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 text-center mb-4">
              Введите 4-значный ПИН-код
            </label>
            
            <div class="flex justify-center mb-6 space-x-3">
              <div 
                v-for="i in 4" 
                :key="i"
                class="w-12 h-14 rounded-xl flex items-center justify-center text-3xl font-bold border-2"
                :class="pinCode.length >= i ? 'border-bakery-600 bg-bakery-50 text-bakery-900' : 'border-gray-200 bg-white'"
              >
                {{ pinCode.length >= i ? '•' : '' }}
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3 mb-6 max-w-[280px] mx-auto">
              <button
                v-for="num in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                :key="num"
                type="button"
                class="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl font-extrabold text-gray-900 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
                @click="appendNum(num)"
              >
                {{ num }}
              </button>
              <button
                type="button"
                class="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-xl font-bold text-gray-500 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
                @click="pinCode = ''"
              >
                Сброс
              </button>
              <button
                type="button"
                class="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl font-extrabold text-gray-900 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
                @click="appendNum('0')"
              >
                0
              </button>
              <button
                type="button"
                class="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-700 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
                @click="deleteNum"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                </svg>
              </button>
            </div>

            <button type="submit" :disabled="loading || pinCode.length !== 4" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-bakery-600 hover:bg-bakery-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 transition-colors disabled:opacity-50">
              <span v-if="loading">{{ t('auth.loading') }}</span>
              <span v-else>Войти</span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
import LanguageSwitcher from '../../components/LanguageSwitcher.vue';
import { supportsBrowserGoogleAuth } from '../../config/appSurface';
import { useI18n } from '../../i18n';
import { dashboardPathForUser } from '../../utils/authNavigation';

const router = useRouter();
const { t } = useI18n();
const loading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);
const loginMode = ref<'email'|'pin'>('email');
const pinCode = ref('');

const form = reactive({
  email: '',
  password: ''
});

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
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    const redirect = router.currentRoute.value.query.redirect;
    if (typeof redirect === 'string') {
      router.push(redirect);
      return;
    }

    router.push(dashboardPathForUser(response.data.user));
  } else {
    errorMessage.value = t('auth.tokenError');
  }
};

const appendNum = (num: string) => {
  if (pinCode.value.length < 4) {
    pinCode.value += num;
  }
  errorMessage.value = '';
};

const deleteNum = () => {
  pinCode.value = pinCode.value.slice(0, -1);
  errorMessage.value = '';
};

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await api.post('/auth/login', {
      email: form.email,
      password: form.password,
      device_uuid: getDeviceUuid(),
    });
    processLoginResponse(response);
  } catch (error: any) {
    if (error.response?.status === 422 || error.response?.status === 401) {
      errorMessage.value = t('auth.invalidCredentials');
    } else {
      errorMessage.value = t('auth.connectionError');
    }
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handlePinLogin = async () => {
  if (pinCode.value.length !== 4) return;
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await api.post('/auth/pin-login', {
      pin_code: pinCode.value,
      device_uuid: getDeviceUuid(),
    });
    processLoginResponse(response);
  } catch (error: any) {
    if (error.response?.status === 422 || error.response?.status === 401) {
      errorMessage.value = error.response?.data?.errors?.pin_code?.[0] || 'Неверный ПИН-код';
    } else {
      errorMessage.value = t('auth.connectionError');
    }
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>
