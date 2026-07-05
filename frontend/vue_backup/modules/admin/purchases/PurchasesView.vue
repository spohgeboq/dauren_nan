<template>
  <div class="min-h-screen bg-gray-50 font-sans p-8">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <!-- Back to Main Menu Button -->
          <router-link 
            to="/dashboard" 
            class="flex items-center justify-center gap-2 px-3 sm:px-4 h-12 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-bakery-500 touch-manipulation group"
            title="В главное меню"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span class="font-bold text-sm hidden sm:inline">{{ t('common.backToMenu') }}</span>
          </router-link>

          <div>
            <div class="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <router-link to="/admin" class="hover:text-bakery-600 transition-colors">Dashboard</router-link>
              <span>/</span>
              <span class="text-gray-900 font-medium">{{ t('adminPurchases.breadcrumb') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ t('adminPurchases.title') }}</h1>
          </div>
        </div>
        
        <button @click="openModal()" class="bg-bakery-600 hover:bg-bakery-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2">
          <span class="text-xl leading-none">+</span> {{ t('adminPurchases.newRequest') }}
        </button>
      </div>

      <!-- Content -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
      </div>

      <div v-else class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminPurchases.columns.idDate') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminPurchases.columns.rawMaterial') }}</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminPurchases.columns.purchaseStock') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminPurchases.columns.status') }}</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminPurchases.columns.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="req in requests" :key="req.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-gray-900">#{{ req.id }}</div>
                <div class="text-xs text-gray-500">{{ requestDate(req) }}</div>
              </td>
              <td class="px-6 py-4">
                <div v-for="item in req.items || []" :key="item.id || item.raw_material_id" class="mb-2 last:mb-0">
                  <div class="text-sm font-bold text-gray-900">{{ item.raw_material?.name }}</div>
                  <div class="text-xs text-gray-500">
                    1 {{ item.raw_material?.purchase_unit?.short_name || t('adminPurchases.units.pack') }} =
                    {{ item.raw_material?.qty_per_purchase_unit || 0 }}
                    {{ item.raw_material?.unit?.short_name || t('adminPurchases.units.unit') }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                <div v-for="item in req.items || []" :key="`qty-${item.id || item.raw_material_id}`" class="mb-2 last:mb-0">
                  {{ item.quantity }} {{ item.raw_material?.purchase_unit?.short_name || t('adminPurchases.units.pack') }}
                  <div class="text-xs text-gray-500 font-normal">
                    = {{ itemBaseQuantity(item) }} {{ item.raw_material?.unit?.short_name || t('adminPurchases.units.unit') }}
                  </div>
                  <div v-if="item.estimated_price" class="text-xs text-gray-500 font-normal">
                    {{ item.estimated_price }}₸ / {{ item.raw_material?.purchase_unit?.short_name || t('adminPurchases.units.pack') }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full', statusClass(req.status)]">
                  {{ statusLabel(req.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button v-if="req.status === 'pending_approval' || req.status === 'draft'" @click="changeStatus(req.id, 'approve')" class="text-blue-600 hover:text-blue-900 font-bold">{{ t('adminPurchases.approve') }}</button>
                <button v-if="req.status === 'pending_approval'" @click="changeStatus(req.id, 'reject')" class="text-red-600 hover:text-red-900">{{ t('adminPurchases.reject') }}</button>
                <button v-if="req.status === 'approved'" @click="changeStatus(req.id, 'receive')" class="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 shadow-sm transition">{{ t('adminPurchases.receive') }}</button>
                
                <button v-if="['draft', 'pending_approval', 'rejected'].includes(req.status)" @click="confirmDelete(req)" class="text-gray-400 hover:text-red-600 ml-4">🗑</button>
              </td>
            </tr>
            <tr v-if="requests.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-gray-500">
                {{ t('adminPurchases.empty') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </div>

    <PurchaseFormModal 
      :is-open="isModalOpen" 
      @close="closeModal" 
      @save="saveRequest" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getPurchaseRequests,
  createPurchaseRequest,
  deletePurchaseRequest,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  receivePurchaseRequest,
  type PurchaseRequest,
  type PurchaseRequestItem,
  type PurchaseRequestPayload,
  type PurchaseRequestStatus,
} from '../../../api/purchases';
import PurchaseFormModal from './components/PurchaseFormModal.vue';
import { useI18n } from '../../../i18n';

const { t } = useI18n();
const requests = ref<PurchaseRequest[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    requests.value = await getPurchaseRequests();
  } catch (error) {
    console.error("Failed to fetch data", error);
    window.alert(t('adminPurchases.errors.load'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveRequest = async ({ data, resolve, reject }: { data: PurchaseRequestPayload, resolve: Function, reject: Function }) => {
  try {
    await createPurchaseRequest(data);
    await fetchData();
    resolve();
  } catch (error: any) {
    console.error("Failed to save request", error);
    window.alert(t('adminPurchases.errors.save'));
    reject();
  }
};

const confirmDelete = async (req: PurchaseRequest) => {
  if (window.confirm(t('adminPurchases.errors.confirmDelete', { id: req.id }))) {
    try {
      await deletePurchaseRequest(req.id);
      await fetchData();
    } catch (error: any) {
      window.alert(t('adminPurchases.errors.delete'));
    }
  }
};

const changeStatus = async (id: number, action: 'approve' | 'reject' | 'receive') => {
  let proceed = true;
  // if (action === 'receive') proceed = window.confirm(t('adminPurchases.errors.confirmReceive'));
  
  if (!proceed) return;

  try {
    if (action === 'approve') await approvePurchaseRequest(id);
    if (action === 'reject') await rejectPurchaseRequest(id);
    if (action === 'receive') await receivePurchaseRequest(id);
    await fetchData();
  } catch (error: any) {
    window.alert(error.response?.data?.message || t('adminPurchases.errors.actionError', { action }));
  }
};

const requestDate = (request: PurchaseRequest) => {
  return request.expected_date || request.created_at?.slice(0, 10) || '-';
};

const itemBaseQuantity = (item: PurchaseRequestItem) => {
  return Number(item.quantity) * Number(item.raw_material?.qty_per_purchase_unit || 0);
};

const statusLabel = (status: PurchaseRequestStatus | 'draft') => ({
  draft: t('adminPurchases.statuses.draft') || 'Черновик',
  pending_approval: t('adminPurchases.statuses.pending_approval'),
  approved: t('adminPurchases.statuses.approved'),
  rejected: t('adminPurchases.statuses.rejected'),
  received: t('adminPurchases.statuses.received'),
}[status] || status);

const statusClass = (status: PurchaseRequestStatus | 'draft') => ({
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  received: 'bg-green-100 text-green-800',
}[status] || 'bg-gray-100 text-gray-800');
</script>
