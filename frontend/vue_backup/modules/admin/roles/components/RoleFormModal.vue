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
              <h3 class="text-xl leading-6 font-bold text-gray-900">
                {{ role?.id ? 'Редактировать роль' : 'Новая роль' }}
              </h3>
              
              <div class="mt-6">
                <form @submit.prevent="submit" class="space-y-6">
                  
                  <!-- Название -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Системное название (на английском)</label>
                    <div class="mt-1">
                      <input v-model="form.name" type="text" :disabled="isSystemRole" required class="shadow-sm focus:ring-bakery-500 focus:border-bakery-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border disabled:bg-gray-100 bg-white text-gray-900" placeholder="manager, senior_baker" />
                    </div>
                  </div>

                  <!-- Права (Permissions) -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Права доступа (Permissions)</label>
                    <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 h-64 overflow-y-auto">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div v-for="perm in permissions" :key="perm.id" class="flex items-start">
                          <div class="flex items-center h-5">
                            <input :id="'perm-'+perm.id" type="checkbox" :value="perm.name" v-model="form.permissions" class="focus:ring-bakery-500 h-4 w-4 text-bakery-600 border-gray-300 rounded bg-white text-gray-900" />
                          </div>
                          <div class="ml-3 text-sm">
                            <label :for="'perm-'+perm.id" class="font-medium text-gray-700">{{ perm.name }}</label>
                          </div>
                        </div>
                      </div>
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
          <button type="button" @click="close" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bakery-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm bg-white text-gray-900">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue';
import type { Role, Permission } from '../../../../api/roles';

const props = defineProps<{
  isOpen: boolean;
  role: Role | null;
  permissions: Permission[];
}>();

const emit = defineEmits(['close', 'save']);

const loading = ref(false);
const systemRoles = ['admin', 'baker', 'seller', 'driver', 'client'];
const isSystemRole = computed(() => props.role ? systemRoles.includes(props.role.name) : false);

const form = reactive({
  name: '',
  permissions: [] as string[],
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.role) {
      form.name = props.role.name;
      form.permissions = props.role.permissions?.map((p: any) => p.name) || [];
    } else {
      form.name = '';
      form.permissions = [];
    }
  }
});

const close = () => {
  emit('close');
};

const submit = () => {
  if (!form.name) {
    alert("Заполните название роли");
    return;
  }

  loading.value = true;
  emit('save', { id: props.role?.id, data: { ...form }, resolve: () => { loading.value = false; close(); }, reject: () => { loading.value = false; } });
};
</script>
