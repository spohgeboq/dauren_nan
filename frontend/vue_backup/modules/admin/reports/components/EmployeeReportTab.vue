<template>
  <div>
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ t('adminReports.employees.title') }}</h2>
        <p class="mt-1 text-sm text-gray-500">{{ t('adminReports.employees.period', { from: report.date_from || selectedDateFrom, to: report.date_to || selectedDateTo }) }}</p>
      </div>

      <div class="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
        <TailwindDateRangePicker v-model="customDateRange" :align-right="true" @update:model-value="onDateRangeChange" />
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
    </div>

    <div v-else class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-[220px_minmax(240px,1fr)_auto] gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <select
          v-model="selectedRole"
          @change="onRoleChange"
          class="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-900 outline-none transition-colors focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100"
        >
          <option value="all">{{ t('adminReports.employees.filters.allRoles') }}</option>
          <option value="baker">{{ t('adminReports.employees.filters.bakers') }}</option>
          <option value="driver">{{ t('adminReports.employees.filters.drivers') }}</option>
        </select>

        <select
          v-model="selectedEmployeeId"
          @change="fetchData"
          class="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-900 outline-none transition-colors focus:border-bakery-500 focus:ring-2 focus:ring-bakery-100"
        >
          <option value="">{{ t('adminReports.employees.filters.allEmployees') }}</option>
          <option v-for="employee in employeeOptions" :key="`${employee.role}-${employee.id}`" :value="String(employee.id)">
            {{ employee.name }} · {{ roleLabel(employee.role) }}
          </option>
        </select>

        <button
          type="button"
          @click="resetFilters"
          class="h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
        >
          {{ t('adminReports.employees.filters.reset') }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div class="text-blue-500 text-sm font-bold mb-1">{{ t('adminReports.employees.metrics.produced') }}</div>
          <div class="text-3xl font-extrabold text-blue-900">{{ formatNumber(report.totals.produced_quantity) }}</div>
        </div>

        <div class="bg-green-50 rounded-2xl p-5 border border-green-100">
          <div class="text-green-500 text-sm font-bold mb-1">{{ t('adminReports.employees.metrics.delivered') }}</div>
          <div class="text-3xl font-extrabold text-green-900">{{ formatNumber(report.totals.delivered_quantity) }}</div>
        </div>

        <div class="bg-gray-50 rounded-2xl p-5 border border-gray-200">
          <div class="text-gray-500 text-sm font-bold mb-1">{{ t('adminReports.employees.metrics.returned') }}</div>
          <div class="text-3xl font-extrabold text-gray-900">{{ formatNumber(report.totals.returned_quantity) }}</div>
        </div>

        <div class="bg-red-50 rounded-2xl p-5 border border-red-100">
          <div class="text-red-500 text-sm font-bold mb-1">{{ t('adminReports.employees.metrics.shortage') }}</div>
          <div class="text-3xl font-extrabold text-red-800">{{ formatNumber(report.totals.shortage_quantity) }}</div>
          <div class="mt-1 text-sm font-bold text-red-700">{{ formatMoney(report.totals.shortage_amount) }} ₸</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-2xl p-5 border border-gray-200">
          <div class="text-sm text-gray-500">{{ t('adminReports.employees.metrics.deliveryAmount') }}</div>
          <div class="text-xl font-extrabold text-gray-900">{{ formatMoney(report.totals.delivery_amount) }} ₸</div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-200">
          <div class="text-sm text-gray-500">{{ t('adminReports.employees.metrics.cash') }}</div>
          <div class="text-xl font-extrabold text-gray-900">{{ formatMoney(report.totals.cash_collected) }} ₸</div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-200">
          <div class="text-sm text-gray-500">{{ t('adminReports.employees.metrics.kaspi') }}</div>
          <div class="text-xl font-extrabold text-gray-900">{{ formatMoney(report.totals.kaspi_collected) }} ₸</div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-200">
          <div class="text-sm text-gray-500">{{ t('adminReports.employees.metrics.accepted') }}</div>
          <div class="text-xl font-extrabold text-green-700">{{ formatMoney(report.totals.total_collected) }} ₸</div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-200">
          <div class="text-sm text-gray-500">{{ t('adminReports.employees.metrics.debt') }}</div>
          <div class="text-xl font-extrabold text-red-700">{{ formatMoney(report.totals.debt_created) }} ₸</div>
        </div>
      </div>

      <section>
        <div class="flex items-center justify-between gap-4 mb-4">
          <h3 class="text-lg font-bold text-gray-900">{{ t('adminReports.employees.bakers.title') }}</h3>
          <span class="text-sm font-semibold text-gray-500">{{ t('adminReports.employees.bakers.count', { count: report.totals.bakers_count }) }}</span>
        </div>

        <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div v-if="!report.bakers.length" class="p-6 text-center text-sm text-gray-500">
            {{ t('adminReports.employees.empty') }}
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.employee') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.batches') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.produced') }}</th>
                  <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.products') }}</th>
                  <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.details') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="baker in report.bakers" :key="baker.employee_id" class="align-top">
                  <td class="px-5 py-4 text-sm font-bold text-gray-900">{{ baker.employee_name }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">
                    {{ baker.closed_batches_count }} / {{ baker.batches_count }}
                  </td>
                  <td class="px-5 py-4 text-right text-sm font-extrabold text-gray-900">{{ formatNumber(baker.produced_quantity) }}</td>
                  <td class="px-5 py-4 text-sm text-gray-700 min-w-[240px]">
                    <div v-if="baker.products.length" class="flex flex-wrap gap-2">
                      <span v-for="product in baker.products" :key="product.product_id" class="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {{ product.product_name || t('adminReports.employees.defaultProduct') }}: {{ formatNumber(product.quantity) }}
                      </span>
                    </div>
                    <span v-else class="text-gray-400">{{ t('adminReports.employees.noProducts') }}</span>
                  </td>
                  <td class="px-5 py-4 text-sm text-gray-700">
                    <router-link
                      :to="employeeDetailsLink('baker', baker.employee_id)"
                      class="inline-flex items-center justify-center rounded-xl bg-bakery-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-bakery-700"
                    >
                      {{ t('adminReports.employees.details.open') }}
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between gap-4 mb-4">
          <h3 class="text-lg font-bold text-gray-900">{{ t('adminReports.employees.drivers.title') }}</h3>
          <span class="text-sm font-semibold text-gray-500">{{ t('adminReports.employees.drivers.count', { count: report.totals.drivers_count }) }}</span>
        </div>

        <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div v-if="!report.drivers.length" class="p-6 text-center text-sm text-gray-500">
            {{ t('adminReports.employees.empty') }}
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.employee') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.routes') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.deliveries') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.received') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.delivered') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.returned') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.amount') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.cash') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.kaspi') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.accepted') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.debt') }}</th>
                  <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.shortage') }}</th>
                  <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.employees.columns.details') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="driver in report.drivers" :key="driver.employee_id" class="align-top">
                  <td class="px-5 py-4 text-sm font-bold text-gray-900">{{ driver.employee_name }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">{{ driver.routes_count }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">{{ driver.delivered_deliveries_count }} / {{ driver.deliveries_count }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">{{ formatNumber(driver.received_quantity) }}</td>
                  <td class="px-5 py-4 text-right text-sm font-bold text-gray-900">{{ formatNumber(driver.delivered_quantity) }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">{{ formatNumber(driver.returned_quantity) }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">{{ formatMoney(driver.delivery_amount) }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">{{ formatMoney(driver.cash_collected) }}</td>
                  <td class="px-5 py-4 text-right text-sm text-gray-700">{{ formatMoney(driver.kaspi_collected) }}</td>
                  <td class="px-5 py-4 text-right text-sm font-bold text-green-700">{{ formatMoney(driver.total_collected) }}</td>
                  <td class="px-5 py-4 text-right text-sm font-bold text-red-700">{{ formatMoney(driver.debt_created) }}</td>
                  <td class="px-5 py-4 text-right text-sm font-extrabold text-red-700">
                    {{ formatNumber(driver.shortage_quantity) }} / {{ formatMoney(driver.shortage_amount) }}
                  </td>
                  <td class="px-5 py-4 text-sm text-gray-700">
                    <router-link
                      :to="employeeDetailsLink('driver', driver.employee_id)"
                      class="inline-flex items-center justify-center rounded-xl bg-bakery-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-bakery-700"
                    >
                      {{ t('adminReports.employees.details.open') }}
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getEmployeeReport } from '../../../../api/reports';
import { useI18n } from '../../../../i18n';
import TailwindDateRangePicker from '../../../../components/ui/TailwindDateRangePicker.vue';
import type { EmployeeReport, EmployeeRole } from '../employeeReportTypes';

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

const initialDateFrom = queryString(route.query.date_from) || localDate();
const initialDateTo = queryString(route.query.date_to) || initialDateFrom;
const initialRole = queryString(route.query.role);
const customDateRange = ref<[Date, Date]>([parseLocalDate(initialDateFrom), parseLocalDate(initialDateTo)]);
const selectedDateFrom = ref(initialDateFrom);
const selectedDateTo = ref(initialDateTo);
const selectedRole = ref<EmployeeRole | 'all'>(initialRole === 'baker' || initialRole === 'driver' ? initialRole : 'all');
const selectedEmployeeId = ref(queryString(route.query.employee_id));
const loading = ref(true);
const report = ref<EmployeeReport>(emptyReport());

const employeeOptions = computed(() => {
  const employees = report.value.filter_options?.employees || [];

  if (selectedRole.value === 'all') {
    return employees;
  }

  return employees.filter((employee) => employee.role === selectedRole.value);
});

const onDateRangeChange = (val: [Date, Date]) => {
  selectedDateFrom.value = localDate(val[0]);
  selectedDateTo.value = localDate(val[1]);
  fetchData();
};

const onRoleChange = () => {
  selectedEmployeeId.value = '';
  fetchData();
};

const resetFilters = () => {
  selectedRole.value = 'all';
  selectedEmployeeId.value = '';
  fetchData();
};

const syncQuery = () => {
  router.replace({
    name: 'AdminReports',
    query: {
      tab: 'employees',
      date_from: selectedDateFrom.value,
      date_to: selectedDateTo.value,
      ...(selectedRole.value !== 'all' ? { role: selectedRole.value } : {}),
      ...(selectedEmployeeId.value ? { employee_id: selectedEmployeeId.value } : {}),
    },
  });
};

const fetchData = async () => {
  loading.value = true;
  syncQuery();
  try {
    report.value = await getEmployeeReport(selectedDateFrom.value, selectedDateTo.value, {
      role: selectedRole.value,
      employee_id: selectedEmployeeId.value,
    });
  } catch (error) {
    console.error('Failed to fetch employee report', error);
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

const roleLabel = (role: EmployeeRole) => {
  return role === 'baker'
    ? t('adminReports.employees.filters.baker')
    : t('adminReports.employees.filters.driver');
};

const employeeDetailsLink = (role: EmployeeRole, employeeId: number) => {
  return {
    name: 'AdminEmployeeReportDetail',
    params: {
      role,
      employeeId,
    },
    query: {
      date_from: selectedDateFrom.value,
      date_to: selectedDateTo.value,
      ...(selectedRole.value !== 'all' ? { role: selectedRole.value } : {}),
      ...(selectedEmployeeId.value ? { employee_id: selectedEmployeeId.value } : {}),
    },
  };
};

onMounted(() => {
  fetchData();
});
</script>
