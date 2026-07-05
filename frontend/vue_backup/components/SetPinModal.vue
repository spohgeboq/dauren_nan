<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="isClosable ? $emit('close') : null"></div>
      
      <div class="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        <div class="p-6">
          <div class="text-center mb-6">
            <h3 class="text-xl font-extrabold text-gray-900">Задайте ПИН-код</h3>
            <p class="mt-2 text-sm text-gray-500">
              Это нужно для быстрого входа в систему без пароля.
            </p>
          </div>

          <div class="flex justify-center mb-6 space-x-3">
            <div 
              v-for="i in 4" 
              :key="i"
              class="w-12 h-14 rounded-xl flex items-center justify-center text-3xl font-bold border-2"
              :class="pinCode.length >= i ? 'border-bakery-600 bg-bakery-50 text-bakery-900' : 'border-gray-200 bg-white'"
            >
              {{ pinCode.length >= i ? '•' : '' }}
            </div>
          </div>

          <p v-if="errorMessage" class="text-center text-red-600 text-sm font-bold mb-4">{{ errorMessage }}</p>

          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="num in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
              :key="num"
              type="button"
              class="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl font-extrabold text-gray-900 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
              @click="appendNum(num)"
            >
              {{ num }}
            </button>
            <button
              type="button"
              class="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-xl font-bold text-gray-500 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
              @click="pinCode = ''"
            >
              Сброс
            </button>
            <button
              type="button"
              class="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl font-extrabold text-gray-900 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
              @click="appendNum('0')"
            >
              0
            </button>
            <button
              type="button"
              class="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-700 shadow-sm transition hover:bg-gray-100 active:bg-gray-200 active:scale-95"
              @click="deleteNum"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
              </svg>
            </button>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              v-if="isClosable"
              type="button"
              class="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              @click="$emit('close')"
            >
              Позже
            </button>
            <button
              type="button"
              class="flex-1 rounded-2xl bg-bakery-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-bakery-700 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="pinCode.length !== 4 || isLoading"
              @click="submitPin"
            >
              {{ isLoading ? 'Сохранение...' : 'Сохранить ПИН' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import api from '../api';

const props = defineProps<{
  isOpen: boolean;
  isClosable?: boolean;
}>();

const emit = defineEmits(['close', 'success']);

const pinCode = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

watch(() => props.isOpen, (val) => {
  if (val) {
    pinCode.value = '';
    errorMessage.value = '';
  }
});

const appendNum = (num: string) => {
  if (pinCode.value.length < 4) {
    pinCode.value += num;
  }
  errorMessage.value = '';
};

const deleteNum = () => {
  pinCode.value = pinCode.value.slice(0, -1);
  errorMessage.value = '';
};

const submitPin = async () => {
  if (pinCode.value.length !== 4) return;
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    await api.post('/me/pin', {
      pin_code: pinCode.value
    });
    
    // Обновляем user в localStorage
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      const u = JSON.parse(cachedUser);
      u.has_pin_code = true;
      localStorage.setItem('user', JSON.stringify(u));
    }
    
    emit('success');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Ошибка при сохранении ПИН-кода';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
