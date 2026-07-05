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
              <span class="text-gray-900 font-medium">{{ t('adminUsers.breadcrumb') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ t('adminUsers.title') }}</h1>
          </div>
        </div>
        
        <button @click="openModal()" class="bg-bakery-600 hover:bg-bakery-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2">
          <span class="text-xl leading-none">+</span> {{ t('adminUsers.createUser') }}
        </button>
      </div>

      <!-- Content -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
      </div>

      <div v-else>
        <!-- Filters -->
        <div class="mb-6 flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <input 
              v-model="searchQuery" 
              type="text" 
              :placeholder="t('adminUsers.searchPlaceholder')" 
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:ring-bakery-500 focus:border-bakery-500 shadow-sm transition-shadow"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div class="sm:w-64 relative">
            <select 
              v-model="selectedRole" 
              class="w-full rounded-xl border border-gray-300 bg-white pl-4 pr-10 py-2.5 text-sm appearance-none focus:ring-bakery-500 focus:border-bakery-500 shadow-sm transition-shadow"
            >
              <option value="">{{ t('adminUsers.allRoles') }}</option>
              <option v-for="role in roles" :key="role.id" :value="role.name">
                {{ role.name }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminUsers.columns.nameAndContacts') }}</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminUsers.columns.roleAndAccess') }}</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminUsers.columns.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-bakery-100 text-bakery-600 rounded-full flex items-center justify-center font-bold">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-bold text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="space-y-2">
                  <span v-if="user.roles && user.roles.length > 0" class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800">
                    {{ user.roles[0].name }}
                  </span>
                  <span v-else class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-100 text-gray-800">
                    {{ t('adminUsers.noRole') }}
                  </span>
                  <div v-if="primaryRole(user) === 'baker'" class="max-w-md text-xs font-semibold text-gray-500">
                    {{ bakerProductsLabel(user) }}
                  </div>
                  <div v-if="primaryRole(user) === 'driver'" class="max-w-md text-xs font-semibold text-gray-500">
                    {{ driverStockModeLabel(user) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openModal(user)" class="text-indigo-600 hover:text-indigo-900 mr-4">{{ t('adminUsers.edit') }}</button>
                <button @click="confirmDelete(user)" class="text-red-600 hover:text-red-900">{{ t('adminUsers.delete') }}</button>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="3" class="px-6 py-12 text-center text-gray-500">
                <div class="flex flex-col items-center justify-center">
                  <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p class="text-sm font-medium">{{ t('adminUsers.emptyState') }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
      
    </div>

    <UserFormModal 
      :is-open="isModalOpen" 
      :user="selectedUser" 
      :roles="roles"
      :products="products"
      @close="closeModal" 
      @save="saveUser" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getUsers, getRoles, createUser, updateUser, deleteUser, type User } from '../../../api/users';
import { getProducts, type Product } from '../../../api/products';
import UserFormModal from './components/UserFormModal.vue';
import { useI18n } from '../../../i18n';

const { t } = useI18n();
const users = ref<User[]>([]);
const roles = ref<any[]>([]);
const products = ref<Product[]>([]);
const loading = ref(true);

const isModalOpen = ref(false);
const selectedUser = ref<User | null>(null);

const searchQuery = ref('');
const selectedRole = ref('');

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    if (selectedRole.value) {
      const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : '';
      if (userRole !== selectedRole.value) {
        return false;
      }
    }
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const matchesName = user.name?.toLowerCase().includes(query) ?? false;
      const matchesEmail = user.email?.toLowerCase().includes(query) ?? false;
      if (!matchesName && !matchesEmail) {
        return false;
      }
    }
    
    return true;
  });
});

const fetchData = async () => {
  loading.value = true;
  try {
    const [usr, rls, productData] = await Promise.all([
      getUsers(),
      getRoles(),
      getProducts(),
    ]);
    users.value = usr;
    roles.value = rls;
    products.value = productData;
  } catch (error) {
    console.error("Failed to fetch data", error);
    alert(t('adminUsers.loadError'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openModal = (user: User | null = null) => {
  selectedUser.value = user ? { ...user } : null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedUser.value = null;
};

const primaryRole = (user: User) => user.roles && user.roles.length > 0 ? user.roles[0].name : '';

const bakerProductsLabel = (user: User) => {
  const assignedProducts = user.assigned_production_products || [];

  if (assignedProducts.length === 0) {
    return t('adminUsers.bakerProducts.none');
  }

  return t('adminUsers.bakerProducts.assigned', {
    count: assignedProducts.length,
    products: assignedProducts.map(product => product.name).join(', '),
  });
};

const driverStockModeLabel = (user: User) => {
  return user.delivery_stock_mode === 'driver_transfer'
    ? t('adminUsers.deliveryStockMode.driverTransfer.title')
    : t('adminUsers.deliveryStockMode.warehouse.title');
};

const saveUser = async ({ id, data, resolve, reject }: { id?: number, data: Partial<User>, resolve: Function, reject: Function }) => {
  try {
    if (id) {
      await updateUser(id, data);
    } else {
      await createUser(data);
    }
    await fetchData();
    resolve();
  } catch (error: any) {
    console.error("Failed to save user", error);
    alert(error.response?.data?.message || t('adminUsers.saveError'));
    reject();
  }
};

const confirmDelete = async (user: User) => {
  if (confirm(t('adminUsers.confirmDelete', { name: user.name }))) {
    try {
      await deleteUser(user.id);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || t('adminUsers.deleteError'));
    }
  }
};
</script>
