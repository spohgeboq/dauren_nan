<template>
  <div class="w-96 bg-white border-l border-gray-200 flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
    <div class="p-6 border-b border-gray-100 bg-white">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">{{ t('pos.historyPanel.title') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ t('pos.historyPanel.count', { count: posStore.sales.length }) }}</p>
        </div>
        <button
          class="rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-500 hover:bg-bakery-50 hover:text-bakery-700"
          :title="t('pos.historyPanel.refresh')"
          @click="reload"
        >
          <RefreshCw class="h-5 w-5" :class="{ 'animate-spin': posStore.isSalesLoading }" />
        </button>
      </div>

      <div class="mt-4">
        <TailwindDateRangePicker v-model="customDateRange" :align-right="true" @update:model-value="onDateRangeChange" />
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-gray-50 p-3">
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('pos.historyPanel.total') }}</p>
          <p class="mt-1 text-lg font-extrabold text-gray-900">{{ formatMoney(totalAmount) }} ₸</p>
        </div>
        <div class="rounded-xl bg-gray-50 p-3">
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Kaspi</p>
          <p class="mt-1 text-lg font-extrabold text-bakery-700">{{ formatMoney(kaspiAmount) }} ₸</p>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto bg-gray-50/50 p-4">
      <div v-if="posStore.isSalesLoading" class="flex h-full items-center justify-center">
        <div class="h-10 w-10 animate-spin rounded-full border-b-2 border-bakery-600"></div>
      </div>

      <div v-else-if="posStore.sales.length === 0" class="flex h-full flex-col items-center justify-center text-center text-gray-400">
        <ReceiptText class="mb-4 h-14 w-14 opacity-50" />
        <p class="text-lg font-medium">{{ t('pos.historyPanel.empty') }}</p>
      </div>

      <div v-else class="space-y-3">
        <article
          v-for="sale in posStore.sales"
          :key="sale.id"
          class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <button class="w-full text-left" @click="toggleSale(sale.id)">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-extrabold text-gray-900">{{ t('pos.receiptNumber', { id: sale.id }) }}</p>
                <p class="text-xs text-gray-500">{{ formatDateTime(sale.created_at) }}</p>
              </div>
              <div class="text-right">
                <p class="font-extrabold text-bakery-700">{{ formatMoney(sale.total_amount) }} ₸</p>
                <p class="text-xs font-bold text-gray-500">{{ paymentSummary(sale) }}</p>
              </div>
            </div>
          </button>

          <div v-if="expandedSaleIds.has(sale.id)" class="mt-4 border-t border-gray-100 pt-3">
            <div class="space-y-2">
              <div
                v-for="item in sale.items || []"
                :key="item.id"
                class="flex items-center justify-between gap-3 text-sm"
              >
                <div class="min-w-0">
                  <p class="truncate font-bold text-gray-900">{{ item.product?.name || t('pos.historyPanel.product') }}</p>
                  <p class="text-xs text-gray-500">{{ item.quantity }} x {{ formatMoney(item.price) }} ₸</p>
                </div>
                <p class="shrink-0 font-bold text-gray-900">{{ formatMoney(item.subtotal) }} ₸</p>
              </div>
            </div>

            <div class="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
              <div v-for="payment in sale.payments || []" :key="payment.id">
                <div class="flex justify-between font-bold">
                  <span>{{ paymentLabel(payment.payment_method) }}</span>
                  <span>{{ formatMoney(payment.amount) }} ₸</span>
                </div>
                <div
                  v-for="detail in payment.details || []"
                  :key="`${payment.id}-${detail.method}`"
                  class="mt-1 flex justify-between pl-3"
                >
                  <span>{{ paymentLabel(detail.method) }}</span>
                  <span>{{ formatMoney(detail.amount) }} ₸</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ReceiptText, RefreshCw } from 'lucide-vue-next';
import { usePosStore, type RetailSale } from '../store';
import { useI18n } from '../../../../i18n';
import TailwindDateRangePicker from '../../../../components/ui/TailwindDateRangePicker.vue';

const posStore = usePosStore();
const { locale, t } = useI18n();

const localDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const customDateRange = ref<[Date, Date]>([new Date(), new Date()]);
const selectedDateFrom = ref(localDate());
const selectedDateTo = ref(localDate());
const expandedSaleIds = ref(new Set<number>());

const onDateRangeChange = (val: [Date, Date]) => {
  selectedDateFrom.value = localDate(val[0]);
  selectedDateTo.value = localDate(val[1]);
  reload();
};

const totalAmount = computed(() => {
  return posStore.sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
});

const kaspiAmount = computed(() => {
  return posStore.sales.reduce((sum, sale) => {
    return sum + (sale.payments || []).reduce((paymentSum, payment) => {
      if (payment.payment_method === 'kaspi') {
        return paymentSum + Number(payment.amount);
      }

      if (payment.payment_method === 'mixed') {
        return paymentSum + (payment.details || [])
          .filter(detail => detail.method === 'kaspi')
          .reduce((detailSum, detail) => detailSum + Number(detail.amount), 0);
      }

      return paymentSum;
    }, 0);
  }, 0);
});

const reload = async () => {
  await posStore.fetchSales(selectedDateFrom.value, selectedDateTo.value);
};

const toggleSale = (saleId: number) => {
  const next = new Set(expandedSaleIds.value);
  if (next.has(saleId)) {
    next.delete(saleId);
  } else {
    next.add(saleId);
  }
  expandedSaleIds.value = next;
};

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-KZ').format(amount || 0);
};

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString(locale.value === 'kz' ? 'kk-KZ' : 'ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const paymentLabel = (method: string) => ({
  cash: t('pos.payments.cash'),
  kaspi: t('pos.payments.kaspi'),
  mixed: t('pos.payments.mixed'),
}[method] || method);

const paymentSummary = (sale: RetailSale) => {
  return (sale.payments || []).map(payment => paymentLabel(payment.payment_method)).join(', ') || t('pos.payment');
};

onMounted(() => {
  reload();
});

defineExpose({ reload });
</script>
