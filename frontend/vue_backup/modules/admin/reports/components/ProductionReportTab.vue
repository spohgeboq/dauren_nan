<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ t('adminReports.production.title') }}</h2>
      
      <div class="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
        <TailwindDateRangePicker v-model="customDateRange" :align-right="true" @update:model-value="onDateRangeChange" />
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
    </div>

    <div v-else>
      <div class="mb-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="font-bold text-gray-900">{{ t('adminReports.production.produced.title') }}</h3>
        </div>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.production.produced.columns.product') }}</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.production.produced.columns.quantity') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in report.products_produced" :key="item.product_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.product?.name || t('adminReports.production.produced.deleted') }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-600">{{ item.total_produced }} {{ t('adminReports.production.produced.pieces') }}</td>
            </tr>
            <tr v-if="!report.products_produced?.length">
              <td colspan="2" class="px-6 py-4 text-center text-sm text-gray-500">{{ t('adminReports.production.produced.empty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="font-bold text-gray-900">{{ t('adminReports.production.consumed.title') }}</h3>
        </div>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.production.consumed.columns.material') }}</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.production.consumed.columns.quantity') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in report.raw_materials_consumed" :key="item.raw_material_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.raw_material?.name || t('adminReports.production.consumed.deleted') }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-sm font-bold text-red-600">- {{ item.total_consumed }} {{ item.raw_material?.unit?.short_name || '' }}</div>
                <div v-if="formatPurchaseQuantity(item)" class="text-xs text-gray-500 font-normal mt-1">{{ formatPurchaseQuantity(item) }}</div>
              </td>
            </tr>
            <tr v-if="!report.raw_materials_consumed?.length">
              <td colspan="2" class="px-6 py-4 text-center text-sm text-gray-500">{{ t('adminReports.production.consumed.empty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getProductionReport } from '../../../../api/reports';
import { useI18n } from '../../../../i18n';
import TailwindDateRangePicker from '../../../../components/ui/TailwindDateRangePicker.vue';

const { t } = useI18n();
const dateFrom = ref(new Date().toISOString().slice(0, 10));
const dateTo = ref(new Date().toISOString().slice(0, 10));

const customDateRange = ref<[Date, Date]>([new Date(), new Date()]);

const onDateRangeChange = (val: [Date, Date]) => {
  if (val && val.length === 2) {
    const tzOffset = val[0].getTimezoneOffset() * 60000;
    dateFrom.value = new Date(val[0].getTime() - tzOffset).toISOString().slice(0, 10);
    dateTo.value = new Date(val[1].getTime() - tzOffset).toISOString().slice(0, 10);
    fetchData();
  }
};

const loading = ref(true);
const report = ref<any>({
  products_produced: [],
  raw_materials_consumed: []
});

const fetchData = async () => {
  loading.value = true;
  try {
    const data = await getProductionReport(dateFrom.value, dateTo.value);
    if (data) {
      report.value = data;
    }
  } catch (error) {
    console.error("Failed to fetch data", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const formatPurchaseQuantity = (item: any) => {
  const rm = item.raw_material;
  if (!rm || !rm.qty_per_purchase_unit || rm.qty_per_purchase_unit <= 0) return '';
  
  const purchaseQty = Number(item.total_consumed) / Number(rm.qty_per_purchase_unit);
  const purchaseUnitName = rm.purchase_unit?.short_name || '';
  
  if (!purchaseQty || !purchaseUnitName) return '';
  
  const formattedQty = Number.isInteger(purchaseQty) ? purchaseQty : purchaseQty.toFixed(2);
  
  return `(~ ${formattedQty} ${purchaseUnitName})`;
};
</script>
