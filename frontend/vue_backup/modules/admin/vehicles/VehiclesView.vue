<template>
  <div class="min-h-screen bg-gray-50 font-sans p-8">
    <div class="max-w-4xl mx-auto">
      
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
              <span class="text-gray-900 font-medium">{{ t('adminVehicles.title') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ t('adminVehicles.title') }}</h1>
          </div>
        </div>
        
        <button @click="openModal()" class="bg-bakery-600 hover:bg-bakery-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2">
          <span class="text-xl leading-none">+</span> {{ t('adminVehicles.add') }}
        </button>
      </div>

      <!-- Content -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="vehicle in vehicles" :key="vehicle.id" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
          <div>
            <h3 class="font-bold text-lg text-gray-900">{{ vehicle.name }}</h3>
            <div class="text-gray-500 mt-1 flex items-center gap-2">
              <span class="inline-block bg-gray-100 rounded text-xs px-2 py-1 font-mono text-gray-600">
                {{ vehicle.license_plate || '—' }}
              </span>
              <span :class="['text-xs font-bold', vehicle.is_active ? 'text-green-600' : 'text-red-500']">
                {{ vehicle.is_active ? t('adminVehicles.active') : t('adminVehicles.inactive') }}
              </span>
            </div>
          </div>
          
          <div class="flex gap-3 ml-4 border-l border-gray-100 pl-4">
            <button @click="openModal(vehicle)" class="text-indigo-600 hover:text-indigo-900 transition-colors p-1 hover:bg-indigo-50 rounded" :title="t('adminVehicles.edit')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button @click="confirmDelete(vehicle)" class="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded" :title="t('adminVehicles.delete')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="vehicles.length === 0" class="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
          {{ t('adminVehicles.empty') }}
        </div>
      </div>
      
    </div>

    <VehicleFormModal 
      :is-open="isModalOpen" 
      :vehicle="selectedVehicle" 
      @close="closeModal" 
      @save="saveVehicle" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, type Vehicle } from '../../../api/vehicles';
import VehicleFormModal from './components/VehicleFormModal.vue';
import { useI18n } from '../../../i18n';

const { t } = useI18n();
const vehicles = ref<Vehicle[]>([]);
const loading = ref(true);

const isModalOpen = ref(false);
const selectedVehicle = ref<Vehicle | null>(null);

const fetchData = async () => {
  loading.value = true;
  try {
    vehicles.value = await getVehicles();
  } catch (error) {
    console.error("Failed to fetch data", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openModal = (vehicle: Vehicle | null = null) => {
  selectedVehicle.value = vehicle ? { ...vehicle } : null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedVehicle.value = null;
};

const saveVehicle = async ({ id, data, resolve, reject }: { id?: number, data: Partial<Vehicle>, resolve: Function, reject: Function }) => {
  try {
    if (id) {
      await updateVehicle(id, data);
    } else {
      await createVehicle(data);
    }
    await fetchData();
    resolve();
  } catch (error: any) {
    alert('Error saving vehicle');
    reject();
  }
};

const confirmDelete = async (vehicle: Vehicle) => {
  if (confirm(`Вы уверены, что хотите удалить ${vehicle.name}?`)) {
    try {
      await deleteVehicle(vehicle.id);
      await fetchData();
    } catch (error: any) {
      alert('Error deleting vehicle. Maybe it is used in expenses?');
    }
  }
};
</script>
