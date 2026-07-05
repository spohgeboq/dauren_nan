<template>
  <div class="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div class="flex items-center gap-3 sm:gap-4 w-full">
          <router-link
            :to="backLink"
            class="flex shrink-0 items-center justify-center gap-2 px-3 sm:px-4 h-10 sm:h-12 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-bakery-500 touch-manipulation group"
            :title="t('adminReports.clients.details.back')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span class="font-bold text-sm hidden sm:inline">{{ t('adminReports.clients.details.back') }}</span>
          </router-link>

          <div class="min-w-0">
            <div class="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 truncate w-full">
              <router-link to="/admin" class="hover:text-bakery-600 transition-colors truncate">Dashboard</router-link>
              <span class="shrink-0">/</span>
              <router-link :to="backLink" class="hover:text-bakery-600 transition-colors truncate">{{ t('adminReports.tabs.clients') }}</router-link>
              <span class="shrink-0">/</span>
              <span class="text-gray-900 font-medium truncate">{{ client?.name || t('adminReports.clients.details.notFound') }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight truncate">{{ client?.name || t('adminReports.clients.details.notFound') }}</h1>
            <p class="mt-1 text-sm text-gray-500">{{ t('adminReports.clients.period', { from: dateFrom, to: dateTo }) }}</p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
      </div>

      <div v-else-if="!client" class="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
        {{ t('adminReports.clients.details.notFound') }}
      </div>

      <div v-else class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div class="text-sm font-bold text-blue-500">{{ t('adminReports.clients.metrics.accepted') }}</div>
            <div class="mt-1 text-2xl font-extrabold text-blue-900">{{ formatNumber(client.accepted_quantity) }}</div>
            <div class="mt-1 text-sm font-bold text-blue-800">{{ formatMoney(client.accepted_amount) }} ₸</div>
          </div>
          <div class="rounded-2xl border border-green-100 bg-green-50 p-5">
            <div class="text-sm font-bold text-green-500">{{ t('adminReports.clients.metrics.paid') }}</div>
            <div class="mt-1 text-2xl font-extrabold text-green-900">{{ formatMoney(client.paid_amount) }} ₸</div>
          </div>
          <div class="rounded-2xl border border-red-100 bg-red-50 p-5">
            <div class="text-sm font-bold text-red-500">{{ t('adminReports.clients.metrics.currentDebt') }}</div>
            <div class="mt-1 text-2xl font-extrabold text-red-800">{{ formatMoney(client.current_debt) }} ₸</div>
            <div class="mt-1 text-sm font-bold text-red-700">{{ t('adminReports.clients.metrics.newDebt') }}: {{ formatMoney(client.new_debt_amount) }} ₸</div>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div class="text-sm font-bold text-gray-500">{{ t('adminReports.clients.metrics.returns') }}</div>
            <div class="mt-1 text-2xl font-extrabold text-gray-900">{{ formatNumber(client.returned_quantity) }}</div>
            <div class="mt-1 text-sm font-bold text-gray-700">{{ client.returns_count }} / {{ formatMoney(client.returned_amount) }} ₸</div>
          </div>
        </div>

        <section class="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
          <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 class="font-bold text-gray-900 mb-4">{{ t('adminReports.clients.details.clientInfo') }}</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span class="text-gray-500">{{ t('adminReports.clients.columns.phone') }}:</span> <span class="font-bold text-gray-900">{{ client.phone || '-' }}</span></div>
              <div><span class="text-gray-500">{{ t('adminReports.clients.details.driver') }}:</span> <span class="font-bold text-gray-900">{{ client.assigned_driver_name || '-' }}</span></div>
              <div><span class="text-gray-500">{{ t('adminReports.clients.details.address') }}:</span> <span class="font-bold text-gray-900">{{ client.address || '-' }}</span></div>
              <div><span class="text-gray-500">{{ t('adminReports.clients.details.debtLimit') }}:</span> <span class="font-bold text-gray-900">{{ formatMoney(client.debt_limit) }} ₸</span></div>
            </div>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div class="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 class="font-bold text-gray-900">{{ t('adminReports.clients.loyalty.title') }}</h2>
                <p class="mt-1 text-2xl font-extrabold text-bakery-700">{{ formatMoney(client.loyalty_bonus_balance) }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select v-model="bonusForm.type" class="h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900">
                <option value="manual_credit">{{ t('adminReports.clients.loyalty.credit') }}</option>
                <option value="manual_debit">{{ t('adminReports.clients.loyalty.debit') }}</option>
                <option value="adjustment">{{ t('adminReports.clients.loyalty.adjustment') }}</option>
              </select>
              <input v-model.number="bonusForm.amount" type="number" step="0.01" class="h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900" :placeholder="t('adminReports.clients.loyalty.amount')" />
              <input v-model.trim="bonusForm.comment" type="text" class="sm:col-span-2 h-11 rounded-xl border border-gray-200 px-3 text-sm font-bold text-gray-900" :placeholder="t('adminReports.clients.loyalty.comment')" />
              <button type="button" @click="submitBonus" class="sm:col-span-2 h-11 rounded-xl bg-bakery-600 px-4 text-sm font-bold text-white transition-colors hover:bg-bakery-700">
                {{ bonusSaving ? t('common.loading') : t('adminReports.clients.loyalty.submit') }}
              </button>
            </div>
          </div>
        </section>

        <section class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 class="font-bold text-gray-900">{{ t('adminReports.clients.details.deliveries') }}</h2>
          </div>
          <div v-if="!client.deliveries.length" class="p-6 text-sm text-gray-500">{{ t('adminReports.clients.empty') }}</div>
          <div v-else class="divide-y divide-gray-200">
            <div v-for="delivery in client.deliveries" :key="delivery.id" class="p-5">
              <div class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span class="font-extrabold text-gray-900">#{{ delivery.id }}</span>
                <span>{{ delivery.date }}</span>
                <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">{{ statusLabel(delivery.status) }}</span>
              </div>
              <div class="mt-3 grid grid-cols-2 lg:grid-cols-6 gap-3 text-sm">
                <div><span class="text-gray-500">{{ t('adminReports.clients.columns.accepted') }}:</span> <span class="font-bold">{{ formatNumber(delivery.accepted_quantity) }}</span></div>
                <div><span class="text-gray-500">{{ t('adminReports.clients.columns.amount') }}:</span> <span class="font-bold">{{ formatMoney(delivery.accepted_amount) }}</span></div>
                <div><span class="text-gray-500">{{ t('adminReports.clients.columns.paid') }}:</span> <span class="font-bold text-green-700">{{ formatMoney(delivery.paid_amount) }}</span></div>
                <div><span class="text-gray-500">{{ t('adminReports.clients.columns.debt') }}:</span> <span class="font-bold text-red-700">{{ formatMoney(delivery.debt_created) }}</span></div>
                <div><span class="text-gray-500">{{ t('adminReports.clients.columns.returns') }}:</span> <span class="font-bold">{{ formatNumber(delivery.returned_quantity) }}</span></div>
                <div><span class="text-gray-500">{{ t('adminReports.clients.columns.returnAmount') }}:</span> <span class="font-bold">{{ formatMoney(delivery.returned_amount) }}</span></div>
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <span v-for="item in delivery.items" :key="item.product_id" class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  {{ item.product_name || t('adminReports.clients.details.product') }}: {{ formatNumber(item.quantity) }}
                </span>
                <span v-for="(item, idx) in delivery.returns" :key="`${item.product_id}-${idx}`" class="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                  {{ t('adminReports.clients.details.returnedProduct', { product: item.product_name || t('adminReports.clients.details.product'), quantity: formatNumber(item.quantity) }) }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h2 class="font-bold text-gray-900">{{ t('adminReports.clients.details.debtPayments') }}</h2>
            </div>
            <div v-if="!client.direct_payments.length" class="p-6 text-sm text-gray-500">{{ t('adminReports.clients.empty') }}</div>
            <div v-else class="divide-y divide-gray-200">
              <div v-for="payment in client.direct_payments" :key="payment.id" class="p-4 flex items-center justify-between gap-4">
                <div>
                  <div class="font-bold text-gray-900">{{ paymentLabel(payment.payment_method) }}</div>
                  <div class="text-xs text-gray-500">{{ formatDateTime(payment.created_at) }}</div>
                </div>
                <div class="font-extrabold text-green-700">{{ formatMoney(payment.amount) }} ₸</div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h2 class="font-bold text-gray-900">{{ t('adminReports.clients.loyalty.history') }}</h2>
            </div>
            <div v-if="!client.loyalty_transactions.length" class="p-6 text-sm text-gray-500">{{ t('adminReports.clients.empty') }}</div>
            <div v-else class="divide-y divide-gray-200">
              <div v-for="transaction in client.loyalty_transactions" :key="transaction.id" class="p-4 flex items-center justify-between gap-4">
                <div>
                  <div class="font-bold text-gray-900">{{ loyaltyTypeLabel(transaction.type) }}</div>
                  <div class="text-xs text-gray-500">{{ formatDateTime(transaction.created_at) }} · {{ transaction.creator_name || '-' }}</div>
                  <div v-if="transaction.comment" class="mt-1 text-xs text-gray-500">{{ transaction.comment }}</div>
                </div>
                <div :class="transaction.amount >= 0 ? 'text-green-700' : 'text-red-700'" class="font-extrabold">
                  {{ transaction.amount >= 0 ? '+' : '' }}{{ formatMoney(transaction.amount) }}
                </div>
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
import { getClientReport } from '../../../api/reports';
import { addClientLoyaltyBonus } from '../../../api/clients';
import { useI18n } from '../../../i18n';
import type { ClientReport, ClientReportRow } from './clientReportTypes';

const { t } = useI18n();
const route = useRoute();

const localDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const queryString = (value: unknown) => typeof value === 'string' ? value : '';

const emptyReport = (): ClientReport => ({
  date_from: '',
  date_to: '',
  filters: {},
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

const dateFrom = ref(queryString(route.query.date_from) || localDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
const dateTo = ref(queryString(route.query.date_to) || localDate());
const loading = ref(true);
const report = ref<ClientReport>(emptyReport());
const bonusSaving = ref(false);
const bonusForm = ref({
  type: 'manual_credit' as 'manual_credit' | 'manual_debit' | 'adjustment',
  amount: 0,
  comment: '',
});

const clientId = computed(() => Number(route.params.clientId));
const client = computed<ClientReportRow | null>(() => report.value.clients[0] || null);
const backLink = computed(() => ({
  name: 'AdminReports',
  query: {
    tab: 'clients',
    date_from: dateFrom.value,
    date_to: dateTo.value,
    ...(queryString(route.query.name) ? { name: queryString(route.query.name) } : {}),
    ...(queryString(route.query.phone) ? { phone: queryString(route.query.phone) } : {}),
    ...(queryString(route.query.debt_filter) ? { debt_filter: queryString(route.query.debt_filter) } : {}),
  },
}));

const fetchData = async () => {
  loading.value = true;
  try {
    report.value = await getClientReport({
      client_id: clientId.value,
      date_from: dateFrom.value,
      date_to: dateTo.value,
    });
  } catch (error) {
    console.error('Failed to fetch client detail report', error);
    report.value = emptyReport();
  } finally {
    loading.value = false;
  }
};

const submitBonus = async () => {
  if (!bonusForm.value.amount) {
    return;
  }

  bonusSaving.value = true;
  try {
    await addClientLoyaltyBonus(clientId.value, bonusForm.value);
    bonusForm.value = { type: 'manual_credit', amount: 0, comment: '' };
    await fetchData();
  } catch (error: any) {
    alert(error.response?.data?.message || t('adminReports.clients.loyalty.error'));
  } finally {
    bonusSaving.value = false;
  }
};

const formatNumber = (amount: number | string | null | undefined) => Number(amount || 0).toLocaleString('ru-RU');
const formatMoney = (amount: number | string | null | undefined) => Number(amount || 0).toLocaleString('ru-RU');
const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString('ru-RU') : '-';

const statusLabel = (status: string) => {
  const key = `adminReports.clients.status.${status}`;
  const label = t(key);
  return label === key ? status : label;
};

const paymentLabel = (method: string) => {
  const key = `adminReports.clients.paymentMethods.${method}`;
  const label = t(key);
  return label === key ? method : label;
};

const loyaltyTypeLabel = (type: string) => {
  const key = `adminReports.clients.loyalty.types.${type}`;
  const label = t(key);
  return label === key ? type : label;
};

onMounted(() => {
  fetchData();
});
</script>
