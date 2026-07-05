<template>
  <div class="min-h-screen bg-gray-50 font-sans p-8">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <!-- Back to Main Menu Button -->
          <router-link 
            to="/dashboard" 
            class="flex items-center justify-center gap-2 px-3 sm:px-4 h-12 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-bakery-500 touch-manipulation group"
            title="В главное меню"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:-translate-x-1 transition-transform">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span class="font-bold text-sm hidden sm:inline">{{ t('common.backToMenu') }}</span>
          </router-link>

          <div>
            <div class="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <router-link to="/admin" class="hover:text-bakery-600 transition-colors">Dashboard</router-link>
              <span>/</span>
              <span class="text-gray-900 font-medium">{{ t('adminExpenses.breadcrumb') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ t('adminExpenses.title') }}</h1>
          </div>
        </div>
        
        <div class="flex gap-4">
          <router-link to="/admin/expense-types" class="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors bg-white text-gray-900\">
            {{ t('adminExpenses.typeDirectory') }}
          </router-link>
          <button @click="openModal()" class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2">
            <span class="text-xl leading-none">+</span> {{ t('adminExpenses.addExpense') }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>

      <div v-else class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminExpenses.columns.date') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminExpenses.columns.type') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminExpenses.columns.employeeVehicle') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminExpenses.columns.comment') }}</th>
              <th scope="col" class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminExpenses.columns.receipt') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminExpenses.columns.author') }}</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminExpenses.columns.amount') }}</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminExpenses.columns.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="expense in expenses" :key="expense.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ expense.date }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                  {{ expense.expense_type?.name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="font-medium text-gray-900" v-if="expense.employee">
                  👤 {{ expense.employee.name }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5" v-if="expense.vehicle">
                  🚗 {{ expense.vehicle.name }} <span class="bg-gray-100 text-gray-700 px-1 py-0.5 rounded font-mono text-[10px]">{{ expense.vehicle.license_plate }}</span>
                </div>
                <span class="text-gray-400 text-xs" v-if="!expense.employee && !expense.vehicle">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {{ expense.comment || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                <a 
                  v-if="expense.attachment_url" 
                  :href="expense.attachment_url" 
                  target="_blank" 
                  class="text-bakery-600 hover:text-bakery-800 font-bold inline-flex items-center gap-1 bg-bakery-50 px-2.5 py-1.5 rounded-lg text-xs"
                >
                  {{ t('adminExpenses.receiptBtn') }}
                </a>
                <span v-else class="text-gray-400 text-xs">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ expense.creator?.name || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                - {{ Number(expense.amount).toLocaleString('ru-RU') }} ₸
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="confirmDelete(expense)" class="text-red-600 hover:text-red-900">{{ t('adminExpenses.delete') }}</button>
              </td>
            </tr>
            <tr v-if="expenses.length === 0">
              <td colspan="8" class="px-6 py-10 text-center text-gray-500">
                {{ t('adminExpenses.empty') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </div>

    <ExpenseFormModal 
      :is-open="isModalOpen" 
      :expense-types="expenseTypes"
      @close="closeModal" 
      @save="saveExpense" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getExpenses, getExpenseTypes, createExpense, deleteExpense, type Expense, type ExpenseType } from '../../../api/expenses';
import ExpenseFormModal from './components/ExpenseFormModal.vue';
import { useI18n } from '../../../i18n';

const { t } = useI18n();
const expenses = ref<Expense[]>([]);
const expenseTypes = ref<ExpenseType[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const [exp, types] = await Promise.all([
      getExpenses(),
      getExpenseTypes()
    ]);
    expenses.value = exp;
    expenseTypes.value = types;
  } catch (error) {
    console.error("Failed to fetch data", error);
    alert(t('adminExpenses.errors.load'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveExpense = async ({ data, resolve, reject }: { data: FormData | Partial<Expense>, resolve: Function, reject: Function }) => {
  try {
    await createExpense(data);
    await fetchData();
    resolve();
  } catch (error: any) {
    console.error("Failed to save expense", error);
    alert(t('adminExpenses.errors.save'));
    reject();
  }
};

const confirmDelete = async (expense: Expense) => {
  if (confirm(t('adminExpenses.errors.confirmDelete', { amount: expense.amount }))) {
    try {
      await deleteExpense(expense.id);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || t('adminExpenses.errors.delete'));
    }
  }
};
</script>
