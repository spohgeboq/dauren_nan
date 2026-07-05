<template>
  <div>
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ t('adminReports.expense.title') }}</h2>
      </div>

      <div class="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
        <TailwindDateRangePicker v-model="customDateRange" :align-right="true" @update:model-value="onDateRangeChange" />
      </div>
    </div>

    <!-- Filter Panel -->
    <div class="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <!-- Search row -->
      <div class="p-4 border-b border-gray-100">
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Comment search -->
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/></svg>
            <input
              v-model.trim="searchFilter"
              type="search"
              :placeholder="t('adminReports.expense.filters.search')"
              class="w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100 focus:bg-white"
              @keyup.enter="fetchData"
            />
          </div>
          <!-- Apply/Reset buttons -->
          <div class="flex gap-2 flex-shrink-0">
            <button type="button" @click="fetchData" class="h-11 rounded-xl bg-bakery-600 px-5 text-sm font-bold text-white transition-colors hover:bg-bakery-700 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/></svg>
              {{ t('adminReports.expense.filters.apply') }}
            </button>
            <button type="button" @click="resetFilters" :class="activeFiltersCount > 0 ? 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'" class="relative h-11 rounded-xl border px-4 text-sm font-bold transition-colors flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              {{ t('adminReports.expense.filters.reset') }}
              <span v-if="activeFiltersCount > 0" class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-extrabold flex items-center justify-center">{{ activeFiltersCount }}</span>
            </button>
          </div>
        </div>
      </div>
      <!-- Filter chips row -->
      <div class="px-4 py-3 flex flex-wrap gap-3 bg-gray-50 items-center">
        <!-- Category filter -->
        <select v-model="expenseTypeFilter" @change="fetchData" class="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none focus:border-bakery-500 focus:ring-1 focus:ring-bakery-100" :class="expenseTypeFilter ? 'border-bakery-400 text-bakery-700 bg-bakery-50' : ''">
          <option value="">{{ t('adminReports.expense.filters.allCategories') }}</option>
          <option v-for="t in availableExpenseTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <!-- Employee filter -->
        <select v-model="employeeFilter" @change="fetchData" class="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none focus:border-bakery-500 focus:ring-1 focus:ring-bakery-100" :class="employeeFilter ? 'border-bakery-400 text-bakery-700 bg-bakery-50' : ''">
          <option value="">{{ t('adminReports.expense.filters.allEmployees') }}</option>
          <option v-for="e in availableEmployees" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
        <!-- Vehicle filter -->
        <select v-model="vehicleFilter" @change="fetchData" class="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none focus:border-bakery-500 focus:ring-1 focus:ring-bakery-100" :class="vehicleFilter ? 'border-bakery-400 text-bakery-700 bg-bakery-50' : ''">
          <option value="">{{ t('adminReports.expense.filters.allVehicles') }}</option>
          <option v-for="v in availableVehicles" :key="v.id" :value="v.id">{{ v.name }}</option>
        </select>
        <!-- Sort -->
        <select v-model="sortBy" @change="fetchData" class="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none focus:border-bakery-500 focus:ring-1 focus:ring-bakery-100">
          <option value="date">{{ t('adminReports.expense.filters.sortByDate') }}</option>
          <option value="amount">{{ t('adminReports.expense.filters.sortByAmount') }}</option>
        </select>
        <button @click="toggleSortDir" class="h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1">
          {{ sortDir === 'asc' ? t('adminReports.expense.filters.sortAsc') : t('adminReports.expense.filters.sortDesc') }}
        </button>
        <!-- Result count -->
        <span v-if="!loading" class="ml-auto text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
          {{ t('adminReports.expense.filters.found', { count: report.expenses_count || 0 }) }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Summary Header -->
      <div class="bg-white rounded-2xl border border-red-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm overflow-hidden relative">
        <div class="absolute -right-10 -bottom-10 opacity-5">
          <svg class="w-64 h-64 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>
        </div>
        <div class="relative z-10 text-center md:text-left">
          <p class="text-sm font-bold text-red-600 uppercase tracking-wider mb-1">{{ t('adminReports.expense.title') }}</p>
          <h3 class="text-4xl md:text-5xl font-black text-red-700">{{ formatMoney(report.total_expenses) }} ₸</h3>
        </div>
      </div>

      <!-- Categories breakdown -->
      <div v-if="report.by_category && report.by_category.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="cat in report.by_category" :key="cat.expense_type_id" class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between hover:border-red-300 transition-colors cursor-default" @click="filterByCategory(cat.expense_type_id)">
          <div>
            <div class="font-bold text-gray-900">{{ cat.name }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ cat.count }} {{ t('adminReports.expense.filters.found', { count: '' }).trim() }}</div>
          </div>
          <div class="text-right">
            <div class="font-extrabold text-red-600 text-lg">{{ formatMoney(cat.total_amount) }} ₸</div>
            <div class="text-xs font-bold text-gray-400">{{ cat.percentage }}%</div>
          </div>
        </div>
      </div>

      <!-- Detailed Expenses Table -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.expense.columns.date') }}</th>
                <th scope="col" class="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.expense.columns.category') }}</th>
                <th scope="col" class="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.expense.columns.comment') }}</th>
                <th scope="col" class="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.expense.columns.employee') }}</th>
                <th scope="col" class="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.expense.columns.amount') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in report.expenses" :key="item.id" class="hover:bg-gray-50 transition-colors align-top">
                <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{{ formatDate(item.date) }}</td>
                <td class="px-5 py-4 whitespace-nowrap text-sm">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 shadow-sm border border-gray-200">
                    {{ item.expense_type_name }}
                  </span>
                </td>
                <td class="px-5 py-4 text-sm text-gray-900 min-w-[200px]">
                  {{ item.comment || '—' }}
                </td>
                <td class="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div class="font-medium text-gray-900">{{ item.employee_name || '—' }}</div>
                  <div class="text-xs text-gray-400 mt-0.5" v-if="item.creator_name && item.creator_name !== item.employee_name">{{ item.creator_name }}</div>
                </td>
                <td class="px-5 py-4 whitespace-nowrap text-right text-sm font-bold text-red-600">{{ formatMoney(item.amount) }} ₸</td>
              </tr>
              <tr v-if="!report.expenses?.length">
                <td colspan="5" class="px-5 py-12 text-center text-sm text-gray-500">{{ t('adminReports.expense.empty') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getExpenseReport } from '../../../../api/reports';
import { useI18n } from '../../../../i18n';
import TailwindDateRangePicker from '../../../../components/ui/TailwindDateRangePicker.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const localDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const queryString = (value: unknown) => typeof value === 'string' ? value : '';
const parseLocalDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const initialDateFrom = queryString(route.query.date_from) || localDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const initialDateTo = queryString(route.query.date_to) || localDate();
const customDateRange = ref<[Date, Date]>([parseLocalDate(initialDateFrom), parseLocalDate(initialDateTo)]);
const selectedDateFrom = ref(initialDateFrom);
const selectedDateTo = ref(initialDateTo);
const searchFilter = ref(queryString(route.query.search));
const expenseTypeFilter = ref(queryString(route.query.expense_type_id) || '');
const employeeFilter = ref(queryString(route.query.employee_id) || '');
const vehicleFilter = ref(queryString(route.query.vehicle_id) || '');
const sortBy = ref<string>(queryString(route.query.sort_by) || 'date');
const sortDir = ref<'asc' | 'desc'>(
  queryString(route.query.sort_dir) === 'asc' ? 'asc' : 'desc' // Default to desc for expenses
);

const loading = ref(true);
const report = ref<any>({
  total_expenses: 0,
  expenses_count: 0,
  by_category: [],
  expenses: [],
  filter_options: { expense_types: [], employees: [], vehicles: [] }
});

const availableExpenseTypes = computed(() => report.value?.filter_options?.expense_types || []);
const availableEmployees = computed(() => report.value?.filter_options?.employees || []);
const availableVehicles = computed(() => report.value?.filter_options?.vehicles || []);

const activeFiltersCount = computed(() => {
  let count = 0;
  if (searchFilter.value) count++;
  if (expenseTypeFilter.value) count++;
  if (employeeFilter.value) count++;
  if (vehicleFilter.value) count++;
  return count;
});

const toggleSortDir = () => {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  fetchData();
};

const filterByCategory = (typeId: number) => {
  expenseTypeFilter.value = typeId.toString();
  fetchData();
};

const syncQuery = () => {
  router.replace({
    name: 'AdminReports',
    query: {
      tab: 'expenses',
      date_from: selectedDateFrom.value,
      date_to: selectedDateTo.value,
      ...(searchFilter.value ? { search: searchFilter.value } : {}),
      ...(expenseTypeFilter.value ? { expense_type_id: expenseTypeFilter.value } : {}),
      ...(employeeFilter.value ? { employee_id: employeeFilter.value } : {}),
      ...(vehicleFilter.value ? { vehicle_id: vehicleFilter.value } : {}),
      ...(sortBy.value !== 'date' ? { sort_by: sortBy.value } : {}),
      ...(sortDir.value !== 'desc' ? { sort_dir: sortDir.value } : {}),
    },
  });
};

const onDateRangeChange = (val: [Date, Date]) => {
  selectedDateFrom.value = localDate(val[0]);
  selectedDateTo.value = localDate(val[1]);
  fetchData();
};

const resetFilters = () => {
  searchFilter.value = '';
  expenseTypeFilter.value = '';
  employeeFilter.value = '';
  vehicleFilter.value = '';
  sortBy.value = 'date';
  sortDir.value = 'desc';
  fetchData();
};

const formatMoney = (amount: number | string | null | undefined) => Number(amount || 0).toLocaleString('ru-RU');
const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const fetchData = async () => {
  loading.value = true;
  syncQuery();
  try {
    const data = await getExpenseReport(selectedDateFrom.value, selectedDateTo.value, {
      search: searchFilter.value,
      expense_type_id: expenseTypeFilter.value,
      employee_id: employeeFilter.value,
      vehicle_id: vehicleFilter.value,
      sort_by: sortBy.value as any,
      sort_dir: sortDir.value,
    });
    if (data) {
      report.value = data;
    }
  } catch (error) {
    console.error("Failed to fetch expense report", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
