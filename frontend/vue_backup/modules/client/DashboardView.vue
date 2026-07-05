<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-5 font-medium">
      {{ error }}
    </div>

    <template v-else>
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500">{{ t('clientPortal.dashboard.currentDebt') }}</p>
        <div class="flex items-end justify-between gap-4 mt-2">
          <div>
            <p class="text-4xl font-extrabold text-gray-900">{{ money(debt?.current_debt || 0) }} ₸</p>
            <p class="text-sm text-gray-500 mt-1">{{ t('clientPortal.dashboard.limit', { amount: money(debt?.debt_limit || 0) }) }}</p>
          </div>
          <router-link to="/client/orders" class="px-4 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-sm">
            {{ t('clientPortal.dashboard.newOrder') }}
          </router-link>
        </div>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p class="text-xs uppercase tracking-wider text-gray-500 font-bold">{{ t('clientPortal.dashboard.deliveriesCount') }}</p>
          <p class="text-2xl font-extrabold mt-2">{{ debt?.deliveries_count || 0 }}</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p class="text-xs uppercase tracking-wider text-gray-500 font-bold">{{ t('clientPortal.dashboard.totalDelivered') }}</p>
          <p class="text-2xl font-extrabold mt-2">{{ money(debt?.total_delivered || 0) }} ₸</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p class="text-xs uppercase tracking-wider text-gray-500 font-bold">{{ t('clientPortal.dashboard.totalPaid') }}</p>
          <p class="text-2xl font-extrabold mt-2 text-green-600">{{ money(debt?.total_paid || 0) }} ₸</p>
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-extrabold text-lg">{{ t('clientPortal.dashboard.latestDeliveries') }}</h2>
            <router-link to="/client/history" class="text-sm font-bold text-orange-600">{{ t('clientPortal.dashboard.all') }}</router-link>
          </div>
          <div v-if="deliveries.length === 0" class="text-gray-400 py-8 text-center">{{ t('clientPortal.dashboard.noDeliveries') }}</div>
          <div v-else class="divide-y divide-gray-100">
            <div v-for="delivery in deliveries.slice(0, 4)" :key="delivery.id" class="py-3 flex justify-between gap-3">
              <div>
                <p class="font-bold">{{ t('clientPortal.dashboard.delivery', { id: delivery.id }) }}</p>
                <p class="text-xs text-gray-500">{{ date(delivery.created_at) }}</p>
              </div>
              <p class="font-extrabold">{{ money(delivery.total_amount) }} ₸</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-extrabold text-lg">{{ t('clientPortal.dashboard.orders') }}</h2>
            <router-link to="/client/orders" class="text-sm font-bold text-orange-600">{{ t('clientPortal.dashboard.all') }}</router-link>
          </div>
          <div v-if="orders.length === 0" class="text-gray-400 py-8 text-center">{{ t('clientPortal.dashboard.noOrders') }}</div>
          <div v-else class="divide-y divide-gray-100">
            <div v-for="order in orders.slice(0, 4)" :key="order.id" class="py-3 flex justify-between gap-3">
              <div>
                <p class="font-bold">{{ t('clientPortal.dashboard.order', { id: order.id }) }}</p>
                <p class="text-xs text-gray-500">{{ order.requested_delivery_date || date(order.created_at || '') }}</p>
              </div>
              <span class="text-xs font-bold px-2 py-1 rounded-lg h-fit bg-orange-50 text-orange-700">{{ label(order.status) }}</span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  getClientDebtSummary,
  getClientDeliveries,
  getClientOrders,
  type ClientDelivery,
  type ClientOrder,
  type DebtSummary,
} from '../../api/clientPortal'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const loading = ref(true)
const error = ref('')
const debt = ref<DebtSummary | null>(null)
const deliveries = ref<ClientDelivery[]>([])
const orders = ref<ClientOrder[]>([])

const money = (value: number) => new Intl.NumberFormat('ru-KZ').format(value)
const date = (value: string) => value ? new Date(value).toLocaleDateString('ru-RU') : '—'
const label = (status: string) => (t(`clientPortal.orders.status.${status}`) || status)

onMounted(async () => {
  try {
    const [debtData, deliveryData, orderData] = await Promise.all([
      getClientDebtSummary(),
      getClientDeliveries(),
      getClientOrders(),
    ])
    debt.value = debtData
    deliveries.value = deliveryData
    orders.value = orderData
  } catch (e: any) {
    error.value = e.response?.data?.message || t('clientPortal.dashboard.loadError')
  } finally {
    loading.value = false
  }
})
</script>
