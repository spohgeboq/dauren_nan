<template>
  <div class="space-y-6 max-w-3xl mx-auto px-1 sm:px-4">
    <!-- Header -->
    <div class="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <button 
        @click="goBack"
        class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition active:scale-95"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <div>
        <h2 class="text-xl font-bold text-gray-900">{{ t('driver.delivery.title') }}</h2>
        <p class="text-xs text-gray-500 mt-0.5" v-if="client">{{ client.name }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button @click="goBack" class="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-sm">{{ t('driver.delivery.back') }}</button>
    </div>

    <div v-else class="space-y-6">
      <!-- Client Info -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-extrabold text-gray-900 text-lg mb-4">{{ t('driver.delivery.clientInfo.title') }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ t('driver.delivery.clientInfo.name') }}</p>
            <p class="font-bold text-gray-900">{{ client.name }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ t('driver.delivery.clientInfo.debt') }}</p>
            <p class="font-bold" :class="client.current_debt > 0 ? 'text-red-600' : 'text-green-600'">
              {{ Number(client.current_debt || 0).toLocaleString('ru-RU') }} ₸
            </p>
          </div>
        </div>
      </div>

      <!-- Client Order Info -->
      <div v-if="clientOrder" class="bg-white rounded-2xl p-6 shadow-sm border border-bakery-100">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h3 class="font-extrabold text-gray-900 text-lg">{{ t('driver.delivery.order.title', { id: clientOrder.id }) }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ t('driver.delivery.order.description') }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 rounded-full bg-bakery-50 text-bakery-700 border border-bakery-100 text-xs font-extrabold">
              {{ t(`clientPortal.orders.status.${clientOrder.status}`) || clientOrder.status }}
            </span>
            <span v-if="clientOrder.requested_delivery_date" class="px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-100 text-xs font-extrabold">
              {{ formatDate(clientOrder.requested_delivery_date) }}
            </span>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ t('driver.delivery.order.estimatedTotal') }}</p>
            <p class="font-extrabold text-bakery-600">{{ Number(clientOrder.total_estimated_amount || 0).toLocaleString('ru-RU') }} ₸</p>
          </div>
          <div class="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ t('driver.delivery.order.itemsCount') }}</p>
            <p class="font-extrabold text-gray-900">{{ clientOrder.items?.length || 0 }}</p>
          </div>
        </div>
        <p v-if="clientOrder.comment" class="mt-3 rounded-xl bg-bakery-50 border border-bakery-100 p-3 text-sm font-medium text-bakery-800">
          {{ clientOrder.comment }}
        </p>
      </div>

      <!-- Products Selection -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-extrabold text-gray-900 text-lg mb-4">{{ t('driver.delivery.products.title') }}</h3>
        
        <div v-if="driverStock.length === 0" class="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p class="text-sm">{{ t('driver.delivery.products.empty') }}</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="(item, index) in deliveryItems" :key="index" class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <!-- Row 1: Product selector -->
            <div class="mb-3">
              <label class="block text-xs font-bold text-gray-500 mb-1">{{ t('driver.delivery.products.product') }}</label>
              <div class="flex items-center gap-2">
                <select 
                  v-model="item.product_id" 
                  @change="onProductSelect(item)"
                  class="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-sm p-2.5 border bg-white"
                >
                  <option value="">{{ t('driver.delivery.products.selectProduct') }}</option>
                  <option v-for="stockItem in driverStock" :key="stockItem.product_id" :value="stockItem.product_id">
                    {{ stockItem.product?.name }} ({{ t('driver.delivery.products.inStock', { quantity: stockItem.quantity }) }})
                  </option>
                </select>
                <button 
                  @click="removeDeliveryItem(index)" 
                  class="w-10 h-10 flex-shrink-0 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>

            <!-- Row 2: Qty | Price | Return qty | Return reason -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <!-- Delivery quantity -->
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">{{ t('driver.delivery.products.quantity') }}</label>
                <input 
                  type="number" 
                  v-model.number="item.quantity" 
                  @input="updatePaidAmount"
                  min="1"
                  :max="getMaxQuantity(item.product_id)"
                  class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-sm p-2.5 border bg-white"
                />
              </div>

              <!-- Price (readonly) -->
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">{{ t('driver.delivery.products.price') }}</label>
                <div class="p-2.5 bg-gray-100 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 text-center h-[42px] flex items-center justify-center">
                  {{ item.price ? Number(item.price).toLocaleString('ru-RU') + ' ₸' : '-' }}
                </div>
              </div>

              <!-- Return quantity -->
              <div>
                <label class="block text-xs font-bold text-orange-500 mb-1 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                  {{ t('driver.delivery.products.returnQty') }}
                </label>
                <input 
                  type="number" 
                  v-model.number="item.return_quantity"
                  min="0"
                  :max="item.quantity || 0"
                  class="w-full rounded-xl border-orange-200 shadow-sm focus:border-orange-400 focus:ring-orange-400 text-sm p-2.5 border bg-orange-50"
                  :class="{ 'border-orange-400 bg-orange-100': item.return_quantity > 0 }"
                  placeholder="0"
                />
              </div>

              <!-- Return reason -->
              <div>
                <label class="block text-xs font-bold text-orange-500 mb-1">{{ t('driver.delivery.products.returnReason') }}</label>
                <select 
                  v-model="item.return_reason"
                  class="w-full rounded-xl border-orange-200 shadow-sm focus:border-orange-400 focus:ring-orange-400 text-sm p-2.5 border bg-orange-50"
                  :class="{ 'border-orange-400': item.return_quantity > 0, 'opacity-50': !item.return_quantity }"
                  :disabled="!item.return_quantity"
                >
                  <option value="stale">{{ t('driver.delivery.products.returnReasons.stale') }}</option>
                  <option value="damaged">{{ t('driver.delivery.products.returnReasons.damaged') }}</option>
                  <option value="other">{{ t('driver.delivery.products.returnReasons.other') }}</option>
                </select>
              </div>
            </div>

            <!-- Return summary badge -->
            <div v-if="item.return_quantity > 0" class="mt-2 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5 text-xs font-bold text-orange-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
              {{ t('driver.delivery.products.returnQty') }}: {{ item.return_quantity }} шт — {{ t(`driver.delivery.products.returnReasons.${item.return_reason}`) }}
            </div>
          </div>

          <button 
            @click="addDeliveryItem" 
            class="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-dashed border-gray-300 transition text-sm flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            {{ t('driver.delivery.products.add') }}
          </button>
        </div>
      </div>

      <!-- Payment -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-extrabold text-gray-900 text-lg mb-4">{{ t('driver.delivery.payment.title') }}</h3>
        
        <div class="flex items-center justify-between mb-6 bg-bakery-50 p-4 rounded-xl border border-bakery-100">
          <span class="font-bold text-gray-700">{{ t('driver.delivery.payment.total') }}</span>
          <span class="text-2xl font-extrabold text-bakery-600">{{ Number(totalAmount).toLocaleString('ru-RU') }} ₸</span>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-2">{{ t('driver.delivery.payment.method') }}</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                v-for="method in paymentMethods" 
                :key="method.value"
                @click="selectPaymentMethod(method.value)"
                class="px-3 py-2.5 rounded-xl text-sm font-bold border transition-colors"
                :class="paymentMethod === method.value ? 'bg-bakery-600 text-white border-bakery-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
              >
                {{ method.label }}
              </button>
            </div>
          </div>

          <div v-if="paymentMethod !== 'debt' && paymentMethod !== 'mixed'">
            <label class="block text-xs font-bold text-gray-500 mb-1">{{ t('driver.delivery.payment.paidAmount') }}</label>
            <input 
              type="number" 
              v-model.number="paidAmount" 
              class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-lg font-bold p-3 border bg-white"
            />
          </div>

          <div v-if="paymentMethod === 'mixed'" class="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">{{ t('driver.delivery.payment.cash') }}</label>
              <input type="number" v-model.number="mixedCash" class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-sm p-2.5 border bg-white" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">{{ t('driver.delivery.payment.kaspi') }}</label>
              <input type="number" v-model.number="mixedKaspi" class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-sm p-2.5 border bg-white" />
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <button 
        @click="submitDelivery" 
        :disabled="submitting || deliveryItems.length === 0 || !isValid"
        class="w-full py-4 bg-bakery-600 hover:bg-bakery-700 disabled:opacity-50 disabled:hover:bg-bakery-600 text-white font-extrabold rounded-2xl shadow-sm transition active:scale-95 text-lg"
      >
        <span v-if="submitting">{{ t('driver.delivery.submitting') }}</span>
        <span v-else>{{ t('driver.delivery.submit') }}</span>
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const localDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

const loading = ref(true)
const submitting = ref(false)
const error = ref('')

const client = ref<any>(null)
const clientOrder = ref<any>(null)
const currentRoute = ref<any>(null)
const driverStock = ref<any[]>([])

const deliveryItems = ref<any[]>([])
const paymentMethod = ref('cash')
const paidAmount = ref(0)
const mixedCash = ref(0)
const mixedKaspi = ref(0)

const paymentMethods = computed(() => [
  { value: 'cash', label: t('driver.delivery.payment.methods.cash') },
  { value: 'kaspi', label: t('driver.delivery.payment.methods.kaspi') },
  { value: 'debt', label: t('driver.delivery.payment.methods.debt') },
  { value: 'mixed', label: t('driver.delivery.payment.methods.mixed') }
])

const selectedDate = computed(() => {
  return typeof route.query.date === 'string' ? route.query.date : localDate()
})

const selectedClientOrderId = computed(() => {
  return typeof route.query.client_order_id === 'string' ? Number(route.query.client_order_id) : null
})

const adminReturnRoute = computed(() => {
  return {
    path: '/admin/deliveries/routes',
    query: {
      date: selectedDate.value,
      ...(typeof route.query.driver_id === 'string' ? { driver_id: route.query.driver_id } : {}),
    },
  }
})

const backRoute = computed(() => {
  return route.path.startsWith('/admin/')
    ? adminReturnRoute.value
    : { path: '/driver/route' }
})

const totalAmount = computed(() => {
  return deliveryItems.value.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0)
})

const isValid = computed(() => {
  // Check if items are valid
  const hasValidItems = deliveryItems.value.length > 0 && deliveryItems.value.every(item => item.product_id && item.quantity > 0)
  if (!hasValidItems) return false

  // Check total quantities against stock, including duplicate product rows
  const quantitiesByProduct = new Map<number, number>()
  for (const item of deliveryItems.value) {
    const productId = Number(item.product_id)
    quantitiesByProduct.set(productId, (quantitiesByProduct.get(productId) || 0) + Number(item.quantity || 0))
  }

  for (const [productId, quantity] of quantitiesByProduct.entries()) {
    const stockItem = driverStock.value.find(s => Number(s.product_id) === productId)
    if (!stockItem || quantity > Number(stockItem.quantity)) return false
  }

  // Check debt limit
  const paymentTotal = paymentMethod.value === 'mixed' 
    ? (mixedCash.value + mixedKaspi.value) 
    : (paymentMethod.value === 'debt' ? 0 : paidAmount.value)
    
  const debtIncrease = totalAmount.value - paymentTotal
  if (paymentTotal > totalAmount.value) return false

  if (debtIncrease > 0 && client.value.debt_limit > 0) {
    if ((client.value.current_debt + debtIncrease) > client.value.debt_limit) {
      return false
    }
  }

  return true
})

const goBack = () => {
  router.push(backRoute.value)
}

const formatDate = (value: string) => {
  return new Date(`${value}T00:00:00`).toLocaleDateString('ru-RU')
}

const getMaxQuantity = (productId: number) => {
  if (!productId) return 0
  const stockItem = driverStock.value.find(s => Number(s.product_id) === Number(productId))
  return stockItem ? Number(stockItem.quantity) : 0
}

const onProductSelect = (item: any) => {
  if (!item.product_id) {
    item.price = 0
    return
  }
  const stockItem = driverStock.value.find(s => Number(s.product_id) === Number(item.product_id))
  if (stockItem && stockItem.product) {
    // Determine price: wholesale_price if exists, else retail_price
    item.price = stockItem.product.wholesale_price || stockItem.product.retail_price || 0
  }
  updatePaidAmount()
}

const updatePaidAmount = () => {
  if (paymentMethod.value === 'cash' || paymentMethod.value === 'kaspi') {
    paidAmount.value = totalAmount.value
  }
}

const selectPaymentMethod = (method: string) => {
  paymentMethod.value = method
  updatePaidAmount()
}

const addDeliveryItem = () => {
  deliveryItems.value.push({ product_id: '', quantity: 1, price: 0, return_quantity: 0, return_reason: 'stale' })
}

const removeDeliveryItem = (index: number) => {
  deliveryItems.value.splice(index, 1)
  updatePaidAmount()
}

const fetchInitialData = async () => {
  loading.value = true
  error.value = ''
  
  const clientId = route.params.clientId
  if (!clientId) {
    error.value = t('driver.delivery.alerts.noClient')
    loading.value = false
    return
  }

  try {
    // 1. Fetch client
    const clientRes = await api.get(`/clients/${clientId}`)
    client.value = clientRes.data.data

    if (selectedClientOrderId.value) {
      const orderRes = await api.get(`/client-orders/${selectedClientOrderId.value}`)
      clientOrder.value = orderRes.data.data

      if (Number(clientOrder.value.client_id) !== Number(client.value.id)) {
        error.value = t('driver.delivery.alerts.orderClientMismatch')
        loading.value = false
        return
      }
    }

    // 2. Get current user to decide whether this is a driver or an admin acting for a driver
    const meRes = await api.get('/me')
    const currentUser = meRes.data.data
    const canManageDrivers = currentUser?.permissions?.includes('drivers.manage')

    // 3. Get active route
    const selectedRouteId = typeof route.query.route_id === 'string' ? Number(route.query.route_id) : null
    const routesRes = await api.get('/driver-routes', {
      params: { date: selectedDate.value }
    })
    const routes = routesRes.data.data.data || routesRes.data.data || []
    const activeRoute = routes.find((r: any) => {
      if (r.status !== 'active') return false
      if (selectedRouteId) return Number(r.id) === selectedRouteId
      if (canManageDrivers) return Number(r.driver_id) === Number(client.value.assigned_driver_id)
      return Number(r.driver_id) === Number(currentUser.id)
    })

    if (!activeRoute) {
      error.value = canManageDrivers
        ? t('driver.delivery.alerts.adminNoRoute')
        : t('driver.delivery.alerts.driverNoRoute')
      loading.value = false
      return
    }
    currentRoute.value = activeRoute

    // 4. Get driver stock
    const stockParams: any = { date: selectedDate.value }
    if (canManageDrivers) {
      stockParams.driver_id = activeRoute.driver_id
    }

    const stockRes = await api.get('/driver-stocks', {
      params: stockParams
    })
    driverStock.value = stockRes.data.data || []

    if (clientOrder.value?.items?.length) {
      fillItemsFromClientOrder()
    } else {
      addDeliveryItem()
    }

  } catch (err) {
    console.error(err)
    error.value = t('driver.delivery.alerts.loadError')
  } finally {
    loading.value = false
  }
}

const fillItemsFromClientOrder = () => {
  deliveryItems.value = clientOrder.value.items.map((orderItem: any) => ({
    product_id: orderItem.product_id,
    quantity: Number(orderItem.quantity || 1),
    price: priceForOrderItem(orderItem),
    return_quantity: 0,
    return_reason: 'stale',
  }))

  updatePaidAmount()
}

const priceForOrderItem = (orderItem: any) => {
  const stockItem = driverStock.value.find(item => Number(item.product_id) === Number(orderItem.product_id))
  return Number(
    stockItem?.product?.wholesale_price
    || stockItem?.product?.retail_price
    || orderItem.price
    || 0
  )
}

const submitDelivery = async () => {
  if (!isValid.value) return
  submitting.value = true

  try {
    const payload: any = {
      route_id: currentRoute.value.id,
      client_id: client.value.id,
      ...(clientOrder.value ? { client_order_id: clientOrder.value.id } : {}),
      items: deliveryItems.value.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      })),
      payment_method: paymentMethod.value,
    }

    if (paymentMethod.value === 'cash' || paymentMethod.value === 'kaspi') {
      payload.paid_amount = paidAmount.value
    } else if (paymentMethod.value === 'mixed') {
      payload.paid_amount = mixedCash.value + mixedKaspi.value
      payload.payment_details = [
        { method: 'cash', amount: mixedCash.value },
        { method: 'kaspi', amount: mixedKaspi.value }
      ].filter(d => d.amount > 0)
    } else {
      payload.paid_amount = 0
    }

    const deliveryRes = await api.post('/deliveries', payload)
    const deliveryId = deliveryRes.data.data?.id

    // Process returns inline — send each return after delivery is created
    if (deliveryId) {
      const returnItems = deliveryItems.value.filter(
        item => item.product_id && Number(item.return_quantity) > 0
      )
      for (const item of returnItems) {
        try {
          await api.post(`/deliveries/${deliveryId}/returns`, {
            product_id: item.product_id,
            quantity: Number(item.return_quantity),
            reason: item.return_reason || 'other',
          })
        } catch (returnErr: any) {
          console.error('Return error for product', item.product_id, returnErr)
          // Non-blocking: show warning but don't abort
          alert(
            `Возврат по товару сохранен не был: ${returnErr.response?.data?.message || returnErr.message}`
          )
        }
      }
    }
    
    // Success! Redirect back to route view
    router.push(backRoute.value)
    
  } catch (err: any) {
    console.error(err)
    const msg = err.response?.data?.message || t('driver.delivery.alerts.submitError')
    alert(msg)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchInitialData()
})
</script>
