<template>
  <div 
    class="overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group"
    :class="isAvailable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : 'cursor-not-allowed opacity-80'"
    @click="addProduct"
  >
    <div class="aspect-square bg-[#efe8e3] relative overflow-hidden flex items-center justify-center">
      <img 
        v-if="product.image_url" 
        :src="product.image_url" 
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <!-- Fallback if no image -->
      <div v-else class="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        <span class="text-6xl drop-shadow-md">🍞</span>
      </div>
      
      <!-- Overlay Add Icon -->
      <div
        v-if="!isAvailable"
        class="absolute inset-x-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-center text-xs font-bold text-red-500"
      >
        {{ t('pos.product.unavailable') }}
      </div>

      <div
        v-else
        class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
      >
        <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </div>
      </div>
    </div>
    <div class="px-4 py-3 bg-white">
      <h3 class="font-bold text-gray-900 text-[15px] leading-tight mb-1 truncate">{{ product.name }}</h3>
      <div class="flex items-center justify-between text-gray-400">
        <p class="font-semibold text-[15px] text-gray-500">{{ formatMoney(product.retail_price) }} ₸</p>
        <p class="text-[11px] font-semibold text-gray-400">
          {{ formatQuantity(stockQuantity) }} {{ t('pos.product.pcs') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { Product } from '../store';
import { useI18n } from '../../../../i18n';

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true
  },
  stockQuantity: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['add']);
const { t } = useI18n();

const isAvailable = computed(() => props.stockQuantity > 0);

const addProduct = () => {
  if (!isAvailable.value) {
    return;
  }

  emit('add');
};

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-KZ').format(amount);
};

const formatQuantity = (amount: number) => {
  return new Intl.NumberFormat('ru-KZ', {
    maximumFractionDigits: 2,
  }).format(amount || 0);
};
</script>
