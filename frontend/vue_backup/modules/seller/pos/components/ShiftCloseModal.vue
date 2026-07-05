<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-bakery-900/35 p-4 backdrop-blur-sm">
    <div class="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div class="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50/70 px-6 py-5">
        <div>
          <p class="text-sm font-extrabold uppercase tracking-wider text-bakery-700">{{ t('pos.closeModal.titleSmall') }}</p>
          <h2 class="mt-1 text-2xl font-extrabold text-gray-900">{{ t('pos.closeModal.title') }}</h2>
          <p class="mt-1 text-sm font-medium text-gray-500">{{ t('pos.closeModal.shiftDate', { date: shiftDateLabel }) }}</p>
        </div>
        <button
          type="button"
          class="rounded-full p-2 text-gray-400 transition-colors hover:bg-bakery-50 hover:text-bakery-700 focus:outline-none focus:ring-2 focus:ring-bakery-500"
          :aria-label="t('pos.closeModal.closeWindow')"
          @click="$emit('close')"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="loading" class="flex min-h-96 items-center justify-center">
          <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-bakery-600"></div>
        </div>

        <div v-else class="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('pos.closeModal.shiftStart') }}</p>
                <p class="mt-1 text-2xl font-extrabold text-gray-900">{{ formatMoney(Number(currentShift.opening_cash || 0)) }} ₸</p>
              </div>
              <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('pos.closeModal.sales') }}</p>
                <p class="mt-1 text-2xl font-extrabold text-gray-900">{{ formatMoney(totalAmount) }} ₸</p>
              </div>
              <div class="rounded-2xl border border-bakery-100 bg-bakery-50 p-4">
                <p class="text-xs font-bold uppercase tracking-wider text-bakery-600">{{ t('pos.closeModal.expectedCash') }}</p>
                <p class="mt-1 text-2xl font-extrabold text-bakery-900">{{ formatMoney(expectedCashDrawer) }} ₸</p>
              </div>
              <div class="rounded-2xl border border-bakery-100 bg-bakery-50 p-4">
                <p class="text-xs font-bold uppercase tracking-wider text-bakery-600">{{ t('pos.closeModal.expectedKaspi') }}</p>
                <p class="mt-1 text-2xl font-extrabold text-bakery-900">{{ formatMoney(kaspiAmount) }} ₸</p>
              </div>
            </div>

            <form class="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm" @submit.prevent="closeShift">
              <div class="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 class="text-lg font-extrabold text-gray-900">{{ t('pos.closeModal.actualAmounts') }}</h3>
                  <p class="text-sm font-medium text-gray-500">{{ t('pos.closeModal.actualHint') }}</p>
                </div>
                <button
                  type="button"
                  class="min-h-11 rounded-xl border border-bakery-200 bg-bakery-50 px-3 text-sm font-extrabold text-bakery-700 transition hover:bg-bakery-100"
                  @click="fillExpectedAmounts"
                >
                  {{ t('pos.closeModal.fillExpected') }}
                </button>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <label>
                  <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('pos.payments.cash') }}</span>
                  <input
                    v-model="shiftForm.actual_cash"
                    type="text"
                    inputmode="none"
                    readonly
                    class="w-full rounded-2xl border bg-white px-4 py-4 text-right text-2xl font-extrabold text-gray-900 shadow-sm focus:outline-none"
                    :class="activeShiftField === 'actual_cash' ? 'border-bakery-500 ring-2 ring-bakery-200' : 'border-gray-300'"
                    placeholder="0"
                    @click="setShiftField('actual_cash')"
                  />
                </label>
                <label>
                  <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Kaspi</span>
                  <input
                    v-model="shiftForm.actual_kaspi"
                    type="text"
                    inputmode="none"
                    readonly
                    class="w-full rounded-2xl border bg-white px-4 py-4 text-right text-2xl font-extrabold text-gray-900 shadow-sm focus:outline-none"
                    :class="activeShiftField === 'actual_kaspi' ? 'border-bakery-500 ring-2 ring-bakery-200' : 'border-gray-300'"
                    placeholder="0"
                    @click="setShiftField('actual_kaspi')"
                  />
                </label>
              </div>

              <div class="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                <div class="mb-2 flex items-center justify-between">
                  <p class="text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('pos.closeModal.input', { field: activeShiftFieldLabel }) }}</p>
                  <button
                    type="button"
                    class="rounded-lg bg-white px-2.5 py-1.5 text-xs font-extrabold text-bakery-700 shadow-sm hover:bg-bakery-50"
                    @click="fillActiveExpectedAmount"
                  >
                    {{ t('pos.closeModal.expected') }}
                  </button>
                </div>
                <AmountKeypad v-model="activeShiftAmount" :disabled="submitting" />
              </div>

              <p v-if="error" class="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {{ error }}
              </p>

              <button
                type="submit"
                class="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl bg-bakery-600 px-5 py-3 text-lg font-extrabold text-white shadow-lg shadow-bakery-600/20 transition hover:bg-bakery-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="submitting"
              >
                {{ submitting ? t('pos.closeModal.closing') : t('pos.closeShift') }}
              </button>
            </form>
          </section>

          <aside class="rounded-3xl border border-gray-100 bg-gray-50 p-4">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-gray-500">{{ t('pos.closeModal.summary') }}</h3>
            <div class="mt-4 space-y-3 text-sm font-bold text-gray-700">
              <div class="flex justify-between gap-3">
                <span>{{ t('pos.closeModal.receiptCount') }}</span>
                <span>{{ sales.length }}</span>
              </div>
              <div class="flex justify-between gap-3">
                <span>{{ t('pos.closeModal.cashSales') }}</span>
                <span>{{ formatMoney(cashAmount) }} ₸</span>
              </div>
              <div class="flex justify-between gap-3">
                <span>{{ t('pos.closeModal.kaspiSales') }}</span>
                <span>{{ formatMoney(kaspiAmount) }} ₸</span>
              </div>
              <div class="border-t border-gray-200 pt-3">
                <div class="flex justify-between gap-3">
                  <span>{{ t('pos.closeModal.cashDrawer') }}</span>
                  <span class="text-bakery-800">{{ formatMoney(expectedCashDrawer) }} ₸</span>
                </div>
              </div>
            </div>

            <p class="mt-5 rounded-2xl border border-bakery-100 bg-white p-3 text-sm font-medium leading-5 text-gray-600">
              {{ t('pos.closeModal.explanation') }}
            </p>

            <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-3">
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('pos.closeModal.productCheck') }}</h4>
              <div v-if="productSummary.length === 0" class="mt-3 text-sm font-bold text-gray-400">
                {{ t('pos.closeModal.noProductsIssued') }}
              </div>
              <div v-else class="mt-3 space-y-2">
                <div
                  v-for="row in productSummary"
                  :key="row.productId"
                  class="rounded-xl bg-gray-50 p-2 text-xs"
                >
                  <div class="mb-1 font-extrabold text-gray-900">{{ row.name }}</div>
                  <div class="font-bold text-gray-500">
                    <div>
                      <span class="block">{{ t('pos.closeModal.sold') }}</span>
                      <span class="text-gray-900">{{ formatQuantity(row.sold) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { X } from 'lucide-vue-next';
import api from '../../../../api';
import { closeCurrentSellerShift, type SellerShift } from '../../../../api/sellerShifts';
import type { RetailSale } from '../store';
import AmountKeypad from './AmountKeypad.vue';
import { useI18n } from '../../../../i18n';

const props = defineProps<{
  currentShift: SellerShift;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'closed', shift: SellerShift): void;
}>();

const { locale, t } = useI18n();
const sales = ref<RetailSale[]>([]);
const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const activeShiftField = ref<'actual_cash' | 'actual_kaspi'>('actual_cash');
const shiftForm = ref({
  actual_cash: '',
  actual_kaspi: '',
});

const totalAmount = computed(() => {
  return sales.value.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
});

const cashAmount = computed(() => {
  return sales.value.reduce((sum, sale) => {
    return sum + (sale.payments || []).reduce((paymentSum, payment) => {
      if (payment.payment_method === 'cash') {
        return paymentSum + Number(payment.amount);
      }

      if (payment.payment_method === 'mixed') {
        return paymentSum + (payment.details || [])
          .filter(detail => detail.method === 'cash')
          .reduce((detailSum, detail) => detailSum + Number(detail.amount), 0);
      }

      return paymentSum;
    }, 0);
  }, 0);
});

const kaspiAmount = computed(() => {
  return sales.value.reduce((sum, sale) => {
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

const expectedCashDrawer = computed(() => {
  return Number(props.currentShift.opening_cash || 0) + cashAmount.value;
});

const soldByProduct = computed(() => {
  const sold = new Map<number, { name: string; quantity: number }>();

  sales.value.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const current = sold.get(item.product_id) || {
        name: item.product?.name || t('pos.closeModal.product'),
        quantity: 0,
      };
      current.quantity += Number(item.quantity || 0);
      sold.set(item.product_id, current);
    });
  });

  return sold;
});

const productSummary = computed(() => {
  const productIds = new Set<number>(Array.from(soldByProduct.value.keys()));

  return Array.from(productIds).map((productId) => {
    const sold = soldByProduct.value.get(productId);
    const soldQuantity = sold?.quantity || 0;

    return {
      productId,
      name: sold?.name || t('pos.closeModal.product'),
      sold: soldQuantity,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, locale.value === 'kz' ? 'kk' : 'ru'));
});

const activeShiftAmount = computed({
  get: () => shiftForm.value[activeShiftField.value],
  set: (value: string) => {
    shiftForm.value[activeShiftField.value] = value;
  },
});

const activeShiftFieldLabel = computed(() => {
  return activeShiftField.value === 'actual_cash' ? t('pos.payments.cash') : t('pos.payments.kaspi');
});

const shiftDateForApi = computed(() => {
  const value = props.currentShift.date;
  if (!value.includes('T')) {
    return value.slice(0, 10);
  }

  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
});

const shiftDateLabel = computed(() => {
  const [year, month, day] = shiftDateForApi.value.split('-');
  return `${day}.${month}.${year}`;
});

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-KZ').format(amount || 0);
};

const formatQuantity = (amount: number) => {
  return new Intl.NumberFormat('ru-KZ', {
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const setShiftField = (field: 'actual_cash' | 'actual_kaspi') => {
  activeShiftField.value = field;
};

const fillExpectedAmounts = () => {
  shiftForm.value.actual_cash = String(Math.round(expectedCashDrawer.value));
  shiftForm.value.actual_kaspi = String(Math.round(kaspiAmount.value));
};

const fillActiveExpectedAmount = () => {
  if (activeShiftField.value === 'actual_cash') {
    shiftForm.value.actual_cash = String(Math.round(expectedCashDrawer.value));
    return;
  }

  shiftForm.value.actual_kaspi = String(Math.round(kaspiAmount.value));
};

const loadSales = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/retail-sales', {
      params: {
        date: shiftDateForApi.value,
        seller_shift_id: props.currentShift.id,
      },
    });
    sales.value = response.data.data || [];
    fillExpectedAmounts();
  } catch (requestError: any) {
    sales.value = [];
    error.value = requestError.response?.data?.message || t('pos.closeModal.loadError');
  } finally {
    loading.value = false;
  }
};

const closeShift = async () => {
  submitting.value = true;
  error.value = '';

  try {
    const shift = await closeCurrentSellerShift({
      date: shiftDateForApi.value,
      actual_cash: Number(shiftForm.value.actual_cash || 0),
      actual_kaspi: Number(shiftForm.value.actual_kaspi || 0),
    });
    emit('closed', shift);
  } catch (requestError: any) {
    error.value = requestError.response?.data?.message || t('pos.closeModal.closeError');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadSales();
});
</script>
