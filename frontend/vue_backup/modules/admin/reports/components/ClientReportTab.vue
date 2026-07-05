<template>
  <div>
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ t('adminReports.clients.title') }}</h2>
        <p class="mt-1 text-sm text-gray-500">{{ t('adminReports.clients.period', { from: report.date_from || selectedDateFrom, to: report.date_to || selectedDateTo }) }}</p>
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
          <!-- Name search -->
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/></svg>
            <input
              v-model.trim="nameFilter"
              type="search"
              :placeholder="t('adminReports.clients.filters.name')"
              class="w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100 focus:bg-white"
              @keyup.enter="fetchData"
            />
          </div>
          <!-- Phone search -->
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            <input
              v-model.trim="phoneFilter"
              type="search"
              :placeholder="t('adminReports.clients.filters.phone')"
              class="w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100 focus:bg-white"
              @keyup.enter="fetchData"
            />
          </div>
          <!-- Apply/Reset buttons -->
          <div class="flex gap-2 flex-shrink-0">
            <button type="button" @click="fetchData" class="h-11 rounded-xl bg-bakery-600 px-5 text-sm font-bold text-white transition-colors hover:bg-bakery-700 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/></svg>
              {{ t('adminReports.clients.filters.apply') }}
            </button>
            <button type="button" @click="resetFilters" :class="activeFiltersCount > 0 ? 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'" class="relative h-11 rounded-xl border px-4 text-sm font-bold transition-colors flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              {{ t('adminReports.clients.filters.reset') }}
              <span v-if="activeFiltersCount > 0" class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-extrabold flex items-center justify-center">{{ activeFiltersCount }}</span>
            </button>
          </div>
        </div>
      </div>
      <!-- Filter chips row -->
      <div class="px-4 py-3 flex flex-wrap gap-3 bg-gray-50 items-center">
        <!-- Debt filter -->
        <select v-model="debtFilter" @change="fetchData" class="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none focus:border-bakery-500 focus:ring-1 focus:ring-bakery-100" :class="debtFilter !== 'all' ? 'border-bakery-400 text-bakery-700 bg-bakery-50' : ''">
          <option value="all">{{ t('adminReports.clients.filters.allDebt') }}</option>
          <option value="with_debt">{{ t('adminReports.clients.filters.withDebt') }}</option>
          <option value="without_debt">{{ t('adminReports.clients.filters.withoutDebt') }}</option>
        </select>
        <!-- Type filter -->
        <select v-model="typeFilter" @change="fetchData" class="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none focus:border-bakery-500 focus:ring-1 focus:ring-bakery-100" :class="typeFilter !== 'all' ? 'border-bakery-400 text-bakery-700 bg-bakery-50' : ''">
          <option value="all">{{ t('adminReports.clients.filters.allTypes') }}</option>
          <option value="store">{{ t('adminReports.clients.filters.typeStore') }}</option>
          <option value="organization">{{ t('adminReports.clients.filters.typeOrganization') }}</option>
          <option value="retail">{{ t('adminReports.clients.filters.typeRetail') }}</option>
          <option value="regular">{{ t('adminReports.clients.filters.typeRegular') }}</option>
        </select>
        <!-- Driver filter -->
        <select v-model="driverFilter" @change="fetchData" class="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none focus:border-bakery-500 focus:ring-1 focus:ring-bakery-100" :class="driverFilter ? 'border-bakery-400 text-bakery-700 bg-bakery-50' : ''">
          <option value="">{{ t('adminReports.clients.filters.allDrivers') }}</option>
          <option v-for="d in availableDrivers" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
        <!-- Sort -->
        <select v-model="sortBy" @change="fetchData" class="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none focus:border-bakery-500 focus:ring-1 focus:ring-bakery-100">
          <option value="name">{{ t('adminReports.clients.filters.sortByName') }}</option>
          <option value="current_debt">{{ t('adminReports.clients.filters.sortByDebt') }}</option>
          <option value="accepted_amount">{{ t('adminReports.clients.filters.sortByAmount') }}</option>
        </select>
        <button @click="toggleSortDir" class="h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1">
          {{ sortDir === 'asc' ? t('adminReports.clients.filters.sortAsc') : t('adminReports.clients.filters.sortDesc') }}
        </button>
        <!-- Result count -->
        <span v-if="!loading" class="ml-auto text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
          {{ t('adminReports.clients.filters.found', { count: report.totals.clients_count }) }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
    </div>

    <div v-else class="space-y-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div class="text-sm font-bold text-blue-500">{{ t('adminReports.clients.metrics.accepted') }}</div>
          <div class="mt-1 text-3xl font-extrabold text-blue-900">{{ formatNumber(report.totals.accepted_quantity) }}</div>
          <div class="mt-1 text-sm font-bold text-blue-800">{{ formatMoney(report.totals.accepted_amount) }} ₸</div>
        </div>
        <div class="rounded-2xl border border-green-100 bg-green-50 p-5">
          <div class="text-sm font-bold text-green-500">{{ t('adminReports.clients.metrics.paid') }}</div>
          <div class="mt-1 text-3xl font-extrabold text-green-900">{{ formatMoney(report.totals.paid_amount) }} ₸</div>
        </div>
        <div class="rounded-2xl border border-red-100 bg-red-50 p-5">
          <div class="text-sm font-bold text-red-500">{{ t('adminReports.clients.metrics.currentDebt') }}</div>
          <div class="mt-1 text-3xl font-extrabold text-red-800">{{ formatMoney(report.totals.current_debt) }} ₸</div>
          <div class="mt-1 text-sm font-bold text-red-700">{{ t('adminReports.clients.metrics.newDebt') }}: {{ formatMoney(report.totals.new_debt_amount) }} ₸</div>
        </div>
        <div class="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div class="text-sm font-bold text-gray-500">{{ t('adminReports.clients.metrics.returns') }}</div>
          <div class="mt-1 text-3xl font-extrabold text-gray-900">{{ formatNumber(report.totals.returned_quantity) }}</div>
          <div class="mt-1 text-sm font-bold text-gray-700">{{ report.totals.returns_count }} / {{ formatMoney(report.totals.returned_amount) }} ₸</div>
        </div>
      </div>

      <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ t('adminReports.clients.loyalty.title') }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ t('adminReports.clients.loyalty.balanceTotal', { amount: formatMoney(report.totals.loyalty_bonus_balance) }) }}</p>
          </div>

          <div v-if="loyaltySettings" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full lg:w-auto">
            <label class="flex h-11 items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-700">
              <input v-model="loyaltySettings.is_enabled" type="checkbox" class="rounded border-gray-300 text-bakery-600 focus:ring-bakery-500" />
              {{ t('adminReports.clients.loyalty.enabled') }}
            </label>
            <input v-model.number="loyaltySettings.bonus_percent" type="number" min="0" max="100" step="0.01" class="h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900" :placeholder="t('adminReports.clients.loyalty.bonusPercent')" />
            <input v-model.number="loyaltySettings.redeem_rate" type="number" min="0.01" step="0.01" class="h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900" :placeholder="t('adminReports.clients.loyalty.redeemRate')" />
            <input v-model.number="loyaltySettings.max_bonus_per_order" type="number" min="0" step="0.01" class="h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900" :placeholder="t('adminReports.clients.loyalty.maxPerOrder')" />
            <button type="button" @click="saveLoyaltySettings" class="h-11 rounded-xl bg-gray-900 px-4 text-sm font-bold text-white transition-colors hover:bg-gray-800">
              {{ loyaltySaving ? t('common.loading') : t('common.save') }}
            </button>
          </div>
        </div>
      </section>

      <section class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.clients.columns.client') }}</th>
                <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.clients.columns.phone') }}</th>
                <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.clients.columns.accepted') }}</th>
                <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.clients.columns.paid') }}</th>
                <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.clients.columns.debt') }}</th>
                <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.clients.columns.returns') }}</th>
                <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.clients.columns.bonuses') }}</th>
                <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.clients.columns.details') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="client in report.clients" :key="client.id" class="align-top hover:bg-gray-50">
                <td class="px-5 py-4 text-sm">
                  <div class="font-bold text-gray-900">{{ client.name }}</div>
                  <div class="mt-1 text-xs text-gray-500">{{ client.type_label || '-' }}</div>
                </td>
                <td class="px-5 py-4 text-sm text-gray-600">{{ client.phone || '-' }}</td>
                <td class="px-5 py-4 text-right text-sm text-gray-700">
                  <div class="font-bold text-gray-900">{{ formatNumber(client.accepted_quantity) }}</div>
                  <div class="text-xs text-gray-500">{{ formatMoney(client.accepted_amount) }} ₸</div>
                </td>
                <td class="px-5 py-4 text-right text-sm font-bold text-green-700">{{ formatMoney(client.paid_amount) }} ₸</td>
                <td class="px-5 py-4 text-right text-sm">
                  <div class="font-bold text-red-700">{{ formatMoney(client.current_debt) }} ₸</div>
                  <div class="text-xs text-gray-500">{{ t('adminReports.clients.metrics.newDebt') }}: {{ formatMoney(client.new_debt_amount) }} ₸</div>
                </td>
                <td class="px-5 py-4 text-right text-sm">
                  <div class="font-bold text-gray-900">{{ formatNumber(client.returned_quantity) }}</div>
                  <div class="text-xs text-gray-500">{{ client.returns_count }} / {{ formatMoney(client.returned_amount) }} ₸</div>
                </td>
                <td class="px-5 py-4 text-right text-sm font-bold text-bakery-700">{{ formatMoney(client.loyalty_bonus_balance) }}</td>
                <td class="px-5 py-4 text-sm">
                  <router-link :to="clientDetailsLink(client.id)" class="inline-flex items-center justify-center rounded-xl bg-bakery-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-bakery-700">
                    {{ t('adminReports.clients.details.open') }}
                  </router-link>
                </td>
              </tr>
              <tr v-if="!report.clients.length">
                <td colspan="8" class="px-5 py-8 text-center text-sm text-gray-500">{{ t('adminReports.clients.empty') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getClientReport } from '../../../../api/reports';
import { getLoyaltySettings, updateLoyaltySettings, type LoyaltySettings } from '../../../../api/clients';
import { useI18n } from '../../../../i18n';
import TailwindDateRangePicker from '../../../../components/ui/TailwindDateRangePicker.vue';
import type { ClientReport } from '../clientReportTypes';

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

const emptyReport = (): ClientReport => ({
  date_from: '',
  date_to: '',
  filters: {},
  filter_options: { drivers: [] },
  totals: {
    clients_count: 0,
    accepted_quantity: 0,
    accepted_amount: 0,
    paid_amount: 0,
    delivery_paid_amount: 0,
    debt_paid_amount: 0,
    new_debt_amount: 0,
    current_debt: 0,
    returned_quantity: 0,
    returned_amount: 0,
    returns_count: 0,
    loyalty_bonus_balance: 0,
  },
  total_debt_market: 0,
  clients: [],
});

const initialDateFrom = queryString(route.query.date_from) || localDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const initialDateTo = queryString(route.query.date_to) || localDate();
const customDateRange = ref<[Date, Date]>([parseLocalDate(initialDateFrom), parseLocalDate(initialDateTo)]);
const selectedDateFrom = ref(initialDateFrom);
const selectedDateTo = ref(initialDateTo);
const nameFilter = ref(queryString(route.query.name));
const phoneFilter = ref(queryString(route.query.phone));
const initialDebtFilter = queryString(route.query.debt_filter);
const debtFilter = ref<'all' | 'with_debt' | 'without_debt'>(
  initialDebtFilter === 'with_debt' || initialDebtFilter === 'without_debt' ? initialDebtFilter : 'all'
);
const typeFilter = ref<string>(queryString(route.query.type) || 'all');
const driverFilter = ref<string>(queryString(route.query.driver_id) || '');
const sortBy = ref<string>(queryString(route.query.sort_by) || 'name');
const sortDir = ref<'asc' | 'desc'>(
  queryString(route.query.sort_dir) === 'desc' ? 'desc' : 'asc'
);
const loading = ref(true);
const report = ref<ClientReport>(emptyReport());
const loyaltySettings = ref<LoyaltySettings | null>(null);
const loyaltySaving = ref(false);

const availableDrivers = computed(() => (report.value as any).filter_options?.drivers || []);

const activeFiltersCount = computed(() => {
  let count = 0;
  if (nameFilter.value) count++;
  if (phoneFilter.value) count++;
  if (debtFilter.value !== 'all') count++;
  if (typeFilter.value !== 'all') count++;
  if (driverFilter.value) count++;
  return count;
});

const toggleSortDir = () => {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  fetchData();
};

const syncQuery = () => {
  router.replace({
    name: 'AdminReports',
    query: {
      tab: 'clients',
      date_from: selectedDateFrom.value,
      date_to: selectedDateTo.value,
      ...(nameFilter.value ? { name: nameFilter.value } : {}),
      ...(phoneFilter.value ? { phone: phoneFilter.value } : {}),
      ...(debtFilter.value !== 'all' ? { debt_filter: debtFilter.value } : {}),
      ...(typeFilter.value !== 'all' ? { type: typeFilter.value } : {}),
      ...(driverFilter.value ? { driver_id: driverFilter.value } : {}),
      ...(sortBy.value !== 'name' ? { sort_by: sortBy.value } : {}),
      ...(sortDir.value !== 'asc' ? { sort_dir: sortDir.value } : {}),
    },
  });
};

const onDateRangeChange = (val: [Date, Date]) => {
  selectedDateFrom.value = localDate(val[0]);
  selectedDateTo.value = localDate(val[1]);
  fetchData();
};

const resetFilters = () => {
  nameFilter.value = '';
  phoneFilter.value = '';
  debtFilter.value = 'all';
  typeFilter.value = 'all';
  driverFilter.value = '';
  sortBy.value = 'name';
  sortDir.value = 'asc';
  fetchData();
};

const fetchData = async () => {
  loading.value = true;
  syncQuery();
  try {
    report.value = await getClientReport({
      date_from: selectedDateFrom.value,
      date_to: selectedDateTo.value,
      name: nameFilter.value,
      phone: phoneFilter.value,
      debt_filter: debtFilter.value,
      type: typeFilter.value as any,
      driver_id: driverFilter.value || undefined,
      sort_by: sortBy.value as any,
      sort_dir: sortDir.value,
    });
  } catch (error) {
    console.error('Failed to fetch client report', error);
    report.value = emptyReport();
  } finally {
    loading.value = false;
  }
};

const loadLoyaltySettings = async () => {
  try {
    loyaltySettings.value = await getLoyaltySettings();
  } catch (error) {
    console.error('Failed to fetch loyalty settings', error);
  }
};

const saveLoyaltySettings = async () => {
  if (!loyaltySettings.value) return;

  loyaltySaving.value = true;
  try {
    loyaltySettings.value = await updateLoyaltySettings(loyaltySettings.value);
  } catch (error) {
    console.error('Failed to save loyalty settings', error);
  } finally {
    loyaltySaving.value = false;
  }
};

const clientDetailsLink = (clientId: number) => ({
  name: 'AdminClientReportDetail',
  params: { clientId },
  query: {
    date_from: selectedDateFrom.value,
    date_to: selectedDateTo.value,
    ...(nameFilter.value ? { name: nameFilter.value } : {}),
    ...(phoneFilter.value ? { phone: phoneFilter.value } : {}),
    ...(debtFilter.value !== 'all' ? { debt_filter: debtFilter.value } : {}),
    ...(typeFilter.value !== 'all' ? { type: typeFilter.value } : {}),
    ...(driverFilter.value ? { driver_id: driverFilter.value } : {}),
  },
});

const formatNumber = (amount: number | string | null | undefined) => Number(amount || 0).toLocaleString('ru-RU');
const formatMoney = (amount: number | string | null | undefined) => Number(amount || 0).toLocaleString('ru-RU');

onMounted(async () => {
  await Promise.all([fetchData(), loadLoyaltySettings()]);
});
</script>
