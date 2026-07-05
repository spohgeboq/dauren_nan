<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 class="text-xl font-extrabold">{{ t('clientPortal.orders.title') }}</h2>
          <p class="text-sm text-gray-500">{{ t('clientPortal.orders.subtitle') }}</p>
        </div>
        <button @click="repeatLast" :disabled="saving" class="px-4 py-3 rounded-xl bg-gray-900 text-white font-bold disabled:opacity-50">
          {{ t('clientPortal.orders.repeatLast') }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">{{ t('clientPortal.orders.deliveryDate') }}</label>
          <input v-model="requestedDate" type="date" class="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900" />
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">{{ t('clientPortal.orders.comment') }}</label>
          <input v-model="comment" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900" :placeholder="t('clientPortal.orders.commentPlaceholder')" />
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="product in products" :key="product.id" class="border border-gray-100 rounded-2xl p-4 bg-gray-50">
          <div class="flex gap-3">
            <div class="w-16 h-16 rounded-xl bg-white overflow-hidden border border-gray-100 shrink-0">
              <img v-if="product.image_url" :src="product.image_url" :alt="product.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-2xl">□</div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-extrabold truncate">{{ product.name }}</p>
              <p class="text-sm text-gray-500">{{ money(product.wholesale_price || product.retail_price) }} ₸</p>
              <div class="flex items-center gap-2 mt-3">
                <button @click="setQty(product.id, (quantities[product.id] || 0) - 1)" class="w-9 h-9 rounded-lg bg-white border border-gray-200 font-bold">−</button>
                <input :value="quantities[product.id] || 0" @input="setQty(product.id, Number(($event.target as HTMLInputElement).value))" type="number" min="0" class="w-20 h-9 rounded-lg border border-gray-200 text-center bg-white" />
                <button @click="setQty(product.id, (quantities[product.id] || 0) + 1)" class="w-9 h-9 rounded-lg bg-white border border-gray-200 font-bold">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="mt-4 bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-sm font-medium">{{ error }}</div>

      <div class="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100 pt-5">
        <p class="text-lg font-extrabold">{{ t('clientPortal.orders.total', { amount: money(total) }) }}</p>
        <button @click="submitOrder" :disabled="saving || selectedItems.length === 0" class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold disabled:opacity-50">
          {{ saving ? t('clientPortal.orders.submitting') : t('clientPortal.orders.submit') }}
        </button>
      </div>
    </section>

    <section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 class="text-xl font-extrabold mb-4">{{ t('clientPortal.orders.myOrders') }}</h2>
      <div v-if="orders.length === 0" class="text-center text-gray-400 py-8">{{ t('clientPortal.orders.noOrders') }}</div>
      <div v-else class="space-y-4">
        <div v-for="order in orders" :key="order.id" class="border border-gray-100 rounded-2xl p-4">
          <div class="flex justify-between gap-3">
            <div>
              <p class="font-extrabold">{{ t('clientPortal.orders.order', { id: order.id }) }}</p>
              <p class="text-sm text-gray-500">{{ order.requested_delivery_date || date(order.created_at || '') }}</p>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold px-2 py-1 rounded-lg bg-orange-50 text-orange-700">{{ label(order.status) }}</span>
              <p class="font-extrabold mt-2">{{ money(order.total_estimated_amount) }} ₸</p>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <span v-for="item in order.items" :key="item.id" class="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
              {{ item.product?.name || ('#' + item.product_id) }} × {{ item.quantity }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getProducts, type Product } from '../../api/products'
import { createClientOrder, getClientOrders, repeatLastClientOrder, type ClientOrder } from '../../api/clientPortal'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const products = ref<Product[]>([])
const orders = ref<ClientOrder[]>([])
const quantities = reactive<Record<number, number>>({})
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const requestedDate = ref('')
const comment = ref('')

const money = (value: number) => new Intl.NumberFormat('ru-KZ').format(value)
const date = (value: string) => value ? new Date(value).toLocaleDateString('ru-RU') : '—'
const label = (status: string) => (t(`clientPortal.orders.status.${status}`) || status)

const selectedItems = computed(() => Object.entries(quantities)
  .filter(([, quantity]) => Number(quantity) > 0)
  .map(([productId, quantity]) => ({ product_id: Number(productId), quantity: Number(quantity) })))

const total = computed(() => selectedItems.value.reduce((sum, item) => {
  const product = products.value.find(p => p.id === item.product_id)
  return sum + (product ? Number(product.wholesale_price || product.retail_price) * item.quantity : 0)
}, 0))

const setQty = (productId: number, quantity: number) => {
  quantities[productId] = Math.max(0, Number.isFinite(quantity) ? quantity : 0)
}

const load = async () => {
  loading.value = true
  try {
    const [productData, orderData] = await Promise.all([getProducts(), getClientOrders()])
    products.value = productData.filter((p: Product) => p.is_active)
    orders.value = orderData
  } catch (e: any) {
    error.value = e.response?.data?.message || t('clientPortal.orders.loadError')
  } finally {
    loading.value = false
  }
}

const submitOrder = async () => {
  if (selectedItems.value.length === 0) return
  saving.value = true
  error.value = ''
  try {
    await createClientOrder({
      requested_delivery_date: requestedDate.value || null,
      comment: comment.value || null,
      items: selectedItems.value,
    })
    Object.keys(quantities).forEach(key => delete quantities[Number(key)])
    comment.value = ''
    await load()
  } catch (e: any) {
    error.value = e.response?.data?.message || t('clientPortal.orders.submitError')
  } finally {
    saving.value = false
  }
}

const repeatLast = async () => {
  saving.value = true
  error.value = ''
  try {
    await repeatLastClientOrder({
      requested_delivery_date: requestedDate.value || null,
      comment: comment.value || null,
    })
    await load()
  } catch (e: any) {
    error.value = e.response?.data?.message || t('clientPortal.orders.repeatError')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
