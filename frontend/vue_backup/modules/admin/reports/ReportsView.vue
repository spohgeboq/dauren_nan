<template>
  <div class="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div class="flex items-center gap-3 sm:gap-4 w-full">
          <!-- Back to Main Menu Button -->
          <router-link 
            to="/dashboard" 
            class="flex shrink-0 items-center justify-center gap-2 px-3 sm:px-4 h-10 sm:h-12 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-bakery-500 touch-manipulation group"
            title="В главное меню"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span class="font-bold text-sm hidden sm:inline">{{ t('common.backToMenu') }}</span>
          </router-link>

          <div class="min-w-0">
            <div class="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 truncate w-full">
              <router-link to="/admin" class="hover:text-bakery-600 transition-colors truncate">Dashboard</router-link>
              <span class="shrink-0">/</span>
              <span class="text-gray-900 font-medium truncate">{{ t('adminReports.breadcrumb') }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight truncate">{{ t('adminReports.title') }}</h1>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="mb-6 sm:mb-8 border-b border-gray-200">
        <nav class="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto pb-1" aria-label="Tabs">
          <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-bakery-500 text-bakery-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]">
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 min-h-[500px]">
        
        <DailyReportTab v-if="activeTab === 'daily'" />
        <ProductionReportTab v-if="activeTab === 'production'" />
        <InventoryReportTab v-if="activeTab === 'inventory'" />
        <ExpenseReportTab v-if="activeTab === 'expenses'" />
        <ClientReportTab v-if="activeTab === 'clients'" />
        <EmployeeReportTab v-if="activeTab === 'employees'" />

      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DailyReportTab from './components/DailyReportTab.vue';
import ProductionReportTab from './components/ProductionReportTab.vue';
import InventoryReportTab from './components/InventoryReportTab.vue';
import ExpenseReportTab from './components/ExpenseReportTab.vue';
import ClientReportTab from './components/ClientReportTab.vue';
import EmployeeReportTab from './components/EmployeeReportTab.vue';
import { useI18n } from '../../../i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const tabs = [
  { id: 'daily', name: t('adminReports.tabs.daily') },
  { id: 'production', name: t('adminReports.tabs.production') },
  { id: 'inventory', name: t('adminReports.tabs.inventory') },
  { id: 'expenses', name: t('adminReports.tabs.expenses') },
  { id: 'clients', name: t('adminReports.tabs.clients') },
  { id: 'employees', name: t('adminReports.tabs.employees') },
];

const queryTab = typeof route.query.tab === 'string' ? route.query.tab : '';
const normalizedQueryTab = queryTab === 'drivers' ? 'employees' : queryTab;
const activeTab = ref(tabs.some((tab) => tab.id === normalizedQueryTab) ? normalizedQueryTab : 'daily');

if (queryTab === 'drivers') {
  void router.replace({
    query: {
      ...route.query,
      tab: 'employees',
    },
  });
}
</script>
