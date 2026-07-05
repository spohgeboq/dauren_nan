<template>
  <div class="fixed inset-0 bg-bakery-900/35 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 class="text-2xl font-bold text-gray-900">{{ t('pos.paymentModal.title') }}</h2>
        <button @click="$emit('close')" class="p-2 text-gray-400 hover:bg-bakery-50 hover:text-bakery-700 rounded-full transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-8 flex-1 overflow-y-auto">
        <div class="text-center mb-10">
          <p class="text-gray-500 font-medium mb-2">{{ t('pos.paymentModal.totalDue') }}</p>
          <div class="text-6xl font-bold text-gray-900 tracking-tight">{{ formatMoney(posStore.totalAmount) }} <span class="text-3xl text-gray-400 font-normal">₸</span></div>
        </div>

        <div class="space-y-4">
          <p class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{{ t('pos.paymentModal.chooseMethod') }}</p>
          
          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="paymentMethod = 'cash'"
              :class="['p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all', 
                paymentMethod === 'cash' ? 'border-bakery-600 bg-bakery-50 text-bakery-800 shadow-md' : 'border-gray-200 hover:border-bakery-200 text-gray-600']"
            >
              <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Banknote class="w-6 h-6 text-bakery-700" />
              </div>
              <span class="font-bold text-lg">{{ t('pos.payments.cash') }}</span>
            </button>
            <button 
              @click="paymentMethod = 'kaspi'"
              :class="['p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all', 
                paymentMethod === 'kaspi' ? 'border-bakery-600 bg-bakery-50 text-bakery-800 shadow-md' : 'border-gray-200 hover:border-bakery-200 text-gray-600']"
            >
              <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden">
                <img src="/kaspi-icon.png" alt="Kaspi" class="w-9 h-9 object-contain" />
              </div>
              <span class="font-bold text-lg">Kaspi</span>
            </button>
            <button 
              @click="paymentMethod = 'mixed'"
              class="col-span-2 p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all"
              :class="paymentMethod === 'mixed' ? 'border-bakery-600 bg-bakery-50 text-bakery-800 shadow-md' : 'border-gray-200 hover:border-bakery-200 text-gray-600'"
            >
              <span class="font-bold">{{ t('pos.paymentModal.mixed') }}</span>
            </button>
          </div>

          <!-- Mixed Payment Inputs -->
          <div v-if="paymentMethod === 'mixed'" class="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-fade-in">
            <div class="flex items-center gap-4">
              <label class="w-32 font-bold text-gray-700">{{ t('pos.paymentModal.cash') }}</label>
              <div class="relative flex-1">
                <input
                  :value="mixedCash"
                  inputmode="none"
                  pattern="[0-9]*"
                  readonly
                  class="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-white text-xl font-bold text-gray-900 shadow-sm focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500"
                  @input="setCashFromInput"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₸</span>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <label class="w-32 font-bold text-gray-700">Kaspi:</label>
              <div class="relative flex-1">
                <input type="number" :value="mixedKaspi" readonly class="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-white text-xl font-bold text-gray-500 shadow-sm" />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₸</span>
              </div>
            </div>

            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="preset in cashPresets"
                :key="preset.label"
                type="button"
                class="h-12 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 shadow-sm hover:bg-bakery-50 hover:text-bakery-800 active:scale-[0.98]"
                @click="setMixedCash(preset.amount)"
              >
                {{ preset.label }}
              </button>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="key in keypadKeys"
                :key="key"
                type="button"
                class="h-14 rounded-xl border border-gray-200 bg-white text-xl font-extrabold text-gray-800 shadow-sm hover:bg-bakery-50 hover:text-bakery-800 active:scale-[0.98]"
                @click="pressKey(key)"
              >
                {{ key }}
              </button>
              <button
                type="button"
                class="h-14 rounded-xl border border-gray-200 bg-white text-sm font-extrabold text-gray-600 shadow-sm hover:bg-bakery-50 hover:text-bakery-800 active:scale-[0.98]"
                @click="backspaceCash"
              >
                {{ t('pos.paymentModal.erase') }}
              </button>
              <button
                type="button"
                class="h-14 rounded-xl border border-gray-200 bg-white text-xl font-extrabold text-gray-800 shadow-sm hover:bg-bakery-50 hover:text-bakery-800 active:scale-[0.98]"
                @click="pressKey('0')"
              >
                0
              </button>
              <button
                type="button"
                class="h-14 rounded-xl border border-gray-200 bg-white text-sm font-extrabold text-gray-600 shadow-sm hover:bg-bakery-50 hover:text-bakery-800 active:scale-[0.98]"
                @click="setMixedCash(0)"
              >
                {{ t('pos.paymentModal.clear') }}
              </button>
            </div>

            <div class="pt-4 mt-2 border-t border-gray-200 flex justify-between items-center">
              <span class="text-sm font-medium text-gray-500">{{ t('pos.paymentModal.remaining') }}</span>
              <span :class="['font-bold text-lg', mixedRemaining === 0 ? 'text-bakery-700' : 'text-red-500']">{{ formatMoney(mixedRemaining) }} ₸</span>
            </div>
          </div>
          
          <div v-if="error" class="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium animate-shake">
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-8 border-t border-gray-100 bg-gray-50">
        <button 
          @click="submit"
          :disabled="isSubmitting || (paymentMethod === 'mixed' && mixedRemaining !== 0)"
          class="w-full py-4 rounded-2xl font-bold text-xl shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-3"
          :class="(isSubmitting || (paymentMethod === 'mixed' && mixedRemaining !== 0)) ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-bakery-600 hover:bg-bakery-700 text-white'"
        >
          <span v-if="isSubmitting" class="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
          {{ isSubmitting ? t('pos.paymentModal.submitting') : t('pos.paymentModal.submit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Banknote } from 'lucide-vue-next';
import { usePosStore } from '../store';
import type { RetailSale } from '../store';
import { useI18n } from '../../../../i18n';

const posStore = usePosStore();
const { t } = useI18n();
const emit = defineEmits<{
  close: [];
  success: [sale?: RetailSale];
}>();

const paymentMethod = ref('cash');
const mixedCash = ref(0);
const isSubmitting = ref(false);
const error = ref('');

const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const mixedKaspi = computed(() => {
  return Math.max(0, posStore.totalAmount - (mixedCash.value || 0));
});

const mixedRemaining = computed(() => {
  const sum = (mixedCash.value || 0) + mixedKaspi.value;
  return posStore.totalAmount - sum;
});

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-KZ').format(amount);
};

const cashPresets = computed(() => [
  { label: '25%', amount: Math.round(posStore.totalAmount * 0.25) },
  { label: '50%', amount: Math.round(posStore.totalAmount * 0.5) },
  { label: '75%', amount: Math.round(posStore.totalAmount * 0.75) },
  { label: 'Kaspi', amount: 0 },
  { label: t('pos.paymentModal.allCashPreset'), amount: posStore.totalAmount },
]);

const clampCash = (amount: number) => {
  return Math.min(Math.max(0, Math.trunc(amount || 0)), posStore.totalAmount);
};

const setMixedCash = (amount: number) => {
  mixedCash.value = clampCash(amount);
};

const setCashFromInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  mixedCash.value = clampCash(Number(target.value.replace(/\D/g, '')));
};

const pressKey = (key: string) => {
  const nextValue = `${mixedCash.value || ''}${key}`;
  mixedCash.value = clampCash(Number(nextValue));
};

const backspaceCash = () => {
  mixedCash.value = clampCash(Number(String(mixedCash.value || '').slice(0, -1) || 0));
};

const submit = async () => {
  if (paymentMethod.value === 'mixed' && mixedRemaining.value !== 0) {
    error.value = t('pos.paymentModal.invalidSplit');
    return;
  }

  isSubmitting.value = true;
  error.value = '';

  let details: any[] = [];
  if (paymentMethod.value === 'mixed') {
    details = [
      { method: 'cash', amount: mixedCash.value },
      { method: 'kaspi', amount: mixedKaspi.value }
    ];
  }

  try {
    const response = await posStore.submitSale(paymentMethod.value, details);
    emit('success', response.data?.data as RetailSale | undefined);
  } catch (err: any) {
    error.value = err.response?.data?.message || t('pos.paymentModal.submitError');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
