<template>
  <div class="w-96 bg-white border-l border-gray-200 flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 relative">
    <!-- Cart Header -->
    <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
      <h2 class="text-2xl font-bold text-gray-900">{{ t('pos.cart.title') }}</h2>
      <button 
        @click="posStore.clearCart"
        class="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
        v-if="posStore.cart.length > 0"
      >
        {{ t('pos.cart.clear') }}
      </button>
    </div>

    <!-- Cart Items -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
      <div v-if="posStore.cart.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
        <svg class="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        <p class="text-lg font-medium">{{ t('pos.cart.empty') }}</p>
      </div>
      
      <div 
        v-for="item in posStore.cart" 
        :key="item.product.id"
        class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 relative group"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 pr-4">
            <h4 class="font-bold text-gray-900 leading-tight">{{ item.product.name }}</h4>
            <p class="text-sm text-gray-500">{{ formatMoney(item.product.retail_price) }} {{ t('pos.cart.perPiece') }}</p>
          </div>
          <button @click="posStore.removeFromCart(item.product.id)" class="text-gray-300 hover:text-red-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="flex items-center justify-between mt-1">
          <div class="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
            <button 
              @click="posStore.updateQuantity(item.product.id, item.quantity - 1)"
              class="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-bakery-600 hover:bg-bakery-50 transition-colors"
            >
              -
            </button>
            <span class="w-6 text-center font-bold text-gray-900">{{ item.quantity }}</span>
            <button 
              @click="posStore.updateQuantity(item.product.id, item.quantity + 1)"
              class="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-bakery-600 hover:bg-bakery-50 transition-colors"
            >
              +
            </button>
          </div>
          <div class="font-bold text-lg text-bakery-800">
            {{ formatMoney(item.product.retail_price * item.quantity) }} ₸
          </div>
        </div>
      </div>
    </div>

    <!-- Cart Footer -->
    <div class="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.02)]">
      <div class="flex justify-between items-end mb-6">
        <span class="text-gray-500 font-medium">{{ t('pos.cart.totalDue') }}</span>
        <span class="text-4xl font-bold text-gray-900 tracking-tight">{{ formatMoney(posStore.totalAmount) }} <span class="text-2xl text-gray-500 font-normal">₸</span></span>
      </div>
      <button 
        @click="$emit('checkout')"
        :disabled="posStore.cart.length === 0"
        :class="['w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98]', 
          posStore.cart.length > 0 ? 'bg-bakery-600 hover:bg-bakery-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none']"
      >
        {{ t('pos.cart.pay') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePosStore } from '../store';
import { useI18n } from '../../../../i18n';

const posStore = usePosStore();
defineEmits(['checkout']);
const { t } = useI18n();

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-KZ').format(amount);
};
</script>
