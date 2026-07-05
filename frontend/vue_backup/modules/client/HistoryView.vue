<template>
  <div class="max-w-5xl mx-auto space-y-4">
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 class="text-xl font-extrabold">{{ t('clientPortal.history.title') }}</h2>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
    <div v-else-if="deliveries.length === 0" class="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
      {{ t('clientPortal.history.noDeliveries') }}
    </div>
    <div v-else class="space-y-4">
      <div v-for="delivery in deliveries" :key="delivery.id" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div class="flex justify-between gap-3 mb-4">
          <div>
            <p class="font-extrabold">{{ t('clientPortal.history.delivery', { id: delivery.id }) }}</p>
            <p class="text-sm text-gray-500">{{ date(delivery.created_at) }}</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold px-2 py-1 rounded-lg bg-green-50 text-green-700">{{ delivery.status }}</span>
            <p class="font-extrabold mt-2">{{ money(delivery.total_amount) }} ₸</p>
          </div>
        </div>

        <div class="divide-y divide-gray-100">
          <div v-for="item in delivery.items" :key="item.id" class="py-2 flex justify-between text-sm">
            <span class="font-medium">{{ item.product?.name || ('#' + item.product_id) }} × {{ item.quantity }}</span>
            <span>{{ money(item.subtotal) }} ₸</span>
          </div>
        </div>

        <div v-if="delivery.payments?.length" class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">{{ t('clientPortal.history.payments') }}</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="payment in delivery.payments" :key="payment.id" class="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
              {{ payment.payment_method }}: {{ money(payment.amount) }} ₸
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getClientDeliveries, type ClientDelivery } from '../../api/clientPortal'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const loading = ref(true)
const deliveries = ref<ClientDelivery[]>([])
const money = (value: number) => new Intl.NumberFormat('ru-KZ').format(value)
const date = (value: string) => value ? new Date(value).toLocaleDateString('ru-RU') : '—'

onMounted(async () => {
  try {
    deliveries.value = await getClientDeliveries()
  } finally {
    loading.value = false
  }
})
</script>
