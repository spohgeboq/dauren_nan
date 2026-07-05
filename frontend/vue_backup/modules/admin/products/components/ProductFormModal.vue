<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="close"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-xl leading-6 font-bold text-gray-900" id="modal-headline">
                {{ product?.id ? 'Редактировать товар' : 'Новый товар' }}
              </h3>
              
              <div class="mt-6">
                <form @submit.prevent="submit" class="space-y-6">
                  <!-- Фото -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Изображение товара</label>
                    <div class="mt-2 flex items-center gap-6">
                      <div class="h-24 w-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-dashed border-gray-300 flex items-center justify-center relative group cursor-pointer bg-white text-gray-900\" @click="fileInput?.click()">
                        <img v-if="previewUrl" :src="previewUrl" class="h-full w-full object-cover" />
                        <span v-else class="text-gray-400 text-3xl">+</span>
                        <div v-if="previewUrl" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span class="text-white text-xs font-bold">Изменить</span>
                        </div>
                      </div>
                      <input type="file" ref="fileInput" class="hidden" accept="image/jpeg, image/png, image/webp" @change="handleFileUpload" />
                      <div class="text-sm text-gray-500">
                        <p class="font-medium text-gray-900">Загрузите красивое фото</p>
                        <p>PNG, JPG, WEBP до 2MB.</p>
                        <p>Это фото увидят продавцы в POS.</p>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <!-- Название -->
                    <div class="sm:col-span-2">
                      <label class="block text-sm font-medium text-gray-700">Название</label>
                      <div class="mt-1">
                        <input v-model="form.name" type="text" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900\" placeholder="Например, Хлеб Бородинский" />
                      </div>
                    </div>

                    <!-- Категория -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Категория</label>
                      <div class="mt-1">
                        <select v-model="form.category_id" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900\">
                          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                        </select>
                      </div>
                    </div>

                    <!-- Единица измерения -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Ед. измерения</label>
                      <div class="mt-1">
                        <select v-model="form.unit_id" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900\">
                          <option v-for="unit in units" :key="unit.id" :value="unit.id">{{ unit.name }} ({{ unit.short_name }})</option>
                        </select>
                      </div>
                    </div>

                    <!-- Розничная цена -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Розничная цена (POS)</label>
                      <div class="mt-1 relative rounded-md shadow-sm">
                        <input v-model="form.retail_price" type="number" required min="0" step="0.01" class="focus:ring-bakery-500 focus:border-bakery-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900\" placeholder="0.00" />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span class="text-gray-500 sm:text-sm">₸</span>
                        </div>
                      </div>
                    </div>

                    <!-- Оптовая цена -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Оптовая цена (Магазины)</label>
                      <div class="mt-1 relative rounded-md shadow-sm">
                        <input v-model="form.wholesale_price" type="number" required min="0" step="0.01" class="focus:ring-bakery-500 focus:border-bakery-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900\" placeholder="0.00" />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span class="text-gray-500 sm:text-sm">₸</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Срок годности -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Срок годности (дней)</label>
                      <div class="mt-1">
                        <input v-model="form.freshness_days" type="number" required min="1" class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900\" placeholder="1" />
                      </div>
                    </div>
                  </div>

                  <!-- Активен -->
                  <div class="flex items-start mt-4">
                    <div class="flex items-center h-5">
                      <input id="is_active" v-model="form.is_active" type="checkbox" class="focus:ring-bakery-500 h-4 w-4 text-bakery-600 border-gray-300 rounded bg-white text-gray-900\" />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="is_active" class="font-medium text-gray-700">Активен</label>
                      <p class="text-gray-500">Товар доступен для продажи и производства.</p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row sm:justify-between gap-3">
          <div v-if="product?.id">
            <button type="button" @click="confirmDelete" class="w-full sm:w-auto inline-flex justify-center rounded-xl border border-red-200 shadow-sm px-4 py-2 bg-red-50 text-base font-medium text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm transition-colors">
              Удалить
            </button>
          </div>
          <div v-else></div>
          
          <div class="flex flex-col sm:flex-row gap-3">
            <button type="button" @click="close" class="w-full sm:w-auto inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 sm:text-sm transition-colors">
              Отмена
            </button>
            <button type="button" @click="submit" :disabled="loading" class="w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-bakery-600 text-base font-medium text-white hover:bg-bakery-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 sm:text-sm disabled:opacity-50 transition-colors">
              <span v-if="loading">Сохранение...</span>
              <span v-else>Сохранить товар</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { Product } from '../../../../api/products';

const props = defineProps<{
  isOpen: boolean;
  product: Product | null;
  categories: any[];
  units: any[];
}>();

const emit = defineEmits(['close', 'save', 'delete']);

const loading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

const form = reactive({
  name: '',
  category_id: '' as number | '',
  unit_id: '' as number | '',
  retail_price: '',
  wholesale_price: '',
  freshness_days: 1,
  is_active: true,
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.product) {
      form.name = props.product.name;
      form.category_id = props.product.category_id;
      form.unit_id = props.product.unit_id;
      form.retail_price = props.product.retail_price.toString();
      form.wholesale_price = props.product.wholesale_price.toString();
      form.freshness_days = props.product.freshness_days;
      form.is_active = props.product.is_active;
      previewUrl.value = props.product.image_url;
    } else {
      form.name = '';
      form.category_id = props.categories.length > 0 ? props.categories[0].id : '';
      form.unit_id = props.units.length > 0 ? props.units[0].id : '';
      form.retail_price = '';
      form.wholesale_price = '';
      form.freshness_days = 1;
      form.is_active = true;
      previewUrl.value = null;
    }
    selectedFile.value = null;
  }
});

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    previewUrl.value = URL.createObjectURL(selectedFile.value);
  }
};

const close = () => {
  emit('close');
};

const confirmDelete = () => {
  if (props.product) {
    emit('delete', props.product);
    close();
  }
};

const submit = () => {
  if (!form.name || !form.category_id || !form.unit_id || !form.retail_price || !form.wholesale_price) {
    alert("Пожалуйста, заполните все обязательные поля");
    return;
  }

  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('category_id', form.category_id.toString());
  formData.append('unit_id', form.unit_id.toString());
  formData.append('retail_price', form.retail_price);
  formData.append('wholesale_price', form.wholesale_price);
  formData.append('freshness_days', form.freshness_days.toString());
  formData.append('is_active', form.is_active ? '1' : '0');
  
  if (selectedFile.value) {
    formData.append('image', selectedFile.value);
  }

  loading.value = true;
  emit('save', { id: props.product?.id, formData, resolve: () => { loading.value = false; close(); }, reject: () => { loading.value = false; } });
};
</script>
