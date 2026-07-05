<template>
  <div class="min-h-screen bg-gray-50 font-sans p-8">
    <div class="max-w-4xl mx-auto">
      
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
              <router-link to="/admin/expenses" class="hover:text-bakery-600 transition-colors">{{ t('adminExpenses.breadcrumb') }}</router-link>
              <span>/</span>
              <span class="text-gray-900 font-medium">{{ t('adminExpenseTypes.breadcrumb') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ t('adminExpenseTypes.title') }}</h1>
          </div>
        </div>
        
        <button @click="openModal()" class="bg-bakery-600 hover:bg-bakery-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2">
          <span class="text-xl leading-none">+</span> {{ t('adminExpenseTypes.addType') }}
        </button>
      </div>

      <!-- Content -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div v-for="type in expenseTypes" :key="type.id" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
          <h3 class="font-bold text-gray-900">{{ type.name }}</h3>
          
          <div class="flex gap-2">
            <button @click="openModal(type)" class="text-indigo-600 hover:text-indigo-900 text-sm">✎</button>
            <button @click="confirmDelete(type)" class="text-red-600 hover:text-red-900 text-sm">🗑</button>
          </div>
        </div>
      </div>
      
    </div>

    <ExpenseTypeFormModal 
      :is-open="isModalOpen" 
      :type="selectedType" 
      @close="closeModal" 
      @save="saveType" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getExpenseTypes, createExpenseType, updateExpenseType, deleteExpenseType, type ExpenseType } from '../../../api/expenses';
import ExpenseTypeFormModal from './components/ExpenseTypeFormModal.vue';
import { useI18n } from '../../../i18n';

const { t } = useI18n();
const expenseTypes = ref<ExpenseType[]>([]);
const loading = ref(true);

const isModalOpen = ref(false);
const selectedType = ref<ExpenseType | null>(null);

const fetchData = async () => {
  loading.value = true;
  try {
    expenseTypes.value = await getExpenseTypes();
  } catch (error) {
    console.error("Failed to fetch data", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openModal = (type: ExpenseType | null = null) => {
  selectedType.value = type ? { ...type } : null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedType.value = null;
};

const saveType = async ({ id, data, resolve, reject }: { id?: number, data: Partial<ExpenseType>, resolve: Function, reject: Function }) => {
  try {
    if (id) {
      await updateExpenseType(id, data);
    } else {
      await createExpenseType(data);
    }
    await fetchData();
    resolve();
  } catch (error: any) {
    alert(t('adminExpenseTypes.errors.save'));
    reject();
  }
};

const confirmDelete = async (type: ExpenseType) => {
  if (confirm(t('adminExpenseTypes.errors.confirmDelete', { name: type.name }))) {
    try {
      await deleteExpenseType(type.id);
      await fetchData();
    } catch (error: any) {
      alert(t('adminExpenseTypes.errors.delete'));
    }
  }
};
</script>
