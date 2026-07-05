<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900">{{ t('adminRoutes.title') }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ t('adminRoutes.description') }}</p>
        </div>
        <router-link to="/dashboard" class="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50">
          {{ t('common.backToMenu') }}
        </router-link>
      </header>

      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="block">
            <span class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{{ t('adminRoutes.date') }}</span>
            <TailwindDatePicker
              v-model="selectedDate"
              class="w-full"
              @update:model-value="reloadForSelection"
            />
          </label>

          <label class="block md:col-span-2">
            <span class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{{ t('adminRoutes.driver') }}</span>
            <select
              v-model.number="selectedDriverId"
              class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-sm p-2.5 border bg-white text-gray-900"
              @change="reloadForSelection"
            >
              <option :value="0">{{ t('adminRoutes.selectDriver') }}</option>
              <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
                {{ driver.name }} — {{ driver.email }}
              </option>
            </select>
          </label>
        </div>
      </section>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
      </div>

      <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <main class="xl:col-span-2 space-y-6">
          <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 class="text-lg font-extrabold text-gray-900">{{ t('adminRoutes.waybill') }}</h2>
                <p class="text-sm text-gray-500 mt-1">
                  {{ routeSummary }}
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-if="!currentRoute"
                  :disabled="!selectedDriverId"
                  @click="createRoute"
                  class="px-4 py-2 rounded-xl bg-bakery-600 hover:bg-bakery-700 disabled:opacity-50 disabled:hover:bg-bakery-600 text-white font-bold text-sm"
                >
                  {{ t('adminRoutes.createRoute') }}
                </button>
                <button
                  v-else-if="currentRoute.status === 'active'"
                  @click="closeRoute"
                  class="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 font-bold text-sm"
                >
                  {{ t('adminRoutes.closeRoute') }}
                </button>
                <span
                  v-if="currentRoute"
                  class="px-3 py-2 rounded-xl text-sm font-bold border"
                  :class="currentRoute.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-700 border-gray-200'"
                >
                  {{ currentRoute.status === 'active' ? t('adminRoutes.active') : t('adminRoutes.closed') }}
                </span>
              </div>
            </div>
          </section>

          <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-extrabold text-gray-900">{{ t('adminRoutes.deliveryPoints') }}</h2>
                <p class="text-sm text-gray-500">{{ t('adminRoutes.pointsDescription') }}</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                {{ completedDeliveries }} / {{ assignedClients.length }}
              </span>
            </div>

            <div v-if="!selectedDriverId" class="p-8 text-center text-gray-400">
              {{ t('adminRoutes.noDriverSelected') }}
            </div>
            <div v-else-if="assignedClients.length === 0" class="p-8 text-center text-gray-400">
              {{ t('adminRoutes.noClients') }}
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div
                v-for="(client, index) in assignedClients"
                :key="client.id"
                class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-bakery-50 text-bakery-700 border border-bakery-100 flex items-center justify-center font-bold text-sm shrink-0">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900">{{ client.name }}</h3>
                    <p class="text-sm text-gray-500">{{ client.address || t('adminRoutes.noAddress') }}</p>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <span
                        class="px-2 py-0.5 rounded-md text-xs font-bold border"
                        :class="deliveryFor(client.id) ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-200'"
                      >
                        {{ deliveryFor(client.id) ? t('adminRoutes.delivered') : t('adminRoutes.pending') }}
                      </span>
                      <span v-if="Number(client.current_debt || 0) > 0" class="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100 text-xs font-bold">
                        {{ t('adminRoutes.debt', { amount: Number(client.current_debt).toLocaleString('ru-RU') }) }}
                      </span>
                      <span v-if="primaryOrderFor(client.id)" class="px-2 py-0.5 rounded-md bg-bakery-50 text-bakery-700 border border-bakery-100 text-xs font-bold">
                        {{ t('adminRoutes.orderBadge', { id: primaryOrderFor(client.id)?.id, amount: Number(primaryOrderFor(client.id)?.total_estimated_amount || 0).toLocaleString('ru-RU') }) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-2 md:items-center">
                  <span v-if="deliveryFor(client.id)" class="px-3 py-2 rounded-xl bg-gray-50 text-gray-700 border border-gray-100 text-sm font-bold text-center">
                    {{ Number(deliveryFor(client.id)?.total_amount || 0).toLocaleString('ru-RU') }} ₸
                  </span>
                  <router-link
                    v-else-if="currentRoute?.status === 'active'"
                    :to="deliveryRouteFor(client)"
                    class="px-4 py-2 rounded-xl bg-bakery-600 hover:bg-bakery-700 text-white font-bold text-sm text-center"
                  >
                    {{ primaryOrderFor(client.id) ? t('adminRoutes.createDeliveryFromOrder') : t('adminRoutes.createDelivery') }}
                  </router-link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside class="space-y-6">
          <section v-if="selectedDriverId && deliveryStockMode === 'warehouse'" class="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-5">
            <h2 class="text-lg font-extrabold text-emerald-950 mb-2">{{ t('adminRoutes.stockModeWarehouseTitle') }}</h2>
            <p class="text-sm font-medium leading-6 text-emerald-800">{{ t('adminRoutes.stockModeWarehouseText') }}</p>
          </section>

          <section v-if="deliveryStockMode === 'driver_transfer'" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 class="text-lg font-extrabold text-gray-900 mb-4">{{ t('adminRoutes.stockInCar') }}</h2>
            <div v-if="driverStock.length === 0" class="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              {{ t('adminRoutes.carEmpty') }}
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div v-for="item in driverStock" :key="`${item.product_id}-${item.date}`" class="py-3 flex justify-between gap-3">
                <div>
                  <p class="font-bold text-gray-900 text-sm">{{ item.product?.name || t('adminRoutes.product') }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(item.date) }}</p>
                </div>
                <span class="font-extrabold text-bakery-600">{{ t('adminRoutes.pieces', { amount: Number(item.quantity).toLocaleString('ru-RU') }) }}</span>
              </div>
            </div>
          </section>

          <section v-if="deliveryStockMode === 'driver_transfer'" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 class="text-lg font-extrabold text-gray-900 mb-4">{{ t('adminRoutes.giveProduct') }}</h2>
            <div class="space-y-3">
              <select
                v-model.number="transferForm.product_id"
                class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-sm p-2.5 border bg-white text-gray-900"
              >
                <option :value="0">{{ t('adminRoutes.selectProduct') }}</option>
                <option v-for="item in availableProducts" :key="item.product_id" :value="item.product_id">
                  {{ t('adminRoutes.productAvailable', { name: item.product?.name, amount: Number(item.quantity).toLocaleString('ru-RU') }) }}
                </option>
              </select>
              <input
                v-model.number="transferForm.quantity"
                type="number"
                min="1"
                step="1"
                :placeholder="t('adminRoutes.quantity')"
                class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 text-sm p-2.5 border bg-white text-gray-900"
              />
              <button
                :disabled="!canTransfer"
                @click="transferStock"
                class="w-full px-4 py-3 rounded-xl bg-bakery-600 hover:bg-bakery-700 disabled:opacity-50 disabled:hover:bg-bakery-600 text-white font-bold text-sm"
              >
                {{ t('adminRoutes.giveToDriver') }}
              </button>
              
              <hr class="my-4 border-gray-100" />
              
              <button
                @click="transferTemplateStock"
                class="w-full px-4 py-3 rounded-xl border border-bakery-200 bg-bakery-50 hover:bg-bakery-100 text-bakery-700 font-bold text-sm"
              >
                {{ t('adminRoutes.copyYesterday') }}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../../api'
import { useI18n } from '../../../i18n'
import TailwindDatePicker from '../../../components/ui/TailwindDatePicker.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const localDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

const selectedDate = ref(typeof route.query.date === 'string' ? route.query.date : localDate())
const selectedDriverId = ref(typeof route.query.driver_id === 'string' ? Number(route.query.driver_id) : 0)
const loading = ref(true)

const users = ref<any[]>([])
const routes = ref<any[]>([])
const currentRoute = ref<any>(null)
const assignedClients = ref<any[]>([])
const deliveries = ref<any[]>([])
const driverStock = ref<any[]>([])
const productStocks = ref<any[]>([])
const clientOrders = ref<any[]>([])

const transferForm = reactive({
  product_id: 0,
  quantity: null as number | null,
})

const drivers = computed(() => {
  return users.value.filter(user => (user.roles || []).some((role: any) => role === 'driver' || role.name === 'driver'))
})

const selectedDriver = computed(() => {
  return drivers.value.find(driver => Number(driver.id) === Number(selectedDriverId.value)) || null
})

const deliveryStockMode = computed(() => {
  return selectedDriver.value?.delivery_stock_mode || 'warehouse'
})

const completedDeliveries = computed(() => {
  return assignedClients.value.filter(client => deliveryFor(client.id)).length
})

const routeSummary = computed(() => {
  if (!selectedDriverId.value) return t('adminRoutes.summarySelectDriver')
  if (!currentRoute.value) return t('adminRoutes.summaryNotCreated')
  return t('adminRoutes.summaryCreated', { id: currentRoute.value.id, date: formatDate(currentRoute.value.date) })
})

const availableProducts = computed(() => {
  const grouped = new Map<number, any>()

  productStocks.value
    .filter(stock => Number(stock.quantity) > 0 && stockDate(stock.date) <= selectedDate.value)
    .forEach(stock => {
      const productId = Number(stock.product_id)
      const current = grouped.get(productId) || {
        product_id: productId,
        product: stock.product,
        quantity: 0,
      }

      current.quantity += Number(stock.quantity)
      grouped.set(productId, current)
    })

  return Array.from(grouped.values())
})

const canTransfer = computed(() => {
  if (deliveryStockMode.value !== 'driver_transfer') return false
  if (!selectedDriverId.value || !currentRoute.value || currentRoute.value.status !== 'active') return false
  if (!transferForm.product_id || !transferForm.quantity || transferForm.quantity <= 0) return false

  const available = availableProducts.value.find(item => Number(item.product_id) === Number(transferForm.product_id))
  return Boolean(available && Number(transferForm.quantity) <= Number(available.quantity))
})

const formatDate = (value: string) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString('ru-RU')
}

const stockDate = (value: string) => {
  return String(value || '').slice(0, 10)
}

const deliveryFor = (clientId: number) => {
  const primaryOrder = primaryOrderFor(clientId)
  return (primaryOrder
    ? deliveries.value.find(delivery => Number(delivery.client_order_id) === Number(primaryOrder.id))
    : null) || deliveries.value.find(delivery => Number(delivery.client_id) === Number(clientId))
}

const primaryOrderFor = (clientId: number) => {
  return clientOrders.value.find(order => Number(order.client_id) === Number(clientId)) || null
}

const deliveryRouteFor = (client: any) => {
  const primaryOrder = primaryOrderFor(client.id)

  return {
    path: `/admin/deliveries/routes/${currentRoute.value.id}/clients/${client.id}/delivery`,
    query: {
      route_id: currentRoute.value.id,
      date: selectedDate.value,
      driver_id: selectedDriverId.value,
      ...(primaryOrder ? { client_order_id: primaryOrder.id } : {}),
    },
  }
}

const updateRouteQuery = () => {
  router.replace({
    path: '/admin/deliveries/routes',
    query: {
      date: selectedDate.value,
      ...(selectedDriverId.value ? { driver_id: selectedDriverId.value } : {}),
    },
  })
}

const reloadForSelection = async () => {
  updateRouteQuery()
  await fetchRouteData()
}

const fetchBaseData = async () => {
  const [usersRes, productStocksRes] = await Promise.all([
    api.get('/users'),
    api.get('/inventory/products'),
  ])

  users.value = usersRes.data.data || []
  productStocks.value = productStocksRes.data.data || []

  if (!selectedDriverId.value && drivers.value.length > 0) {
    selectedDriverId.value = drivers.value[0].id
  }
}

const fetchRouteData = async () => {
  loading.value = true

  try {
    if (!selectedDriverId.value) {
      currentRoute.value = null
      assignedClients.value = []
      deliveries.value = []
      driverStock.value = []
      clientOrders.value = []
      return
    }

    const [routesRes, clientsRes, stockRes, productStocksRes, ordersRes] = await Promise.all([
      api.get('/driver-routes', {
        params: { driver_id: selectedDriverId.value, date: selectedDate.value },
      }),
      api.get('/clients', {
        params: { assigned_driver_id: selectedDriverId.value },
      }),
      api.get('/driver-stocks', {
        params: { driver_id: selectedDriverId.value, date: selectedDate.value },
      }),
      api.get('/inventory/products'),
      api.get('/client-orders', {
        params: {
          driver_id: selectedDriverId.value,
          date: selectedDate.value,
          status: 'pending,approved',
        },
      }),
    ])

    routes.value = routesRes.data.data.data || routesRes.data.data || []
    currentRoute.value = routes.value.find((item: any) => Number(item.driver_id) === Number(selectedDriverId.value)) || null
    assignedClients.value = clientsRes.data.data || []
    driverStock.value = stockRes.data.data || []
    productStocks.value = productStocksRes.data.data || []
    clientOrders.value = ordersRes.data.data || []

    if (currentRoute.value) {
      const detailRes = await api.get(`/driver-routes/${currentRoute.value.id}`)
      currentRoute.value = detailRes.data.data
      deliveries.value = currentRoute.value.deliveries || []
    } else {
      deliveries.value = []
    }
  } catch (error) {
    console.error('Failed to load route management data:', error)
  } finally {
    loading.value = false
  }
}

const createRoute = async () => {
  if (!selectedDriverId.value) return

  try {
    await api.post('/driver-routes', {
      driver_id: selectedDriverId.value,
      date: selectedDate.value,
    })
    await fetchRouteData()
  } catch (error: any) {
    alert(error.response?.data?.message || t('adminRoutes.errors.create'))
  }
}

const closeRoute = async () => {
  if (!currentRoute.value) return
  if (!confirm(t('adminRoutes.errors.confirmClose'))) return

  try {
    await api.put(`/driver-routes/${currentRoute.value.id}`, {
      status: 'closed',
    })
    await fetchRouteData()
  } catch (error: any) {
    alert(error.response?.data?.message || t('adminRoutes.errors.close'))
  }
}

const transferStock = async () => {
  if (!canTransfer.value) return

  try {
    await api.post('/driver-stocks/transfer', {
      driver_id: selectedDriverId.value,
      date: selectedDate.value,
      items: [
        {
          product_id: transferForm.product_id,
          quantity: transferForm.quantity,
        },
      ],
    })

    transferForm.product_id = 0
    transferForm.quantity = null
    await fetchRouteData()
  } catch (error: any) {
    alert(error.response?.data?.message || t('adminRoutes.errors.transfer'))
  }
}

const transferTemplateStock = async () => {
  if (deliveryStockMode.value !== 'driver_transfer') return;
  if (!selectedDriverId.value) return;
  try {
    const res = await api.get('/driver-stocks/latest-template', { params: { driver_id: selectedDriverId.value } });
    const items = res.data.data;
    if (!items || items.length === 0) {
      alert(t('production.noTemplateFound'));
      return;
    }
    
    if (!confirm(t('adminRoutes.confirmTemplate'))) return;

    await api.post('/driver-stocks/transfer', {
      driver_id: selectedDriverId.value,
      date: selectedDate.value,
      items: items,
    });
    
    await fetchRouteData();
    alert(t('production.templateLoaded'));
  } catch (error: any) {
    alert(error.response?.data?.message || t('adminRoutes.errors.transfer'));
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchBaseData()
    await fetchRouteData()
    updateRouteQuery()
  } catch (error) {
    console.error('Failed to initialize route management:', error)
  } finally {
    loading.value = false
  }
})
</script>
