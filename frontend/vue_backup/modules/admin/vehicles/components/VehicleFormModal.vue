<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" @click="close"></div>
    
    <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
      <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="text-xl font-extrabold text-gray-900">
          {{ vehicle ? t('adminVehicles.modals.edit') : t('adminVehicles.modals.add') }}
        </h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form @submit.prevent="submit" class="p-6">
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">{{ t('adminVehicles.name') }} *</label>
            <input 
              v-model="form.name" 
              type="text" 
              required
              :placeholder="t('adminVehicles.placeholders.name')"
              class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 h-12 px-4 transition-colors bg-gray-50 hover:bg-white focus:bg-white"
            >
          </div>
          
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">{{ t('adminVehicles.licensePlate') }}</label>
            <input 
              v-model="form.license_plate" 
              type="text" 
              :placeholder="t('adminVehicles.placeholders.licensePlate')"
              class="w-full rounded-xl border-gray-300 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 h-12 px-4 transition-colors font-mono uppercase bg-gray-50 hover:bg-white focus:bg-white"
            >
          </div>

          <div class="flex items-center pt-2">
            <input 
              v-model="form.is_active" 
              type="checkbox" 
              id="isActive"
              class="rounded text-bakery-600 focus:ring-bakery-500 h-5 w-5 border-gray-300 transition-colors"
            >
            <label for="isActive" class="ml-3 block text-sm font-bold text-gray-700 select-none cursor-pointer">
              {{ t('adminVehicles.active') }}
            </label>
          </div>
        </div>
        
        <div class="mt-8 flex justify-end gap-3">
          <button 
            type="button" 
            @click="close" 
            class="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            {{ t('adminVehicles.modals.cancel') }}
          </button>
          <button 
            type="submit" 
            :disabled="saving"
            class="px-5 py-2.5 text-sm font-bold text-white bg-bakery-600 hover:bg-bakery-700 rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ t('adminVehicles.modals.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Vehicle } from '../../../../api/vehicles';
import { useI18n } from '../../../../i18n';

const props = defineProps<{
  isOpen: boolean;
  vehicle: Vehicle | null;
}>();

const emit = defineEmits(['close', 'save']);
const { t } = useI18n();

const form = ref({
  name: '',
  license_plate: '',
  is_active: true,
});

const saving = ref(false);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.vehicle) {
      form.value = { 
        name: props.vehicle.name,
        license_plate: props.vehicle.license_plate || '',
        is_active: props.vehicle.is_active,
      };
    } else {
      form.value = { name: '', license_plate: '', is_active: true };
    }
  }
});

const close = () => {
  emit('close');
};

const submit = () => {
  saving.value = true;
  emit('save', {
    id: props.vehicle?.id,
    data: { ...form.value, license_plate: form.value.license_plate || null },
    resolve: () => { saving.value = false; close(); },
    reject: () => { saving.value = false; }
  });
};
</script>
