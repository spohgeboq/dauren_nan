<template>
  <div class="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div class="flex items-center gap-3 sm:gap-4 w-full">
          <router-link
            :to="backLink"
            class="flex shrink-0 items-center justify-center gap-2 px-3 sm:px-4 h-10 sm:h-12 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-bakery-500 touch-manipulation group"
            :title="t('adminReports.employees.backToEmployees')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span class="font-bold text-sm hidden sm:inline">{{ t('adminReports.employees.backToEmployees') }}</span>
          </router-link>

          <div class="min-w-0">
            <div class="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 truncate w-full">
              <router-link to="/admin" class="hover:text-bakery-600 transition-colors truncate">Dashboard</router-link>
              <span class="shrink-0">/</span>
              <router-link :to="backLink" class="hover:text-bakery-600 transition-colors truncate">{{ t('adminReports.tabs.employees') }}</router-link>
              <span class="shrink-0">/</span>
              <span class="text-gray-900 font-medium truncate">{{ employeeName }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight truncate">{{ employeeName }}</h1>
            <p class="mt-1 text-sm text-gray-500">{{ t('adminReports.employees.period', { from: dateFrom, to: dateTo }) }}</p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
      </div>

      <div v-else-if="!bakerReport && !driverReport" class="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
        {{ t('adminReports.employees.notFound') }}
      </div>

      <div v-else-if="bakerReport" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-2xl p-5 border border-gray-200">
            <div class="text-sm text-gray-500">{{ t('adminReports.employees.columns.batches') }}</div>
            <div class="text-2xl font-extrabold text-gray-900">{{ bakerReport.closed_batches_count }} / {{ bakerReport.batches_count }}</div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-200">
            <div class="text-sm text-gray-500">{{ t('adminReports.employees.details.planned') }}</div>
            <div class="text-2xl font-extrabold text-gray-900">{{ formatNumber(bakerReport.planned_quantity) }}</div>
          </div>
          <div class="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div class="text-sm font-bold text-blue-500">{{ t('adminReports.employees.columns.produced') }}</div>
            <div class="text-2xl font-extrabold text-blue-900">{{ formatNumber(bakerReport.produced_quantity) }}</div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-200">
            <div class="text-sm text-gray-500">{{ t('adminReports.employees.columns.products') }}</div>
            <div class="text-2xl font-extrabold text-gray-900">{{ bakerReport.products.length }}</div>
          </div>
        </div>

        <section class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 class="font-bold text-gray-900">{{ t('adminReports.employees.details.products') }}</h2>
          </div>
          <div v-if="!bakerReport.products.length" class="p-6 text-sm text-gray-500">{{ t('adminReports.employees.noProducts') }}</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.products') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.produced') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="product in bakerReport.products" :key="product.product_id">
                  <td class="px-5 py-4 text-sm font-bold text-gray-900">{{ product.product_name || t('adminReports.employees.defaultProduct') }}</td>
                  <td class="px-5 py-4 text-right text-sm font-extrabold text-gray-900">{{ formatNumber(product.quantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 class="font-bold text-gray-900">{{ t('adminReports.employees.details.productionBatches') }}</h2>
          </div>
          <div v-if="!bakerReport.batches.length" class="p-6 text-sm text-gray-500">{{ t('adminReports.employees.empty') }}</div>
          <div v-else class="divide-y divide-gray-200">
            <div v-for="batch in bakerReport.batches" :key="batch.id" class="p-5">
              <div class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span class="font-extrabold text-gray-900">#{{ batch.id }}</span>
                <span>{{ batch.date }}</span>
                <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">{{ statusLabel(batch.status) }}</span>
              </div>
              <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><span class="text-gray-500">{{ t('adminReports.employees.details.planned') }}:</span> <span class="font-bold text-gray-900">{{ formatNumber(batch.planned_quantity) }}</span></div>
                <div><span class="text-gray-500">{{ t('adminReports.employees.details.actual') }}:</span> <span class="font-bold text-gray-900">{{ formatNumber(batch.actual_quantity) }}</span></div>
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <span v-for="item in batch.items" :key="item.product_id" class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  {{ item.product_name || t('adminReports.employees.defaultProduct') }}: {{ formatNumber(item.actual_quantity) }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div v-else-if="driverReport" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="bg-white rounded-2xl p-5 border border-gray-200">
            <div class="text-sm text-gray-500">{{ t('adminReports.employees.columns.routes') }}</div>
            <div class="text-2xl font-extrabold text-gray-900">{{ driverReport.routes_count }}</div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-200">
            <div class="text-sm text-gray-500">{{ t('adminReports.employees.columns.deliveries') }}</div>
            <div class="text-2xl font-extrabold text-gray-900">{{ driverReport.delivered_deliveries_count }} / {{ driverReport.deliveries_count }}</div>
          </div>
          <div class="bg-green-50 rounded-2xl p-5 border border-green-100">
            <div class="text-sm font-bold text-green-500">{{ t('adminReports.employees.columns.delivered') }}</div>
            <div class="text-2xl font-extrabold text-green-900">{{ formatNumber(driverReport.delivered_quantity) }}</div>
          </div>
          <div class="bg-red-50 rounded-2xl p-5 border border-red-100">
            <div class="text-sm font-bold text-red-500">{{ t('adminReports.employees.columns.shortage') }}</div>
            <div class="text-2xl font-extrabold text-red-800">{{ formatNumber(driverReport.shortage_quantity) }}</div>
            <div class="mt-1 text-sm font-bold text-red-700">{{ formatMoney(driverReport.shortage_amount) }} ₸</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="bg-white rounded-2xl p-5 border border-gray-200">
            <div class="text-sm text-gray-500">{{ t('adminReports.employees.columns.amount') }}</div>
            <div class="text-xl font-extrabold text-gray-900">{{ formatMoney(driverReport.delivery_amount) }} ₸</div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-200">
            <div class="text-sm text-gray-500">{{ t('adminReports.employees.columns.cash') }}</div>
            <div class="text-xl font-extrabold text-gray-900">{{ formatMoney(driverReport.cash_collected) }} ₸</div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-200">
            <div class="text-sm text-gray-500">{{ t('adminReports.employees.columns.kaspi') }}</div>
            <div class="text-xl font-extrabold text-gray-900">{{ formatMoney(driverReport.kaspi_collected) }} ₸</div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-200">
            <div class="text-sm text-gray-500">{{ t('adminReports.employees.columns.accepted') }}</div>
            <div class="text-xl font-extrabold text-green-700">{{ formatMoney(driverReport.total_collected) }} ₸</div>
          </div>
          <div class="bg-white rounded-2xl p-5 border border-gray-200">
            <div class="text-sm text-gray-500">{{ t('adminReports.employees.columns.debt') }}</div>
            <div class="text-xl font-extrabold text-red-700">{{ formatMoney(driverReport.debt_created) }} ₸</div>
          </div>
        </div>

        <section class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 class="font-bold text-gray-900">{{ t('adminReports.employees.details.products') }}</h2>
          </div>
          <div v-if="!driverReport.products.length" class="p-6 text-sm text-gray-500">{{ t('adminReports.employees.noProducts') }}</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.products') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.received') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.delivered') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.returned') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.remaining') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.shortage') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="product in driverReport.products" :key="product.product_id">
                  <td class="px-5 py-4 text-sm font-bold text-gray-900">{{ product.product_name || t('adminReports.employees.defaultProduct') }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">{{ formatNumber(product.received_quantity) }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">{{ formatNumber(product.delivered_quantity) }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">{{ formatNumber(product.returned_quantity) }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">{{ formatNumber(product.remaining_quantity) }}</td>
                  <td class="px-5 py-4 text-right text-sm font-extrabold text-red-700">
                    {{ formatNumber(product.shortage_quantity) }} / {{ formatMoney(product.shortage_amount) }} ₸
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 class="font-bold text-gray-900">{{ t('adminReports.employees.details.deliveries') }}</h2>
          </div>
          <div v-if="!driverReport.deliveries.length" class="p-6 text-sm text-gray-500">{{ t('adminReports.employees.empty') }}</div>
          <div v-else class="divide-y divide-gray-200">
            <div v-for="delivery in driverReport.deliveries" :key="delivery.id" class="p-5">
              <div class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span class="font-extrabold text-gray-900">#{{ delivery.id }}</span>
                <span>{{ delivery.date }}</span>
                <span>{{ delivery.client_name || t('adminReports.employees.defaultClient') }}</span>
                <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">{{ statusLabel(delivery.status) }}</span>
              </div>
              <div class="mt-3 grid grid-cols-2 lg:grid-cols-6 gap-3 text-sm">
                <div><span class="text-gray-500">{{ t('adminReports.employees.columns.amount') }}:</span> <span class="font-bold">{{ formatMoney(delivery.total_amount) }}</span></div>
                <div><span class="text-gray-500">{{ t('adminReports.employees.columns.cash') }}:</span> <span class="font-bold">{{ formatMoney(delivery.cash_collected) }}</span></div>
                <div><span class="text-gray-500">{{ t('adminReports.employees.columns.kaspi') }}:</span> <span class="font-bold">{{ formatMoney(delivery.kaspi_collected) }}</span></div>
                <div><span class="text-gray-500">{{ t('adminReports.employees.columns.accepted') }}:</span> <span class="font-bold text-green-700">{{ formatMoney(delivery.total_collected) }}</span></div>
                <div><span class="text-gray-500">{{ t('adminReports.employees.columns.debt') }}:</span> <span class="font-bold text-red-700">{{ formatMoney(delivery.debt_created) }}</span></div>
                <div><span class="text-gray-500">{{ t('adminReports.employees.columns.returned') }}:</span> <span class="font-bold">{{ formatNumber(delivery.returned_quantity) }}</span></div>
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <span v-for="item in delivery.products" :key="item.product_id" class="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                  {{ item.product_name || t('adminReports.employees.defaultProduct') }}: {{ formatNumber(item.quantity) }}
                </span>
                <span v-for="(item, returnIndex) in delivery.returns" :key="`return-${item.product_id}-${returnIndex}`" class="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                  {{ t('adminReports.employees.details.returnedProduct', { product: item.product_name || t('adminReports.employees.defaultProduct'), quantity: formatNumber(item.quantity) }) }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getEmployeeReport } from '../../../api/reports';
import { useI18n } from '../../../i18n';
import type { BakerReport, DriverReport, EmployeeReport, EmployeeRole } from './employeeReportTypes';

const { t } = useI18n();
const route = useRoute();

const localDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const queryString = (value: unknown) => typeof value === 'string' ? value : '';

const emptyReport = (): EmployeeReport => ({
  date_from: '',
  date_to: '',
  totals: {
    bakers_count: 0,
    drivers_count: 0,
    production_batches: 0,
    produced_quantity: 0,
    routes_count: 0,
    deliveries_count: 0,
    delivered_quantity: 0,
    returned_quantity: 0,
    delivery_amount: 0,
    cash_collected: 0,
    kaspi_collected: 0,
    other_collected: 0,
    total_collected: 0,
    debt_created: 0,
    shortage_quantity: 0,
    shortage_amount: 0,
  },
  bakers: [],
  drivers: [],
  filter_options: {
    employees: [],
  },
});

const dateFrom = ref(queryString(route.query.date_from) || localDate());
const dateTo = ref(queryString(route.query.date_to) || dateFrom.value);
const backRole = queryString(route.query.role);
const backEmployeeId = queryString(route.query.employee_id);
const loading = ref(true);
const report = ref<EmployeeReport>(emptyReport());

const employeeId = computed(() => Number(route.params.employeeId));
const employeeRole = computed<EmployeeRole | null>(() => {
  return route.params.role === 'baker' || route.params.role === 'driver'
    ? route.params.role
    : null;
});

const bakerReport = computed<BakerReport | null>(() => {
  if (employeeRole.value !== 'baker') {
    return null;
  }

  return report.value.bakers.find((baker) => baker.employee_id === employeeId.value) || null;
});

const driverReport = computed<DriverReport | null>(() => {
  if (employeeRole.value !== 'driver') {
    return null;
  }

  return report.value.drivers.find((driver) => driver.employee_id === employeeId.value) || null;
});

const employeeName = computed(() => {
  return bakerReport.value?.employee_name
    || driverReport.value?.employee_name
    || t('adminReports.employees.notFound');
});

const backLink = computed(() => ({
  name: 'AdminReports',
  query: {
    tab: 'employees',
    date_from: dateFrom.value,
    date_to: dateTo.value,
    ...(backRole === 'baker' || backRole === 'driver' ? { role: backRole } : {}),
    ...(backEmployeeId ? { employee_id: backEmployeeId } : {}),
  },
}));

const fetchData = async () => {
  loading.value = true;
  try {
    report.value = await getEmployeeReport(dateFrom.value, dateTo.value, {
      role: employeeRole.value || 'all',
      employee_id: employeeId.value,
    });
  } catch (error) {
    console.error('Failed to fetch employee detail report', error);
    report.value = emptyReport();
  } finally {
    loading.value = false;
  }
};

const formatNumber = (amount: number | string | null | undefined) => {
  return Number(amount || 0).toLocaleString('ru-RU');
};

const formatMoney = (amount: number | string | null | undefined) => {
  return Number(amount || 0).toLocaleString('ru-RU');
};

const statusLabel = (status: string) => {
  const key = `adminReports.employees.status.${status}`;
  const label = t(key);

  return label === key ? status : label;
};

onMounted(() => {
  fetchData();
});
</script>
