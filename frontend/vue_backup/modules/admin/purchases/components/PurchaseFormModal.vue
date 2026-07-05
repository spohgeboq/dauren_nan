<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="close"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-xl leading-6 font-bold text-gray-900">
                {{ t('adminPurchases.modals.newRequest') }}
              </h3>
              
              <div class="mt-6">
                <form @submit.prevent="submit" class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminPurchases.modals.expectedDate') }}</label>
                    <input v-model="form.expected_date" type="date" class="mt-1 shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900" />
                  </div>
                  
                  <!-- Сырье -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminPurchases.modals.rawMaterial') }}</label>
                    <div class="mt-1">
                      <select v-model="form.raw_material_id" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900">
                        <option value="" disabled>{{ t('adminPurchases.modals.selectRawMaterial') }}</option>
                        <option v-for="rm in rawMaterials" :key="rm.id" :value="rm.id">
                          {{ rm.name }}: 1 {{ rm.purchase_unit?.short_name }} = {{ rm.qty_per_purchase_unit }} {{ rm.unit?.short_name }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Количество -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminPurchases.modals.quantity') }}</label>
                    <div class="mt-1 flex rounded-md shadow-sm">
                      <input v-model="form.quantity" type="number" step="0.01" min="0.01" required class="block w-full min-w-0 flex-1 rounded-l-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm" placeholder="2" />
                      <span class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        {{ selectedRawMaterial?.purchase_unit?.short_name || t('adminPurchases.modals.pack') }}
                      </span>
                    </div>
                  </div>

                  <!-- Ожидаемая цена -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminPurchases.modals.estimatedPrice') }}</label>
                    <div class="mt-1">
                      <input v-model="form.estimated_price" type="number" min="0" step="0.01" class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900" placeholder="15000" />
                    </div>
                  </div>

                  <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <div class="font-bold">{{ t('adminPurchases.modals.stockReceivePreview') }}</div>
                    <div class="mt-1">
                      {{ conversionPreview }}
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
import { computed, ref, reactive, watch, onMounted } from 'vue';
import { getRawMaterials, type RawMaterial } from '../../../../api/rawMaterials';
import { useI18n } from '../../../../i18n';

const { t } = useI18n();

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'save']);

const loading = ref(false);
const rawMaterials = ref<RawMaterial[]>([]);

const form = reactive({
  expected_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
  raw_material_id: '',
  quantity: '',
  estimated_price: '',
});

const selectedRawMaterial = computed(() => rawMaterials.value.find(item => Number(item.id) === Number(form.raw_material_id)));

const conversionPreview = computed(() => {
  const material = selectedRawMaterial.value;
  const quantity = Number(form.quantity || 0);

  if (!material || quantity <= 0) {
    return t('adminPurchases.modals.previewHelper');
  }

  const baseQuantity = quantity * Number(material.qty_per_purchase_unit);
  return `${quantity} ${material.purchase_unit?.short_name || t('adminPurchases.modals.pack')} = ${baseQuantity} ${material.unit?.short_name || t('adminPurchases.modals.unit')}`;
});

const loadRawMaterials = async () => {
  try {
    rawMaterials.value = (await getRawMaterials()).filter(material => material.is_active);
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  loadRawMaterials();
});

const getLocalDate = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    form.expected_date = getLocalDate();
    form.raw_material_id = '';
    form.quantity = '';
    form.estimated_price = '';
  }
});

const close = () => {
  emit('close');
};

const submit = () => {
  if (!form.raw_material_id || !form.quantity) {
    alert(t('adminPurchases.modals.errors.fillRequired'));
    return;
  }

  loading.value = true;
  emit('save', {
    data: {
      expected_date: form.expected_date || null,
      items: [
        {
          raw_material_id: Number(form.raw_material_id),
          quantity: Number(form.quantity),
          estimated_price: form.estimated_price ? Number(form.estimated_price) : null,
        },
      ],
    },
    resolve: () => { loading.value = false; close(); },
    reject: () => { loading.value = false; },
  });
};
</script>
