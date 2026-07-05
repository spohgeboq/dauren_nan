<template>
  <div class="h-screen flex flex-col bg-gray-50 text-gray-900 pb-[env(safe-area-inset-bottom)]">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Back to Main Menu Button -->
        <router-link 
          to="/dashboard" 
          class="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm focus:outline-none touch-manipulation group"
          :title="t('common.mainMenu')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:-translate-x-1 transition-transform">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </router-link>

        <div>
          <h1 class="text-lg font-bold text-gray-900 leading-tight">{{ routeTitle }}</h1>
          <p class="text-xs text-gray-500">{{ user?.name || t('layout.driver') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <LanguageSwitcher />
        <button @click="logout" class="text-bakery-600 font-medium">{{ t('layout.exit') }}</button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto p-4 pb-20">
      <router-view />
    </main>

    <!-- Bottom Navigation Bar (Mobile App Style) -->
    <nav class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around pb-[env(safe-area-inset-bottom)] z-50">
      <router-link to="/driver/route" class="flex-1 flex flex-col items-center py-3 text-gray-500" active-class="text-bakery-600">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
        <span class="text-xs font-medium">{{ t('layout.route') }}</span>
      </router-link>
      <router-link to="/driver/deliveries" class="flex-1 flex flex-col items-center py-3 text-gray-500" active-class="text-bakery-600">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        <span class="text-xs font-medium">{{ t('layout.deliveries') }}</span>
      </router-link>
      <router-link to="/driver/returns" class="flex-1 flex flex-col items-center py-3 text-gray-500" active-class="text-bakery-600">
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path></svg>
        <span class="text-xs font-medium">{{ t('layout.returns') }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import api from '../api'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import { useI18n } from '../i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const user = ref<any>({ name: t('common.loading') })

const routeTitle = computed(() => {
  const titles: Record<string, string> = {
    DriverRoute: t('routerTitles.driverRoute'),
    DriverDeliveryCreate: t('routerTitles.driverDeliveryCreate'),
    DriverReturns: t('routerTitles.driverReturns'),
  }

  if (route.meta?.titleKey) {
    return t(route.meta.titleKey as string)
  }
  return titles[String(route.name || '')] || t('layout.route')
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
    const res = await api.get('/me')
    user.value = res.data.data
  } catch (e) {
    console.error(e)
  }
})
</script>
