<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="close"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-xl leading-6 font-bold text-gray-900">
                {{ type?.id ? t('adminExpenseTypes.modals.editType') : t('adminExpenseTypes.modals.newType') }}
              </h3>
              
              <div class="mt-6">
                <form @submit.prevent="submit" class="space-y-6">
                  <!-- Название -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminExpenseTypes.modals.name') }}</label>
                    <div class="mt-1">
                      <input v-model="form.name" type="text" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900\" />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" @click="submit" :disabled="loading" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-bakery-600 text-base font-medium text-white hover:bg-bakery-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
            <span v-if="loading">{{ t('common.saving') }}</span>
            <span v-else>{{ t('common.save') }}</span>
          </button>
          <button type="button" @click="close" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm bg-white text-gray-900\">
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { ExpenseType } from '../../../../api/expenses';
import { useI18n } from '../../../../i18n';

const { t } = useI18n();

const props = defineProps<{
  isOpen: boolean;
  type: ExpenseType | null;
}>();

const emit = defineEmits(['close', 'save']);

const loading = ref(false);

const form = reactive({
  name: '',
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.type) {
      form.name = props.type.name;
    } else {
      form.name = '';
    }
  }
});

const close = () => {
  emit('close');
};

const submit = () => {
  if (!form.name) {
    alert(t('adminExpenseTypes.modals.errors.fillName'));
    return;
  }

  loading.value = true;
  emit('save', { id: props.type?.id, data: { ...form }, resolve: () => { loading.value = false; close(); }, reject: () => { loading.value = false; } });
};
</script>
