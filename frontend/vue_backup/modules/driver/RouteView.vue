<template>
  <div class="space-y-6 max-w-7xl mx-auto px-1 sm:px-4">
    <!-- Header with Date Selection -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-900">{{ t('driver.route.title') }}</h2>
        <p class="text-xs text-gray-500 mt-0.5">{{ t('driver.route.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">{{ t('driver.route.date') }}</label>
        <input 
          v-model="selectedDate" 
          type="date" 
          @change="fetchRouteAndStock" 
          class="w-full sm:w-auto shadow-sm focus:ring-bakery-500 focus:border-bakery-500 text-sm border-gray-300 rounded-xl py-2 px-3 border bg-white text-gray-900" 
        />
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Columns: Route Status & Clients -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Status Card -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-2 h-full" :class="routeActive ? 'bg-green-500' : 'bg-gray-400'"></div>
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-extrabold text-lg text-gray-900">{{ t('driver.route.status.title', { date: formattedDate }) }}</h3>
                <span 
                  class="px-2.5 py-0.5 text-xs font-semibold rounded-full border"
                  :class="routeActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'"
                >
                  {{ routeActive ? t('driver.route.status.active') : (currentRoute ? t('driver.route.status.closed') : t('driver.route.status.notStarted')) }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ currentRoute ? t('driver.route.status.routeId', { id: currentRoute.id }) : t('driver.route.status.noRoute') }}
              </p>
            </div>

            <!-- Route Actions -->
            <div class="flex gap-2">
              <button 
                v-if="!currentRoute" 
                @click="startRoute"
                class="px-4 py-2 bg-bakery-600 hover:bg-bakery-700 text-white text-sm font-bold rounded-xl transition shadow-sm active:scale-95 touch-manipulation"
              >
                {{ t('driver.route.actions.start') }}
              </button>
              <button 
                v-else-if="routeActive" 
                @click="closeRoute"
                class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold rounded-xl transition active:scale-95 touch-manipulation"
              >
                {{ t('driver.route.actions.close') }}
              </button>
            </div>
          </div>
          
          <!-- Summary stats -->
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ t('driver.route.stats.deliveries') }}</p>
              <p class="text-lg sm:text-2xl font-extrabold text-gray-900">{{ completedDeliveries }} / {{ totalDeliveries }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ t('driver.route.stats.amount') }}</p>
              <p class="text-lg sm:text-2xl font-extrabold text-green-600">{{ Number(totalCollected).toLocaleString('ru-RU') }} ₸</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ t('driver.route.stats.returns') }}</p>
              <p class="text-lg sm:text-2xl font-extrabold text-bakery-600">{{ totalReturned }} {{ t('driver.route.stats.pieces') }}</p>
            </div>
          </div>
        </div>

        <!-- Client List / Deliveries -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-extrabold text-gray-900 text-lg">{{ t('driver.route.clients.title') }}</h3>
            <span class="text-xs text-gray-500">{{ t('driver.route.clients.subtitle') }}</span>
          </div>

          <div v-if="!currentRoute || routeStops.length === 0" class="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <svg class="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <p class="text-sm">{{ t('driver.route.clients.empty') }}</p>
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="(stop, index) in routeStops" 
              :key="stop.id"
              class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-bakery-200 transition-colors"
            >
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-bakery-50 text-bakery-700 border border-bakery-100 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  {{ index + 1 }}
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 text-base leading-tight">{{ stop.client?.name || t('driver.route.clients.client') }}</h4>
                  <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    {{ stop.client?.address || t('driver.route.clients.noAddress') }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span 
                      class="text-xs font-semibold px-2 py-0.5 rounded-md border"
                      :class="stop.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-200'"
                    >
                      {{ stop.status === 'delivered' ? t('driver.route.clients.status.delivered') : t('driver.route.clients.status.waiting') }}
                    </span>
                    <span v-if="stop.status === 'delivered'" class="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                      {{ t('driver.route.clients.amount', { amount: Number(stop.total_amount || 0).toLocaleString('ru-RU') }) }}
                    </span>
                    <span v-if="Number(stop.client?.current_debt || 0) > 0" class="text-xs font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100">
                      {{ t('driver.route.clients.debt', { amount: Number(stop.client.current_debt).toLocaleString('ru-RU') }) }}
                    </span>
                    <span v-if="stop.primaryOrder" class="text-xs font-semibold px-2 py-0.5 rounded-md bg-bakery-50 text-bakery-700 border border-bakery-100">
                      {{ t('driver.route.clients.orderBadge', { id: stop.primaryOrder.id, amount: Number(stop.primaryOrder.total_estimated_amount || 0).toLocaleString('ru-RU') }) }}
                    </span>
                    <span v-if="stop.orderCount > 1" class="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                      {{ t('driver.route.clients.moreOrders', { count: stop.orderCount - 1 }) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Go to delivery details -->
              <router-link 
                v-if="routeActive && !stop.isDelivered"
                :to="deliveryRouteFor(stop)"
                class="w-full sm:w-auto px-4 py-2 bg-bakery-600 hover:bg-bakery-700 text-white font-bold rounded-xl text-sm text-center transition active:scale-95 touch-manipulation shadow-sm"
              >
                {{ stop.primaryOrder ? t('driver.route.clients.createDeliveryFromOrder') : t('driver.route.clients.createDelivery') }}
              </router-link>
              <div v-else-if="stop.isDelivered" class="w-full sm:w-auto px-4 py-2 bg-gray-50 text-gray-500 font-bold rounded-xl border border-gray-100 text-sm text-center">
                {{ t('driver.route.clients.completed') }}
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right 1 Column: Inventory & Restock -->
      <div class="space-y-6">
        
        <!-- Inventory / Stock Card -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-extrabold text-gray-900 text-lg mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-bakery-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            {{ t('driver.route.inventory.title') }}
          </h3>
          
          <div v-if="stock.length === 0" class="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p class="text-sm">{{ t('driver.route.inventory.empty') }}</p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div v-for="item in stock" :key="item.id || `${item.stock_source || 'driver'}-${item.product_id}`" class="py-3 flex justify-between items-center">
              <div>
                <p class="font-bold text-gray-900 text-sm sm:text-base">{{ item.product?.name || t('driver.route.inventory.product') }}</p>
                <p class="text-xs text-gray-500">{{ t('driver.route.inventory.sku', { id: item.product_id }) }}</p>
              </div>
              <span class="font-extrabold text-base sm:text-lg text-bakery-600 bg-bakery-50 px-3 py-1 rounded-xl border border-bakery-100">
                {{ item.quantity }} {{ t('driver.route.inventory.pieces') }}
              </span>
            </div>
          </div>

          <button 
            @click="showRestockModal = true"
            class="w-full mt-6 py-3 bg-bakery-50 hover:bg-bakery-100 text-bakery-700 font-extrabold rounded-xl border border-bakery-100 transition active:scale-[0.98] touch-manipulation text-sm shadow-sm"
          >
            {{ t('driver.route.inventory.restock') }}
          </button>
        </div>

      </div>
    </div>

    <!-- Restock Request Modal -->
    <div v-if="showRestockModal" class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 transform transition-transform scale-100">
        <h3 class="text-lg font-bold text-gray-900 mb-2">{{ t('driver.route.restockModal.title') }}</h3>
        <p class="text-sm text-gray-500 mb-6">{{ t('driver.route.restockModal.description') }}</p>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{{ t('driver.route.restockModal.commentLabel') }}</label>
            <textarea 
              v-model="restockComment" 
              rows="3" 
              :placeholder="t('driver.route.restockModal.commentPlaceholder')" 
              class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-sm p-3 border bg-white text-gray-900"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button 
            @click="showRestockModal = false" 
            class="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition active:scale-95 touch-manipulation text-sm"
          >
            {{ t('driver.route.restockModal.cancel') }}
          </button>
          <button 
            @click="submitRestock" 
            class="px-5 py-2.5 rounded-xl bg-bakery-600 hover:bg-bakery-700 text-white font-bold transition active:scale-95 touch-manipulation text-sm shadow-sm"
          >
            {{ t('driver.route.restockModal.submit') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '../../api'
import { useI18n } from '../../i18n'

const { t } = useI18n()

const localDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

const selectedDate = ref(localDate())
const loading = ref(true)
const currentUser = ref<any>(null)
const currentRoute = ref<any>(null)
const deliveries = ref<any[]>([])
const stock = ref<any[]>([])
const assignedClients = ref<any[]>([])
const clientOrders = ref<any[]>([])

const showRestockModal = ref(false)
const restockComment = ref('')

const formattedDate = computed(() => {
  return new Date(`${selectedDate.value}T00:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
})

const routeActive = computed(() => {
  return currentRoute.value && currentRoute.value.status === 'active'
})

const canManageDrivers = computed(() => {
  return currentUser.value?.permissions?.includes('drivers.manage')
})

const routeStops = computed(() => {
  return assignedClients.value.map(client => {
    const orders = clientOrders.value.filter(order => Number(order.client_id) === Number(client.id))
    const primaryOrder = orders[0] || null
    const delivery = (primaryOrder
      ? deliveries.value.find(d => Number(d.client_order_id) === Number(primaryOrder.id))
      : null) || deliveries.value.find(d => Number(d.client_id) === Number(client.id))

    if (delivery) {
      return {
        id: delivery.id,
        client: client,
        primaryOrder,
        orderCount: orders.length,
        status: delivery.status,
        total_amount: delivery.total_amount,
        isDelivered: true
      }
    }
    return {
      id: `client-${client.id}`,
      client: client,
      primaryOrder,
      orderCount: orders.length,
      status: 'waiting',
      total_amount: 0,
      isDelivered: false
    }
  })
})

const deliveryRouteFor = (stop: any) => ({
  path: `/driver/deliveries/${stop.client.id}`,
  query: {
    date: selectedDate.value,
    route_id: currentRoute.value?.id,
    ...(stop.primaryOrder ? { client_order_id: stop.primaryOrder.id } : {}),
  },
})

const totalDeliveries = computed(() => routeStops.value.length)
const completedDeliveries = computed(() => {
  return routeStops.value.filter(s => s.status === 'delivered').length
})

const totalCollected = computed(() => {
  let sum = 0
  deliveries.value.forEach(d => {
    if (d.status === 'delivered' && d.payments) {
      d.payments.forEach((p: any) => {
        if (p.status === 'completed') {
          sum += Number(p.amount)
        }
      })
    }
  })
  return sum
})

const totalReturned = computed(() => {
  let sum = 0
  deliveries.value.forEach(d => {
    if (d.returns) {
      d.returns.forEach((r: any) => {
        sum += Number(r.quantity)
      })
    }
  })
  return sum
})

const fetchRouteAndStock = async () => {
  loading.value = true
  try {
    // 1. Get Me to know driver ID
    if (!currentUser.value) {
      const meRes = await api.get('/me')
      currentUser.value = meRes.data.data
    }

    // 2. Fetch driver's route list
    const routesRes = await api.get('/driver-routes', {
      params: { date: selectedDate.value }
    })
    const routes = routesRes.data.data.data || routesRes.data.data || []
    const route = routes.find((r: any) => canManageDrivers.value || Number(r.driver_id) === Number(currentUser.value.id))

    if (route) {
      // Load deliveries detail
      const detailRes = await api.get(`/driver-routes/${route.id}`)
      currentRoute.value = detailRes.data.data
      deliveries.value = currentRoute.value.deliveries || []
    } else {
      currentRoute.value = null
      deliveries.value = []
    }

    // 3. Fetch driver's stock for selectedDate
    const stockParams: any = { date: selectedDate.value }
    if (canManageDrivers.value && route?.driver_id) {
      stockParams.driver_id = route.driver_id
    }

    const stockRes = await api.get('/driver-stocks', {
      params: stockParams
    })
    stock.value = stockRes.data.data || []

    // 4. Fetch assigned clients
    const clientParams: any = {}
    if (canManageDrivers.value && route?.driver_id) {
      clientParams.assigned_driver_id = route.driver_id
    }

    const clientsRes = await api.get('/clients', {
      params: clientParams
    })
    assignedClients.value = clientsRes.data.data || []

    const orderParams: any = {
      date: selectedDate.value,
      status: 'pending,approved',
    }
    if (canManageDrivers.value && route?.driver_id) {
      orderParams.driver_id = route.driver_id
    }

    const ordersRes = await api.get('/client-orders', {
      params: orderParams
    })
    clientOrders.value = ordersRes.data.data || []

  } catch (error) {
    console.error('Failed to load route and stock details:', error)
  } finally {
    loading.value = false
  }
}

const startRoute = async () => {
  if (currentUser.value?.role !== 'driver') {
    alert(t('driver.route.alerts.adminCannotStart'))
    return
  }
  try {
    await api.post('/driver/routes/start')
    await fetchRouteAndStock()
  } catch (e: any) {
    alert(e.response?.data?.message || t('driver.route.alerts.cannotStart'))
  }
}

const closeRoute = async () => {
  if (!confirm(t('driver.route.alerts.closeConfirm'))) return
  try {
    await api.post(`/driver/routes/${currentRoute.value.id}/close`)
    await fetchRouteAndStock()
  } catch (e: any) {
    alert(e.response?.data?.message || t('driver.route.alerts.closeError'))
  }
}

const submitRestock = async () => {
  if (!restockComment.value.trim()) {
    alert(t('driver.route.restockModal.noCommentAlert'))
    return
  }
  try {
    await api.post('/driver/restock', {
      route_id: currentRoute.value?.id,
      comment: restockComment.value
    })
    alert(t('driver.route.restockModal.successAlert'))
    showRestockModal.value = false
    restockComment.value = ''
  } catch (e: any) {
    alert(e.response?.data?.message || t('driver.route.alerts.restockError'))
  }
}

onMounted(() => {
  fetchRouteAndStock()
})
</script>
