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
              <span class="text-gray-900 font-medium">{{ t('adminProducts.breadcrumb') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ t('adminProducts.title') }}</h1>
          </div>
        </div>
        
        <div class="flex flex-col gap-2 sm:flex-row">
          <router-link to="/admin/recipes" class="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            {{ t('adminProducts.recipesBtn') }}
          </router-link>
          <button @click="openModal()" class="bg-bakery-600 hover:bg-bakery-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center gap-2">
            <span class="text-xl leading-none">+</span> {{ t('adminProducts.addProduct') }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
      </div>

      <div v-else-if="products.length === 0" class="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
        <div class="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">📦</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('adminProducts.emptyTitle') }}</h3>
        <p class="text-gray-500 mb-6">{{ t('adminProducts.emptyText') }}</p>
        <button @click="openModal()" class="text-bakery-600 font-medium hover:text-bakery-700">{{ t('adminProducts.startAdding') }}</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- Product Cards -->
        <div v-for="product in products" :key="product.id" class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group relative">
          
          <div class="h-48 w-full bg-gray-100 relative overflow-hidden">
            <img v-if="product.image_url" :src="product.image_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🥖</div>
            
            <div class="absolute top-3 right-3 flex gap-2">
              <span v-if="!product.is_active" class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">{{ t('adminProducts.inactive') }}</span>
            </div>
            
            <!-- Actions Overlay -->
            <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button @click="openModal(product)" class="bg-white text-gray-900 p-2 rounded-xl hover:bg-gray-100 shadow-sm transition-colors" title="Редактировать">
                {{ t('adminProducts.edit') }}
              </button>
              <router-link to="/admin/recipes" class="bg-white text-gray-900 p-2 rounded-xl hover:bg-gray-100 shadow-sm transition-colors" title="Рецепты">
                {{ t('adminProducts.recipe') }}
              </router-link>
            </div>
          </div>
          
          <div class="p-5">
            <div class="text-xs text-bakery-600 font-bold mb-1 uppercase tracking-wider">{{ product.category?.name || t('adminProducts.noCategory') }}</div>
            <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1" :title="product.name">{{ product.name }}</h3>
            
            <div class="flex justify-between items-end mt-4 pt-4 border-t border-gray-50">
              <div>
                <p class="text-xs text-gray-500 mb-1">{{ t('adminProducts.retail') }}</p>
                <p class="font-bold text-gray-900">{{ product.retail_price }} ₸ <span class="text-xs font-normal text-gray-500">/ {{ product.unit?.short_name }}</span></p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500 mb-1">{{ t('adminProducts.wholesale') }}</p>
                <p class="font-medium text-gray-700">{{ product.wholesale_price }} ₸</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>

    <ProductFormModal 
      :is-open="isModalOpen" 
      :product="selectedProduct" 
      :categories="categories"
      :units="units"
      @close="closeModal" 
      @save="saveProduct"
      @delete="confirmDeleteProduct"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getProducts, getCategories, getUnits, createProduct, updateProduct, deleteProduct, type Product } from '../../../api/products';
import ProductFormModal from './components/ProductFormModal.vue';
import { useI18n } from '../../../i18n';

const { t } = useI18n();
const products = ref<Product[]>([]);
const categories = ref<any[]>([]);
const units = ref<any[]>([]);
const loading = ref(true);

const isModalOpen = ref(false);
const selectedProduct = ref<Product | null>(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const [prods, cats, uns] = await Promise.all([
      getProducts(),
      getCategories(),
      getUnits()
    ]);
    products.value = prods;
    categories.value = cats;
    units.value = uns;
  } catch (error) {
    console.error("Failed to fetch data", error);
    alert(t('adminProducts.loadError'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openModal = (product: Product | null = null) => {
  selectedProduct.value = product ? { ...product } : null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedProduct.value = null;
};

const saveProduct = async ({ id, formData, resolve, reject }: { id?: number, formData: FormData, resolve: Function, reject: Function }) => {
  try {
    if (id) {
      await updateProduct(id, formData);
    } else {
      await createProduct(formData);
    }
    await fetchData(); // refresh list
    resolve();
  } catch (error) {
    console.error("Failed to save product", error);
    alert(t('adminProducts.saveError'));
    reject();
  }
};

const confirmDeleteProduct = async (product: Product) => {
  if (confirm(`Вы уверены, что хотите удалить товар "${product.name}"?`)) {
    try {
      await deleteProduct(product.id);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete product", error);
      alert('Ошибка при удалении товара. Возможно, он уже используется в других разделах.');
    }
  }
};
</script>
