<template>
  <div class="h-screen flex flex-col bg-gray-50 text-gray-900 pb-[env(safe-area-inset-bottom)]">
    <header class="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <router-link
          to="/dashboard"
          class="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm"
          :title="t('common.mainMenu')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </router-link>
        <div>
          <h1 class="text-lg font-bold text-gray-900 leading-tight">{{ routeTitle }}</h1>
          <p class="text-xs text-gray-500">{{ clientName }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <LanguageSwitcher />
        <button @click="logout" class="text-orange-600 font-medium">{{ t('layout.exit') }}</button>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-4 pb-24">
      <router-view />
    </main>

    <nav class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 pb-[env(safe-area-inset-bottom)] z-50">
      <router-link to="/client" class="flex flex-col items-center py-3 text-gray-500" active-class="text-orange-600">
        <span class="text-xl leading-none">⌂</span>
        <span class="text-[11px] font-medium mt-1">{{ t('layout.overview') }}</span>
      </router-link>
      <router-link to="/client/orders" class="flex flex-col items-center py-3 text-gray-500" active-class="text-orange-600">
        <span class="text-xl leading-none">＋</span>
        <span class="text-[11px] font-medium mt-1">{{ t('layout.orders') }}</span>
      </router-link>
      <router-link to="/client/history" class="flex flex-col items-center py-3 text-gray-500" active-class="text-orange-600">
        <span class="text-xl leading-none">☰</span>
        <span class="text-[11px] font-medium mt-1">{{ t('layout.history') }}</span>
      </router-link>
      <router-link to="/client/payments" class="flex flex-col items-center py-3 text-gray-500" active-class="text-orange-600">
        <span class="text-xl leading-none">₸</span>
        <span class="text-[11px] font-medium mt-1">{{ t('layout.payments') }}</span>
      </router-link>
      <router-link to="/client/profile" class="flex flex-col items-center py-3 text-gray-500" active-class="text-orange-600">
        <span class="text-xl leading-none">◯</span>
        <span class="text-[11px] font-medium mt-1">{{ t('layout.profile') }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
import { getClientProfile } from '../api/clientPortal'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import { useI18n } from '../i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const clientName = ref(t('layout.client'))

const routeTitle = computed(() => {
  const titles: Record<string, string> = {
    ClientDashboard: t('routerTitles.clientDashboard'),
    ClientOrders: t('routerTitles.clientOrders'),
    ClientHistory: t('routerTitles.clientHistory'),
    ClientPayments: t('routerTitles.clientPayments'),
    ClientProfile: t('routerTitles.clientProfile'),
  }

  if (route.meta?.titleKey) {
    return t(route.meta.titleKey as string)
  }
  return titles[String(route.name || '')] || t('layout.cabinet')
})

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
    const profile = await getClientProfile()
    clientName.value = profile.name
  } catch (e) {
    console.error(e)
  }
})
</script>
