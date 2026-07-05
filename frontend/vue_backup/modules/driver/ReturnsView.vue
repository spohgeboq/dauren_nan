<template>
  <div class="space-y-6 max-w-7xl mx-auto px-1 sm:px-4">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
      <div>
        <h2 class="text-xl font-extrabold text-gray-900">{{ t('driver.returns.title') }}</h2>
        <p class="text-xs text-gray-500 mt-0.5">{{ t('driver.returns.subtitle') }}</p>
      </div>
      <button
        @click="fetchReturns"
        class="px-4 py-2.5 rounded-xl bg-bakery-600 hover:bg-bakery-700 text-white font-bold text-sm shadow-sm transition-colors"
      >
        {{ t('driver.returns.refresh') }}
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 rounded-3xl border border-red-100 p-6 text-center">
      <p class="text-red-700 font-bold">{{ error }}</p>
      <router-link to="/driver/route" class="inline-flex mt-4 px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold text-sm">
        {{ t('driver.returns.back') }}
      </router-link>
    </div>

    <div v-else-if="deliveries.length === 0" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mb-4">
        <svg class="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path></svg>
      </div>
      <p class="text-lg font-bold text-gray-900">{{ t('driver.returns.empty.title') }}</p>
      <p class="text-sm text-gray-500 mt-1">{{ t('driver.returns.empty.subtitle') }}</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="delivery in deliveries"
        :key="delivery.id"
        class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 class="font-extrabold text-gray-900">{{ delivery.client?.name || t('driver.returns.client') }}</h3>
            <p class="text-sm text-gray-500">{{ delivery.client?.address || t('driver.returns.noAddress') }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              {{ t('driver.returns.delivery', { id: delivery.id }) }}
            </span>
            <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
              {{ Number(delivery.total_amount || 0).toLocaleString('ru-RU') }} ₸
            </span>
          </div>
        </div>

        <div class="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{{ t('driver.returns.deliveredItems') }}</h4>
            <div class="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
              <div
                v-for="item in delivery.items || []"
                :key="item.id"
                class="p-3 flex justify-between items-center bg-white"
              >
                <div>
                  <p class="font-bold text-gray-900 text-sm">{{ item.product?.name || t('driver.returns.product') }}</p>
                  <p class="text-xs text-gray-500">{{ t('driver.returns.returned', { returned: returnedQuantity(delivery, item.product_id), total: item.quantity }) }}</p>
                </div>
                <span class="font-extrabold text-bakery-600">{{ remainingQuantity(delivery, item) }} {{ t('driver.returns.pieces') }}</span>
              </div>
            </div>
          </div>

          <form class="space-y-3" @submit.prevent="submitReturn(delivery)">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('driver.returns.createReturn') }}</h4>
            <select
              v-model="formFor(delivery).product_id"
              class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-sm p-2.5 border bg-white text-gray-900"
            >
              <option value="">{{ t('driver.returns.selectProduct') }}</option>
              <option
                v-for="item in returnableItems(delivery)"
                :key="item.product_id"
                :value="item.product_id"
              >
                {{ item.product?.name }} — {{ t('driver.returns.available', { quantity: remainingQuantity(delivery, item) }) }}
              </option>
            </select>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                v-model.number="formFor(delivery).quantity"
                type="number"
                min="0.01"
                step="0.01"
                :placeholder="t('driver.returns.quantity')"
                class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-sm p-2.5 border bg-white text-gray-900"
              />
              <select
                v-model="formFor(delivery).reason"
                class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-sm p-2.5 border bg-white text-gray-900"
              >
                <option value="stale">{{ t('driver.returns.reasons.stale') }}</option>
                <option value="damaged">{{ t('driver.returns.reasons.damaged') }}</option>
                <option value="other">{{ t('driver.returns.reasons.other') }}</option>
              </select>
            </div>

            <button
              type="submit"
              :disabled="formFor(delivery).submitting || returnableItems(delivery).length === 0"
              class="w-full px-4 py-3 rounded-xl bg-bakery-600 hover:bg-bakery-700 disabled:opacity-50 disabled:hover:bg-bakery-600 text-white font-bold text-sm shadow-sm transition-colors"
            >
              <span v-if="formFor(delivery).submitting">{{ t('driver.returns.submitting') }}</span>
              <span v-else>{{ t('driver.returns.submit') }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../../api'
import { useI18n } from '../../i18n'

const { t } = useI18n()

interface ReturnForm {
  product_id: number | '';
  quantity: number | null;
  reason: 'stale' | 'damaged' | 'other';
  submitting: boolean;
}

const loading = ref(true)
const error = ref('')
const currentRoute = ref<any>(null)
const deliveries = ref<any[]>([])
const forms = ref<Record<number, ReturnForm>>({})

const today = () => {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

const formFor = (delivery: any) => {
  if (!forms.value[delivery.id]) {
    forms.value[delivery.id] = {
      product_id: '',
      quantity: null,
      reason: 'stale',
      submitting: false,
    }
  }

  return forms.value[delivery.id]
}

const returnedQuantity = (delivery: any, productId: number) => {
  return (delivery.returns || [])
    .filter((item: any) => Number(item.product_id) === Number(productId))
    .reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0)
}

const remainingQuantity = (delivery: any, item: any) => {
  return Math.max(0, Number(item.quantity || 0) - returnedQuantity(delivery, item.product_id))
}

const returnableItems = (delivery: any) => {
  return (delivery.items || []).filter((item: any) => remainingQuantity(delivery, item) > 0)
}

const fetchReturns = async () => {
  loading.value = true
  error.value = ''

  try {
    const routesRes = await api.get('/driver-routes', {
      params: { date: today() },
    })
    const routes = routesRes.data.data.data || routesRes.data.data || []
    const activeRoute = routes.find((route: any) => route.status === 'active')

    if (!activeRoute) {
      currentRoute.value = null
      deliveries.value = []
      error.value = t('driver.returns.alerts.noRoute')
      loading.value = false
      return
    }

    const routeRes = await api.get(`/driver-routes/${activeRoute.id}`)
    currentRoute.value = routeRes.data.data
    deliveries.value = (currentRoute.value.deliveries || []).filter((delivery: any) => delivery.status === 'delivered')
  } catch (err) {
    console.error(err)
    error.value = t('driver.returns.alerts.loadError')
  } finally {
    loading.value = false
  }
}

const submitReturn = async (delivery: any) => {
  const form = formFor(delivery)
  if (!form.product_id || !form.quantity || form.quantity <= 0) {
    alert(t('driver.returns.alerts.invalidInput'))
    return
  }

  const deliveryItem = (delivery.items || []).find((i: any) => Number(i.product_id) === Number(form.product_id))
  const remaining = deliveryItem ? remainingQuantity(delivery, deliveryItem) : 0

  if (form.quantity > remaining) {
    alert(t('driver.returns.alerts.exceedsLimit'))
    return
  }

  form.submitting = true
  try {
    await api.post(`/deliveries/${delivery.id}/returns`, {
      product_id: form.product_id,
      quantity: form.quantity,
      reason: form.reason,
    })

    forms.value[delivery.id] = {
      product_id: '',
      quantity: null,
      reason: 'stale',
      submitting: false,
    }
    await fetchReturns()
  } catch (err: any) {
    console.error(err)
    alert(err.response?.data?.message || t('driver.returns.alerts.submitError'))
  } finally {
    form.submitting = false
  }
}

onMounted(() => {
  fetchReturns()
})
</script>
