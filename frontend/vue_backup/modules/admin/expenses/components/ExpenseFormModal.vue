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
                {{ t('adminExpenses.modals.newExpense') }}
              </h3>
              
              <div class="mt-6">
                <form @submit.prevent="submit" class="space-y-6">
                  
                  <!-- Дата -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminExpenses.modals.date') }}</label>
                    <div class="mt-1">
                      <input v-model="form.date" type="date" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900" />
                    </div>
                  </div>

                  <!-- Тип расхода -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminExpenses.modals.type') }}</label>
                    <div class="mt-1">
                      <select v-model="form.expense_type_id" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900">
                        <option value="" disabled>{{ t('adminExpenses.modals.selectCategory') }}</option>
                        <option v-for="type in expenseTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
                      </select>
                    </div>
                  </div>

                  <!-- Сотрудник -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminExpenses.modals.employee') }}</label>
                    <div class="mt-1">
                      <select v-model="form.employee_id" class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900">
                        <option value="">{{ t('adminExpenses.modals.noEmployee') }}</option>
                        <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
                      </select>
                    </div>
                  </div>

                  <!-- Автомобиль -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminExpenses.modals.vehicle') }}</label>
                    <div class="mt-1">
                      <select v-model="form.vehicle_id" class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900">
                        <option value="">{{ t('adminExpenses.modals.noVehicle') }}</option>
                        <option v-for="veh in vehicles" :key="veh.id" :value="veh.id">{{ veh.name }} ({{ veh.license_plate || t('adminExpenses.modals.noLicensePlate') }})</option>
                      </select>
                    </div>
                  </div>

                  <!-- Сумма -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminExpenses.modals.amount') }}</label>
                    <div class="mt-1">
                      <input v-model="form.amount" type="number" min="0" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900" placeholder="5000" />
                    </div>
                  </div>

                  <!-- Фото чека / Вложение -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminExpenses.modals.receipt') }}</label>
                    <div class="mt-1">
                      <input 
                        ref="fileInput"
                        type="file" 
                        accept="image/*"
                        @change="onFileChange" 
                        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-bakery-50 file:text-bakery-700 hover:file:bg-bakery-100" 
                      />
                    </div>
                  </div>

                  <!-- Комментарий -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ t('adminExpenses.modals.comment') }}</label>
                    <div class="mt-1">
                      <textarea v-model="form.comment" rows="3" class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white text-gray-900" :placeholder="t('adminExpenses.modals.commentPlaceholder')"></textarea>
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
          <button type="button" @click="close" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm bg-white text-gray-900">
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import type { ExpenseType } from '../../../../api/expenses';
import { getUsers, type User } from '../../../../api/users';
import { getVehicles, type Vehicle } from '../../../../api/vehicles';
import { useI18n } from '../../../../i18n';

const { t } = useI18n();

const props = defineProps<{
  isOpen: boolean;
  expenseTypes: ExpenseType[];
}>();

const emit = defineEmits(['close', 'save']);

const loading = ref(false);
const employees = ref<User[]>([]);
const vehicles = ref<Vehicle[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  expense_type_id: '',
  amount: '',
  comment: '',
  employee_id: '',
  vehicle_id: '',
});

const fetchModalData = async () => {
  try {
    const [u, v] = await Promise.all([getUsers(), getVehicles()]);
    employees.value = u;
    vehicles.value = v;
  } catch (error) {
    console.error("Failed to fetch modal dependencies", error);
  }
};

onMounted(() => {
  fetchModalData();
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    form.date = new Date().toISOString().slice(0, 10);
    form.expense_type_id = '';
    form.amount = '';
    form.comment = '';
    form.employee_id = '';
    form.vehicle_id = '';
    selectedFile.value = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
});

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  } else {
    selectedFile.value = null;
  }
};

const close = () => {
  emit('close');
};

const submit = () => {
  if (!form.date || !form.expense_type_id || !form.amount) {
    alert(t('adminExpenses.modals.errors.fillRequired'));
    return;
  }

  loading.value = true;
  
  const formData = new FormData();
  formData.append('date', form.date);
  formData.append('expense_type_id', form.expense_type_id);
  formData.append('amount', form.amount);
  if (form.comment) formData.append('comment', form.comment);
  if (form.employee_id) formData.append('employee_id', form.employee_id);
  if (form.vehicle_id) formData.append('vehicle_id', form.vehicle_id);
  if (selectedFile.value) {
    formData.append('attachment', selectedFile.value);
  }

  emit('save', { 
    data: formData, 
    resolve: () => { loading.value = false; close(); }, 
    reject: () => { loading.value = false; } 
  });
};
</script>
