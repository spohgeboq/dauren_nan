<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="close"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-xl leading-6 font-bold text-gray-900">
                {{ user?.id ? 'Редактировать сотрудника' : 'Новый сотрудник' }}
              </h3>
              
              <div class="mt-6">
                <form @submit.prevent="submit" class="space-y-6">
                  
                  <!-- Имя -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Имя Фамилия</label>
                    <div class="mt-1">
                      <input v-model="form.name" type="text" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900\" placeholder="ФИО" />
                    </div>
                  </div>

                  <!-- Email / Логин -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Email (Логин)</label>
                    <div class="mt-1">
                      <input v-model="form.email" type="email" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900\" placeholder="user@daurennan.kz" />
                    </div>
                  </div>

                  <!-- Пароль -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Пароль {{ user?.id ? '(оставьте пустым, если не меняете)' : '' }}</label>
                    <div class="mt-1">
                      <input v-model="form.password" type="password" :required="!user?.id" minlength="6" class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900\" placeholder="******" />
                    </div>
                  </div>

                  <!-- Роль -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Должность (Роль)</label>
                    <div class="mt-1">
                      <select v-model="form.role" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900\">
                        <option value="" disabled>Выберите роль</option>
                        <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.name }}</option>
                      </select>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">
                      <span v-if="form.role === 'admin'">Имеет полный доступ ко всей системе.</span>
                      <span v-if="form.role === 'seller'">Имеет доступ только к POS кассе.</span>
                      <span v-if="form.role === 'baker'">Имеет доступ только к цеху (выпечка).</span>
                      <span v-if="form.role === 'driver'">Имеет доступ к маршрутам и доставке.</span>
                    </p>
                  </div>

                  <div v-if="form.role === 'baker'" class="rounded-2xl border border-bakery-100 bg-bakery-50/50 p-4">
                    <div class="mb-3">
                      <label class="block text-sm font-bold text-gray-900">{{ t('adminUsers.bakerProducts.title') }}</label>
                      <p class="mt-1 text-xs font-medium text-gray-500">{{ t('adminUsers.bakerProducts.hint') }}</p>
                    </div>

                    <div v-if="activeProducts.length === 0" class="rounded-xl border border-dashed border-gray-200 bg-white p-3 text-sm font-bold text-gray-400">
                      {{ t('adminUsers.bakerProducts.empty') }}
                    </div>

                    <div v-else class="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                      <label
                        v-for="product in activeProducts"
                        :key="product.id"
                        class="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-bakery-200 hover:bg-bakery-50"
                      >
                        <input
                          v-model="form.production_product_ids"
                          type="checkbox"
                          :value="product.id"
                          class="h-4 w-4 rounded border-gray-300 text-bakery-600 focus:ring-bakery-500"
                        />
                        <span class="min-w-0 truncate">{{ product.name }}</span>
                      </label>
                    </div>
                  </div>

                  <div v-if="form.role === 'driver'" class="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <label class="block text-sm font-bold text-gray-900">{{ t('adminUsers.deliveryStockMode.title') }}</label>
                    <p class="mt-1 text-xs font-medium text-gray-500">{{ t('adminUsers.deliveryStockMode.hint') }}</p>
                    <div class="mt-3 grid gap-2">
                      <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-white bg-white px-3 py-3 text-sm transition hover:border-emerald-200">
                        <input
                          v-model="form.delivery_stock_mode"
                          type="radio"
                          value="warehouse"
                          class="mt-1 h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>
                          <span class="block font-extrabold text-gray-900">{{ t('adminUsers.deliveryStockMode.warehouse.title') }}</span>
                          <span class="mt-0.5 block text-xs font-medium leading-5 text-gray-500">{{ t('adminUsers.deliveryStockMode.warehouse.text') }}</span>
                        </span>
                      </label>
                      <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-white bg-white px-3 py-3 text-sm transition hover:border-emerald-200">
                        <input
                          v-model="form.delivery_stock_mode"
                          type="radio"
                          value="driver_transfer"
                          class="mt-1 h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>
                          <span class="block font-extrabold text-gray-900">{{ t('adminUsers.deliveryStockMode.driverTransfer.title') }}</span>
                          <span class="mt-0.5 block text-xs font-medium leading-5 text-gray-500">{{ t('adminUsers.deliveryStockMode.driverTransfer.text') }}</span>
                        </span>
                      </label>
                    </div>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" @click="submit" :disabled="loading" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-bakery-600 text-base font-medium text-white hover:bg-bakery-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
            <span v-if="loading">Сохранение...</span>
            <span v-else>Сохранить</span>
          </button>
          <button type="button" @click="close" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm bg-white text-gray-900\">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue';
import type { User } from '../../../../api/users';
import type { Product } from '../../../../api/products';
import { useI18n } from '../../../../i18n';

const props = defineProps<{
  isOpen: boolean;
  user: User | null;
  roles: any[];
  products: Product[];
}>();

const emit = defineEmits(['close', 'save']);
const { t } = useI18n();

const loading = ref(false);

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: '',
  delivery_stock_mode: 'warehouse' as 'warehouse' | 'driver_transfer',
  production_product_ids: [] as number[],
});

const activeProducts = computed(() => {
  return props.products
    .filter(product => product.is_active !== false)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.user) {
      form.name = props.user.name;
      form.email = props.user.email;
      form.password = '';
      form.role = props.user.roles && props.user.roles.length > 0 ? props.user.roles[0].name : '';
      form.delivery_stock_mode = props.user.delivery_stock_mode || 'warehouse';
      form.production_product_ids = (props.user.assigned_production_products || []).map(product => product.id);
    } else {
      form.name = '';
      form.email = '';
      form.password = '';
      form.role = '';
      form.delivery_stock_mode = 'warehouse';
      form.production_product_ids = [];
    }
  }
});

const close = () => {
  emit('close');
};

const submit = () => {
  if (!form.name || !form.email || !form.role || (!props.user?.id && !form.password)) {
    alert("Пожалуйста, заполните все обязательные поля");
    return;
  }

  if (form.role === 'baker' && form.production_product_ids.length === 0) {
    alert(t('adminUsers.bakerProducts.required'));
    return;
  }

  loading.value = true;
  emit('save', {
    id: props.user?.id,
    data: {
      ...form,
      delivery_stock_mode: form.role === 'driver' ? form.delivery_stock_mode : 'warehouse',
      production_product_ids: form.role === 'baker' ? form.production_product_ids : [],
    },
    resolve: () => { loading.value = false; close(); },
    reject: () => { loading.value = false; },
  });
};
</script>
