<template>
  <div class="min-h-screen bg-gray-50 p-4 font-sans sm:p-6 lg:p-8">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-4">
          <router-link to="/dashboard" class="group flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 text-gray-700 shadow-sm transition-colors hover:bg-gray-100 active:bg-gray-200 sm:px-4">
            <ArrowLeft class="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span class="hidden text-sm font-bold sm:inline">{{ t('common.backToMenu') }}</span>
          </router-link>
          <div>
            <div class="mb-2 flex items-center gap-3 text-sm text-gray-500">
              <router-link to="/admin" class="transition-colors hover:text-bakery-600">Dashboard</router-link>
              <span>/</span>
              <span class="font-medium text-gray-900">{{ t('adminOrders.title') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{{ t('adminOrders.title') }}</h1>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button @click="() => fetchOrders(1)" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
            <RefreshCw :class="{'animate-spin': loading}" class="h-5 w-5" />
            <span>{{ t('common.refresh') }}</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 flex flex-wrap gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm items-end">
        <div class="relative z-50">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{{ t('adminOrders.date') }}</label>
          <div class="w-56">
            <TailwindDateRangePicker v-model="customDateRange" @update:model-value="onDateRangeChange" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{{ t('adminOrders.status') }}</label>
          <select 
            v-model="filters.status" 
            class="w-56 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-700 text-sm font-medium shadow-sm transition-all"
            @change="fetchOrders(1)"
          >
            <option value="">{{ t('common.all') }}</option>
            <option value="pending">{{ t('adminOrders.statuses.pending') }}</option>
            <option value="approved">{{ t('adminOrders.statuses.approved') }}</option>
            <option value="delivered">{{ t('adminOrders.statuses.delivered') }}</option>
            <option value="cancelled">{{ t('adminOrders.statuses.cancelled') }}</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading && orders.length === 0" class="flex justify-center py-20">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-bakery-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
          <Inbox class="h-8 w-8" />
        </div>
        <h3 class="mb-1 text-xl font-extrabold text-gray-900">{{ t('adminOrders.empty.title') }}</h3>
        <p class="font-medium text-gray-500">{{ t('adminOrders.empty.description') }}</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminOrders.client') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminOrders.deliveryDate') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminOrders.amount') }}</th>
              <th scope="col" class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminOrders.status') }}</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-for="order in orders" :key="order.id">
              <tr class="hover:bg-gray-50 transition-colors cursor-pointer" @click="toggleOrder(order.id)">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-gray-900">#{{ order.id }}</td>
                <td class="px-6 py-4">
                  <div class="font-semibold text-gray-900">{{ order.client?.name }}</div>
                  <div class="text-xs text-gray-400 mt-0.5">{{ order.client?.phone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                  {{ formatDate(order.requested_delivery_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-bakery-700">
                  {{ formatMoney(order.total_estimated_amount) }} ₸
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="['px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full', statusClass(order.status)]">
                    {{ t(`adminOrders.statuses.${order.status}`) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      v-if="order.status === 'pending'"
                      @click.stop="updateStatus(order.id, 'approved')"
                      class="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
                      :disabled="updating === order.id"
                    >
                      {{ t('adminOrders.actions.approve') }}
                    </button>
                    <button 
                      v-if="order.status === 'pending'"
                      @click.stop="updateStatus(order.id, 'cancelled')"
                      class="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                      :disabled="updating === order.id"
                    >
                      {{ t('adminOrders.actions.reject') }}
                    </button>
                    <ChevronDown :class="['ml-2 h-5 w-5 text-gray-400 transition-transform inline-block', expandedOrderIds.has(order.id) ? 'rotate-180' : '']" />
                  </div>
                </td>
              </tr>
              <!-- Expanded items -->
              <tr v-if="expandedOrderIds.has(order.id)" class="bg-gray-50/50">
                <td colspan="6" class="px-6 py-6 border-b-2 border-gray-100">
                  <div class="max-w-3xl ml-12">
                    <h4 class="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminOrders.items') }}</h4>
                    <div class="grid gap-3">
                      <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                        <span class="font-extrabold text-gray-900">{{ item.product?.name }}</span>
                        <div class="flex gap-8 text-sm font-bold">
                          <span class="text-gray-500">{{ item.quantity }} шт</span>
                          <span class="w-24 text-right text-bakery-700">{{ formatMoney(item.estimated_price * item.quantity) }} ₸</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="order.comment" class="mt-4 rounded-2xl bg-amber-50 p-4 border border-amber-100 shadow-sm">
                      <strong class="text-xs font-extrabold uppercase tracking-wider text-amber-800">{{ t('adminOrders.comment') }}:</strong>
                      <p class="mt-1 text-sm font-medium text-amber-900">{{ order.comment }}</p>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="mt-6 flex items-center justify-between rounded-3xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
        <button 
          @click="changePage(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-extrabold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {{ t('common.prev') }}
        </button>
        <span class="text-sm font-medium text-gray-500">
          {{ t('common.page') }} <span class="font-extrabold text-gray-900">{{ pagination.current_page }}</span> {{ t('common.of') }} <span class="font-extrabold text-gray-900">{{ pagination.last_page }}</span>
        </span>
        <button 
          @click="changePage(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-extrabold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RefreshCw, Inbox, ChevronDown, ArrowLeft } from 'lucide-vue-next';
import api from '../../../api';
import { useI18n } from '../../../i18n';
import TailwindDateRangePicker from '../../../components/ui/TailwindDateRangePicker.vue';

const { t } = useI18n();
const loading = ref(false);
const updating = ref<number | null>(null);
const orders = ref<any[]>([]);
const expandedOrderIds = ref<Set<number>>(new Set());

const localDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const customDateRange = ref<[Date, Date]>([new Date(), new Date()]);
const filters = ref({
  date_from: localDate(),
  date_to: localDate(),
  status: ''
});

const onDateRangeChange = (val: [Date, Date]) => {
  filters.value.date_from = localDate(val[0]);
  filters.value.date_to = localDate(val[1]);
  fetchOrders(1);
};

const pagination = ref({
  current_page: 1,
  last_page: 1,
});

const fetchOrders = async (page = 1) => {
  loading.value = true;
  try {
    const params: any = { page };
    if (filters.value.date_from) params.date_from = filters.value.date_from;
    if (filters.value.date_to) params.date_to = filters.value.date_to;
    if (filters.value.status) params.status = filters.value.status;

    const res = await api.get('/client-orders', { params });
    orders.value = res.data.data;
    pagination.value = res.data.meta;
  } catch (error) {
    console.error('Failed to fetch orders', error);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (id: number, status: string) => {
  updating.value = id;
  try {
    const res = await api.patch(`/client-orders/${id}/status`, { status });
    const index = orders.value.findIndex(o => o.id === id);
    if (index !== -1) {
      orders.value[index] = res.data.data;
    }
  } catch (error) {
    console.error('Failed to update status', error);
  } finally {
    updating.value = null;
  }
};

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchOrders(page);
  }
};

const toggleOrder = (id: number) => {
  const newSet = new Set(expandedOrderIds.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  expandedOrderIds.value = newSet;
};

const formatMoney = (amount: number) => {
  return Number(amount || 0).toLocaleString('ru-RU');
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ru-RU');
};

const statusClass = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'approved': return 'bg-blue-100 text-blue-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

onMounted(() => {
  fetchOrders();
});
</script>
