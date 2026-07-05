<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ t('adminReports.inventory.title') }}</h2>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
    </div>

    <div v-else>
      <form class="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" @submit.prevent="submitWriteOff">
        <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ t('adminReports.inventory.writeOff.title') }}</h3>
            <p class="text-sm text-gray-500">{{ t('adminReports.inventory.writeOff.description') }}</p>
          </div>
          <button
            type="submit"
            class="inline-flex min-h-11 items-center justify-center rounded-xl bg-bakery-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-bakery-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="writeOffLoading || !writeOffForm.product_id"
          >
            {{ writeOffLoading ? t('adminReports.inventory.writeOff.loading') : t('adminReports.inventory.writeOff.button') }}
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-5">
          <label class="md:col-span-2">
            <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.inventory.writeOff.product') }}</span>
            <select v-model="writeOffForm.product_id" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500">
              <option value="">{{ t('adminReports.inventory.writeOff.selectProduct') }}</option>
              <option v-for="product in productOptions" :key="product.id" :value="product.id">
                {{ product.name }} · {{ t('adminReports.inventory.writeOff.stock') }} {{ product.quantity }} {{ t('adminReports.inventory.products.pieces') }}
              </option>
            </select>
          </label>

          <label>
            <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.inventory.writeOff.quantity') }}</span>
            <input v-model="writeOffForm.quantity" type="number" inputmode="decimal" min="0.01" step="0.01" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500" />
          </label>

          <label>
            <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.inventory.writeOff.reason') }}</span>
            <select v-model="writeOffForm.reason" class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500">
              <option value="stale">{{ t('adminReports.inventory.writeOff.reasons.stale') }}</option>
              <option value="damaged">{{ t('adminReports.inventory.writeOff.reasons.damaged') }}</option>
              <option value="shortage">{{ t('adminReports.inventory.writeOff.reasons.shortage') }}</option>
              <option value="other">{{ t('adminReports.inventory.writeOff.reasons.other') }}</option>
            </select>
          </label>

          <label>
            <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminReports.inventory.writeOff.date') }}</span>
            <TailwindDatePicker v-model="writeOffForm.date" class="w-full" />
          </label>
        </div>

        <input
          v-model="writeOffForm.comment"
          type="text"
          class="mt-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500"
          :placeholder="t('adminReports.inventory.writeOff.commentPlaceholder')"
        />

        <p v-if="writeOffMessage" class="mt-3 text-sm font-semibold" :class="writeOffError ? 'text-red-700' : 'text-green-700'">
          {{ writeOffMessage }}
        </p>
      </form>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Готовая продукция -->
      <div>
        <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">{{ t('adminReports.inventory.products.title') }}</h3>
        <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.inventory.products.columns.product') }}</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.inventory.products.columns.stock') }}</th>
                <th scope="col" class="px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in sortedProducts" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="font-bold">{{ item.product?.name }}</div>
                  <div class="text-xs text-gray-500 mt-0.5">{{ formatDate(item.date) }}</div>
                  <div class="mt-1">
                    <span v-if="item.freshnessStatus === 'expired'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      {{ t('adminReports.inventory.freshness.expired') }}
                    </span>
                    <span v-else-if="item.freshnessStatus === 'expiring_today'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      {{ t('adminReports.inventory.freshness.expiringToday') }}
                    </span>
                    <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {{ t('adminReports.inventory.freshness.fresh') }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{{ item.quantity }} {{ t('adminReports.inventory.products.pieces') }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    v-if="item.freshnessStatus !== 'fresh'"
                    @click="fillWriteOff(item)"
                    class="text-red-600 hover:text-red-900 font-medium text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                  >
                    {{ t('adminReports.inventory.writeOff.button') }}
                  </button>
                </td>
              </tr>
              <tr v-if="!sortedProducts.length">
                <td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">{{ t('adminReports.inventory.products.empty') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Сырье -->
      <div>
        <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">{{ t('adminReports.inventory.rawMaterials.title') }}</h3>
        <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.inventory.rawMaterials.columns.material') }}</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminReports.inventory.rawMaterials.columns.stock') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in report.raw_materials" :key="item.raw_material_id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ item.raw_material?.name }}
                  <span v-if="Number(item.quantity) <= Number(item.raw_material?.minimum_stock || 0)" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    {{ t('adminReports.inventory.rawMaterials.low') }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <p class="text-lg font-black" :class="Number(item.quantity || 0) < Number(item.raw_material?.minimum_stock) ? 'text-red-600' : 'text-emerald-600'">
                    {{ item.quantity || 0 }} <span class="text-sm font-medium">{{ item.raw_material?.unit?.short_name }}</span>
                  </p>
                  <p class="text-sm font-bold text-gray-600 mt-0.5" v-if="item.raw_material?.qty_per_purchase_unit">
                    = {{ Math.round(((item.quantity || 0) / item.raw_material?.qty_per_purchase_unit) * 100) / 100 }} <span class="font-normal">{{ item.raw_material?.purchase_unit?.short_name }}</span>
                  </p>
                  <div class="mt-2 pt-2 border-t border-gray-100">
                    <p class="text-xs text-gray-500">
                      {{ t('adminRawMaterials.minStock', { qty: Number(item.raw_material?.minimum_stock || 0).toString(), unit: item.raw_material?.unit?.short_name || '' }) }}
                      <span v-if="item.raw_material?.qty_per_purchase_unit">
                        (= {{ Math.round(((item.raw_material?.minimum_stock || 0) / item.raw_material.qty_per_purchase_unit) * 100) / 100 }} {{ item.raw_material.purchase_unit?.short_name }})
                      </span>
                    </p>
                    <div v-if="item.raw_material?.active_purchases?.length" class="mt-1.5 flex flex-col items-end gap-1">
                      <div v-for="(purchase, i) in item.raw_material.active_purchases" :key="i" class="inline-flex items-center gap-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        В закупке: {{ purchase.quantity }} {{ item.raw_material?.purchase_unit?.short_name }} 
                        <span class="opacity-75">({{ t('adminPurchases.statuses.' + purchase.status) }})</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="!report.raw_materials?.length">
                <td colspan="2" class="px-6 py-4 text-center text-sm text-gray-500">{{ t('adminReports.inventory.rawMaterials.empty') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { createProductWriteOff, getInventoryReport } from '../../../../api/reports';
import { useI18n } from '../../../../i18n';
import TailwindDatePicker from '../../../../components/ui/TailwindDatePicker.vue';

const { t } = useI18n();
const loading = ref(true);
const report = ref<any>({
  products: [],
  raw_materials: [],
  alerts: {
    low_stock_raw_materials: []
  }
});
const writeOffLoading = ref(false);
const writeOffMessage = ref('');
const writeOffError = ref(false);

const localDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const writeOffForm = ref({
  product_id: '',
  quantity: '',
  reason: 'stale',
  date: localDate(),
  comment: '',
});

const productOptions = computed(() => {
  const byProduct = new Map<number, { id: number; name: string; quantity: number }>();

  for (const stock of report.value.products || []) {
    const productId = Number(stock.product_id);
    const existing = byProduct.get(productId);
    const quantity = Number(stock.quantity || 0);

    if (existing) {
      existing.quantity += quantity;
    } else {
      byProduct.set(productId, {
        id: productId,
        name: stock.product?.name || t('adminReports.inventory.writeOff.product'),
        quantity,
      });
    }
  }

  return Array.from(byProduct.values()).sort((a, b) => a.name.localeCompare(b.name));
});

const fetchData = async () => {
  loading.value = true;
  try {
    const data = await getInventoryReport();
    if (data) {
      report.value = data;
    }
  } catch (error) {
    console.error("Failed to fetch data", error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
};

const sortedProducts = computed(() => {
  if (!report.value.products) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [...report.value.products].map((item: any) => {
    const stockDate = new Date(item.date);
    stockDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - stockDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const freshnessDays = item.product?.freshness_days || 1;
    
    let status = 'fresh';
    if (diffDays >= freshnessDays) {
      status = 'expired';
    } else if (diffDays === freshnessDays - 1) {
      status = 'expiring_today';
    }

    return {
      ...item,
      freshnessStatus: status,
    };
  }).sort((a, b) => {
    // Sort by status (expired first, then expiring, then fresh)
    const statusOrder: Record<string, number> = { expired: 0, expiring_today: 1, fresh: 2 };
    if (statusOrder[a.freshnessStatus] !== statusOrder[b.freshnessStatus]) {
      return statusOrder[a.freshnessStatus] - statusOrder[b.freshnessStatus];
    }
    // Then sort by date oldest first
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    // Finally by name
    return (a.product?.name || '').localeCompare(b.product?.name || '');
  });
});

const fillWriteOff = (item: any) => {
  writeOffForm.value.product_id = item.product_id.toString();
  writeOffForm.value.quantity = item.quantity.toString();
  writeOffForm.value.reason = 'stale';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const submitWriteOff = async () => {
  writeOffLoading.value = true;
  writeOffMessage.value = '';
  writeOffError.value = false;

  try {
    await createProductWriteOff({
      product_id: Number(writeOffForm.value.product_id),
      quantity: Number(writeOffForm.value.quantity),
      reason: writeOffForm.value.reason,
      date: writeOffForm.value.date,
      comment: writeOffForm.value.comment || undefined,
    });
    writeOffMessage.value = t('adminReports.inventory.writeOff.success');
    writeOffForm.value.quantity = '';
    writeOffForm.value.comment = '';
    await fetchData();
  } catch (error: any) {
    writeOffError.value = true;
    writeOffMessage.value = error.response?.data?.message || t('adminReports.inventory.writeOff.error');
  } finally {
    writeOffLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Unused function removed to pass typecheck
</script>
