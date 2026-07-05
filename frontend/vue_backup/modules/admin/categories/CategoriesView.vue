<template>
  <div class="min-h-screen bg-gray-50 font-sans p-8">
    <div class="max-w-5xl mx-auto">
      
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
              <span class="text-gray-900 font-medium">{{ t('adminCategories.breadcrumb') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ t('adminCategories.title') }}</h1>
          </div>
        </div>
        
        <button @click="openModal()" class="bg-bakery-600 hover:bg-bakery-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2">
          <span class="text-xl leading-none">+</span> {{ t('adminCategories.addCategory') }}
        </button>
      </div>

      <!-- Content -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="category in categories" :key="category.id" class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <h3 class="text-xl font-bold text-gray-900 mb-2">{{ category.name }}</h3>
          <p class="text-gray-500 text-sm mb-4 min-h-[40px]">{{ category.description || t('adminCategories.noDescription') }}</p>
          
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <button @click="openModal(category)" class="text-sm font-medium text-indigo-600 hover:text-indigo-900">{{ t('adminCategories.edit') }}</button>
            <button @click="confirmDelete(category)" class="text-sm font-medium text-red-600 hover:text-red-900">{{ t('adminCategories.delete') }}</button>
          </div>
        </div>
      </div>
      
    </div>

    <CategoryFormModal 
      :is-open="isModalOpen" 
      :category="selectedCategory" 
      @close="closeModal" 
      @save="saveCategory" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCategories, createCategory, updateCategory, deleteCategory, type Category } from '../../../api/categories';
import CategoryFormModal from './components/CategoryFormModal.vue';
import { useI18n } from '../../../i18n';

const { t } = useI18n();
const categories = ref<Category[]>([]);
const loading = ref(true);

const isModalOpen = ref(false);
const selectedCategory = ref<Category | null>(null);

const fetchData = async () => {
  loading.value = true;
  try {
    categories.value = await getCategories();
  } catch (error) {
    console.error("Failed to fetch data", error);
    alert(t('adminCategories.loadError'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openModal = (category: Category | null = null) => {
  selectedCategory.value = category ? { ...category } : null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedCategory.value = null;
};

const saveCategory = async ({ id, data, resolve, reject }: { id?: number, data: Partial<Category>, resolve: Function, reject: Function }) => {
  try {
    if (id) {
      await updateCategory(id, data);
    } else {
      await createCategory(data);
    }
    await fetchData();
    resolve();
  } catch (error: any) {
    console.error("Failed to save category", error);
    alert(t('adminCategories.saveError'));
    reject();
  }
};

const confirmDelete = async (category: Category) => {
  if (confirm(t('adminCategories.confirmDelete', { name: category.name }))) {
    try {
      await deleteCategory(category.id);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || t('adminCategories.deleteError'));
    }
  }
};
</script>
