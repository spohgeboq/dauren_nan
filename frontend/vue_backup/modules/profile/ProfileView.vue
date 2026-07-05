<template>
  <div class="min-h-screen bg-gray-50 font-sans p-6 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <router-link to="/dashboard" class="text-sm font-bold text-orange-600 hover:text-orange-700">{{ t('common.backToMenu') }}</router-link>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">{{ t('profile.title') }}</h1>
          <p class="text-gray-500 mt-1">{{ t('profile.subtitle') }}</p>
        </div>
        <div class="flex items-center gap-2">
          <LanguageSwitcher />
          <button @click="logout" class="px-5 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors">
            {{ t('common.logout') }}
          </button>
        </div>
      </header>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-5 font-medium">
        {{ error }}
      </div>

      <div v-else-if="user" class="space-y-6">
        <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center text-2xl font-extrabold">
              {{ initials }}
            </div>
            <div class="min-w-0">
              <h2 class="text-2xl font-extrabold text-gray-900">{{ user.name }}</h2>
              <p class="text-gray-500 break-all">{{ user.email }}</p>
              <p v-if="user.phone" class="text-gray-500 mt-1">{{ user.phone }}</p>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p class="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">{{ t('profile.roles') }}</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="role in user.roles" :key="role" class="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-sm font-bold">
                {{ roleLabel(role) }}
              </span>
              <span v-if="!user.roles?.length" class="text-gray-400">{{ t('profile.noRoles') }}</span>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p class="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">{{ t('profile.status') }}</p>
            <span :class="user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'" class="px-3 py-1 rounded-full text-sm font-bold">
              {{ user.is_active ? t('profile.active') : t('profile.inactive') }}
            </span>
          </div>
        </section>

        <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p class="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">{{ t('profile.quickLinks') }}</p>
          <div class="flex flex-wrap gap-3">
            <router-link v-if="hasRole('admin')" to="/admin" class="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold">{{ t('profile.adminMenu') }}</router-link>
            <router-link v-if="hasRole('seller')" to="/pos" class="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold">{{ t('profile.pos') }}</router-link>
            <router-link v-if="hasRole('driver')" to="/driver" class="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold">{{ t('profile.route') }}</router-link>
            <router-link v-if="hasRole('client')" to="/client" class="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold">{{ t('profile.clientCabinet') }}</router-link>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import { useI18n } from '../../i18n'

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  is_active: boolean;
  roles: string[];
  permissions: string[];
}

const router = useRouter()
const { t } = useI18n()
const loading = ref(true)
const error = ref('')
const user = ref<CurrentUser | null>(null)

const initials = computed(() => {
  const name = user.value?.name || ''
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U'
})

const roleLabel = (role: string) => ({
  admin: t('roles.admin'),
  baker: t('roles.baker'),
  seller: t('roles.seller'),
  driver: t('roles.driver'),
  client: t('roles.client'),
}[role] || role)

const hasRole = (role: string) => Boolean(user.value?.roles?.includes(role))

const logout = async () => {
  try {
    await api.post('/auth/logout')
  } catch (e) {
    console.error(e)
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(async () => {
  try {
    const response = await api.get('/me')
    user.value = response.data.data
    localStorage.setItem('user', JSON.stringify(response.data.data))
  } catch (e: any) {
    error.value = e.response?.data?.message || t('profile.loadError')
  } finally {
    loading.value = false
  }
})
</script>
