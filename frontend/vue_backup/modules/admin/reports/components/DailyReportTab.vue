<template>
  <div>
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ t('adminReports.daily.title') }}</h2>
      
      <div class="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
        <TailwindDateRangePicker v-model="customDateRange" :align-right="true" @update:model-value="onDateRangeChange" />
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <!-- Metrics Cards -->
        <div class="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <div class="text-blue-500 text-sm font-bold mb-1">{{ t('adminReports.daily.metrics.baked') }}</div>
          <div class="text-3xl font-extrabold text-blue-900">{{ report.production_total_units || 0 }}</div>
        </div>
        
        <div class="bg-green-50 rounded-2xl p-6 border border-green-100">
          <div class="text-green-500 text-sm font-bold mb-1">{{ t('adminReports.daily.metrics.retail') }}</div>
          <div class="text-3xl font-extrabold text-green-900">{{ Number(report.retail_sales_total || 0).toLocaleString('ru-RU') }}</div>
        </div>
        
        <div class="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
          <div class="text-indigo-500 text-sm font-bold mb-1">{{ t('adminReports.daily.metrics.deliveries') }}</div>
          <div class="text-3xl font-extrabold text-indigo-900">{{ Number(report.deliveries_total || 0).toLocaleString('ru-RU') }}</div>
        </div>
        
        <div class="bg-red-50 rounded-2xl p-6 border border-red-100">
          <div class="text-red-500 text-sm font-bold mb-1">{{ t('adminReports.daily.metrics.expenses') }}</div>
          <div class="text-3xl font-extrabold text-red-900">{{ Number(report.expenses_total || 0).toLocaleString('ru-RU') }}</div>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 class="text-lg font-bold text-gray-900 mb-4">{{ t('adminReports.daily.productControl.title') }}</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-500">{{ t('adminReports.daily.productControl.baked') }}</span>
              <span class="font-bold text-gray-900">{{ formatNumber(report.control_formulas?.product?.baked || report.production_total_units) }} шт</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-500">{{ t('adminReports.daily.productControl.retailSold') }}</span>
              <span class="font-bold text-gray-900">{{ formatNumber(report.control_formulas?.product?.retail_sold || 0) }} шт</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-500">{{ t('adminReports.daily.productControl.delivered') }}</span>
              <span class="font-bold text-gray-900">{{ formatNumber(report.control_formulas?.product?.delivered || 0) }} шт</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-500">{{ t('adminReports.daily.productControl.returned') }}</span>
              <span class="font-bold text-gray-900">{{ formatNumber(report.control_formulas?.product?.returned || 0) }} шт</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-500">{{ t('adminReports.daily.productControl.stock') }}</span>
              <span class="font-bold text-gray-900">{{ formatNumber(report.control_formulas?.product?.stock || 0) }} шт</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-500">{{ t('adminReports.daily.productControl.writeOff') }}</span>
              <span class="font-bold text-gray-900">{{ formatNumber(report.control_formulas?.product?.write_off || 0) }} шт</span>
            </div>
            <div class="flex justify-between pt-2">
              <span class="text-gray-900 font-bold">{{ t('adminReports.daily.productControl.shortage') }}</span>
              <span class="font-extrabold text-red-700 text-lg">{{ formatNumber(report.control_formulas?.product?.shortage || 0) }} шт</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 class="text-lg font-bold text-gray-900 mb-4">{{ t('adminReports.daily.moneyControl.title') }}</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-500">{{ t('adminReports.daily.moneyControl.cash') }}</span>
              <span class="font-bold text-gray-900">{{ formatMoney(report.payments_collected?.cash || 0) }} ₸</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-500">{{ t('adminReports.daily.moneyControl.kaspi') }}</span>
              <span class="font-bold text-gray-900">{{ formatMoney(report.payments_collected?.kaspi || 0) }} ₸</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-500">{{ t('adminReports.daily.moneyControl.debt') }}</span>
              <span class="font-bold text-red-600">{{ formatMoney(report.payments_collected?.debt || report.estimated_new_debt || 0) }} ₸</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-500">{{ t('adminReports.daily.moneyControl.shortage') }}</span>
              <span class="font-bold text-red-700">{{ formatMoney(report.payments_collected?.shortage || 0) }} ₸</span>
            </div>
            <div class="flex justify-between pt-2">
              <span class="text-gray-900 font-bold">{{ t('adminReports.daily.moneyControl.total') }}</span>
              <span class="font-extrabold text-green-600 text-lg">{{ formatMoney(report.payments_collected?.total || 0) }} ₸</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDailySummary } from '../../../../api/reports';
import { useI18n } from '../../../../i18n';
import TailwindDateRangePicker from '../../../../components/ui/TailwindDateRangePicker.vue';

const { t } = useI18n();

const localDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const customDateRange = ref<[Date, Date]>([new Date(), new Date()]);
const selectedDateFrom = ref(localDate());
const selectedDateTo = ref(localDate());

const onDateRangeChange = (val: [Date, Date]) => {
  selectedDateFrom.value = localDate(val[0]);
  selectedDateTo.value = localDate(val[1]);
  fetchData();
};

const loading = ref(true);
const report = ref<any>({
  production_total_units: 0,
  retail_sold_units: 0,
  delivered_units: 0,
  returned_units: 0,
  stock_units: 0,
  written_off_units: 0,
  product_shortage_units: 0,
  retail_sales_total: 0,
  deliveries_total: 0,
  expenses_total: 0,
  payments_collected: {
    cash: 0,
    kaspi: 0,
    total: 0
  },
  estimated_new_debt: 0
});

const fetchData = async () => {
  loading.value = true;
  try {
    const data = await getDailySummary(selectedDateFrom.value, selectedDateTo.value);
    if (data) {
      report.value = data;
    }
  } catch (error) {
    console.error("Failed to fetch data", error);
  } finally {
    loading.value = false;
  }
};

const formatMoney = (amount: number) => {
  return Number(amount || 0).toLocaleString('ru-RU');
};

const formatNumber = (amount: number) => {
  return Number(amount || 0).toLocaleString('ru-RU');
};

onMounted(() => {
  fetchData();
});
</script>
