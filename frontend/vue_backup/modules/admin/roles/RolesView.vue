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
              <span class="text-gray-900 font-medium">{{ t('adminRoles.breadcrumb') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ t('adminRoles.title') }}</h1>
          </div>
        </div>
        
        <button @click="openModal()" class="bg-bakery-600 hover:bg-bakery-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2">
          <span class="text-xl leading-none">+</span> {{ t('adminRoles.createRole') }}
        </button>
      </div>

      <!-- Content -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="role in roles" :key="role.id" class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">
                🛡️
              </div>
              <h3 class="text-xl font-bold text-gray-900">{{ role.name }}</h3>
            </div>
            <div v-if="role.name === 'admin'" class="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">{{ t('adminRoles.system') }}</div>
          </div>
          
          <div class="flex-grow">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{{ t('adminRoles.assignedPermissions').replace('{count}', (role.permissions?.length || 0).toString()) }}</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="perm in role.permissions" :key="perm.id" class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">
                {{ perm.name }}
              </span>
              <span v-if="!role.permissions || role.permissions.length === 0" class="text-sm text-gray-400">{{ t('adminRoles.noPermissions') }}</span>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-50">
            <button v-if="role.name !== 'admin'" @click="openModal(role)" class="text-sm font-medium text-indigo-600 hover:text-indigo-900">{{ t('adminRoles.configureAccess') }}</button>
            <span v-else class="text-sm font-medium text-gray-400">{{ t('adminRoles.fullAccess') }}</span>
            <button v-if="!systemRoles.includes(role.name)" @click="confirmDelete(role)" class="text-sm font-medium text-red-600 hover:text-red-900">{{ t('adminRoles.delete') }}</button>
          </div>
        </div>
      </div>
      
    </div>

    <RoleFormModal 
      :is-open="isModalOpen" 
      :role="selectedRole" 
      :permissions="permissions"
      @close="closeModal" 
      @save="saveRole" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRoles, getPermissions, createRole, updateRole, deleteRole, type Role, type Permission } from '../../../api/roles';
import RoleFormModal from './components/RoleFormModal.vue';
import { useI18n } from '../../../i18n';

const { t } = useI18n();
const roles = ref<Role[]>([]);
const permissions = ref<Permission[]>([]);
const loading = ref(true);

const isModalOpen = ref(false);
const selectedRole = ref<Role | null>(null);
const systemRoles = ['admin', 'baker', 'seller', 'driver', 'client'];

const fetchData = async () => {
  loading.value = true;
  try {
    const [rls, perms] = await Promise.all([
      getRoles(),
      getPermissions()
    ]);
    roles.value = rls;
    permissions.value = perms;
  } catch (error) {
    console.error("Failed to fetch data", error);
    alert(t('adminRoles.loadError'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openModal = (role: Role | null = null) => {
  selectedRole.value = role ? { ...role } : null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedRole.value = null;
};

const saveRole = async ({ id, data, resolve, reject }: { id?: number, data: any, resolve: Function, reject: Function }) => {
  try {
    if (id) {
      await updateRole(id, data);
    } else {
      await createRole(data);
    }
    await fetchData();
    resolve();
  } catch (error: any) {
    console.error("Failed to save role", error);
    alert(error.response?.data?.message || t('adminRoles.saveError'));
    reject();
  }
};

const confirmDelete = async (role: Role) => {
  if (confirm(t('adminRoles.confirmDelete', { name: role.name }))) {
    try {
      await deleteRole(role.id);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || t('adminRoles.deleteError'));
    }
  }
};
</script>
