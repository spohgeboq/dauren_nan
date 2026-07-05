<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p class="text-xs uppercase tracking-wider font-bold text-gray-500">{{ t('clientPortal.payments.currentDebt') }}</p>
        <p class="text-2xl font-extrabold mt-2 text-red-600">{{ money(summary?.current_debt || 0) }} ₸</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p class="text-xs uppercase tracking-wider font-bold text-gray-500">{{ t('clientPortal.payments.availableLimit') }}</p>
        <p class="text-2xl font-extrabold mt-2">{{ money(summary?.available_debt_limit || 0) }} ₸</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p class="text-xs uppercase tracking-wider font-bold text-gray-500">{{ t('clientPortal.payments.totalPaid') }}</p>
        <p class="text-2xl font-extrabold mt-2 text-green-600">{{ money(summary?.total_paid || 0) }} ₸</p>
      </div>
    </section>

    <section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 class="text-xl font-extrabold mb-4">{{ t('clientPortal.payments.title') }}</h2>
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
      <div v-else-if="payments.length === 0" class="text-center py-8 text-gray-400">{{ t('clientPortal.payments.noPayments') }}</div>
      <div v-else class="divide-y divide-gray-100">
        <div v-for="payment in payments" :key="payment.id" class="py-4 flex justify-between gap-3">
          <div>
            <p class="font-bold">{{ t('clientPortal.payments.delivery', { id: payment.delivery_id }) }}</p>
            <p class="text-sm text-gray-500">{{ date(payment.created_at) }} · {{ payment.payment_method }}</p>
          </div>
          <p class="font-extrabold text-green-600">{{ money(payment.amount) }} ₸</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getClientDebtSummary, getClientPayments, type ClientPayment, type DebtSummary } from '../../api/clientPortal'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const loading = ref(true)
const payments = ref<ClientPayment[]>([])
const summary = ref<DebtSummary | null>(null)
const money = (value: number) => new Intl.NumberFormat('ru-KZ').format(value)
const date = (value: string) => value ? new Date(value).toLocaleDateString('ru-RU') : '—'

onMounted(async () => {
  try {
    const [summaryData, paymentData] = await Promise.all([getClientDebtSummary(), getClientPayments()])
    summary.value = summaryData
    payments.value = paymentData
  } finally {
    loading.value = false
  }
})
</script>
