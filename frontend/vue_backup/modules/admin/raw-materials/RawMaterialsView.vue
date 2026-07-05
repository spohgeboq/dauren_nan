<template>
  <div class="min-h-screen bg-gray-50 p-8 font-sans">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-4">
          <router-link
            to="/dashboard"
            class="group flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 text-gray-700 shadow-sm transition-colors hover:bg-gray-100 active:bg-gray-200 sm:px-4"
            title="В главное меню"
          >
            <ArrowLeft class="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span class="hidden text-sm font-bold sm:inline">{{ t('common.backToMenu') }}</span>
          </router-link>

          <div>
            <div class="mb-2 flex items-center gap-3 text-sm text-gray-500">
              <router-link to="/admin" class="transition-colors hover:text-bakery-600">Dashboard</router-link>
              <span>/</span>
              <span class="font-medium text-gray-900">{{ t('adminRawMaterials.breadcrumb') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{{ t('adminRawMaterials.title') }}</h1>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row">
          <router-link
            to="/admin/recipes"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <NotebookTabs class="h-5 w-5" />
            {{ t('adminRawMaterials.recipesBtn') }}
          </router-link>
          <button
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-bakery-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-bakery-700"
            @click="openModal()"
          >
            <Plus class="h-5 w-5" />
            {{ t('adminRawMaterials.addMaterial') }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-bakery-600"></div>
      </div>

      <div v-else-if="materials.length === 0" class="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-400">
          <Wheat class="h-10 w-10" />
        </div>
        <h3 class="mb-2 text-xl font-bold text-gray-900">{{ t('adminRawMaterials.emptyTitle') }}</h3>
        <p class="mb-6 text-gray-500">{{ t('adminRawMaterials.emptyText') }}</p>
        <button class="font-medium text-bakery-600 hover:text-bakery-700" @click="openModal()">
          {{ t('adminRawMaterials.createFirstMaterial') }}
        </button>
      </div>

      <div v-else class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminRawMaterials.columns.material') }}</th>
              <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminRawMaterials.columns.conversion') }}</th>
              <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminRawMaterials.columns.supplier') }}</th>
              <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('adminRawMaterials.columns.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="material in materials" :key="material.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Wheat class="h-5 w-5" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="truncate font-bold text-gray-900">{{ material.name }}</p>
                      <span
                        :class="[
                          'rounded-full px-2 py-0.5 text-xs font-bold',
                          material.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        ]"
                      >
                        {{ material.is_active ? t('adminRawMaterials.active') : t('adminRawMaterials.inactive') }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500">{{ t('adminRawMaterials.inRecipes', { unit: material.unit?.short_name || 'ед.' }) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-bold text-gray-900">
                  {{ t('adminRawMaterials.conversionRule', { purchaseUnit: material.purchase_unit?.short_name || 'уп.', qty: material.qty_per_purchase_unit, unit: material.unit?.short_name || 'ед.' }) }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ t('adminRawMaterials.purchaseIn', { purchaseUnit: material.purchase_unit?.name || 'упаковка' }) }}
                </p>
              </td>

              <td class="px-6 py-4 text-sm text-gray-700">
                {{ material.supplier || t('adminRawMaterials.notSpecified') }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    class="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    :title="t('adminRawMaterials.edit')"
                    @click="openModal(material)"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    class="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    :title="t('adminRawMaterials.delete')"
                    @click="confirmDelete(material)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <RawMaterialFormModal
      :is-open="isModalOpen"
      :material="selectedMaterial"
      :units="units"
      @close="closeModal"
      @save="saveMaterial"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ArrowLeft, NotebookTabs, Pencil, Plus, Trash2, Wheat } from 'lucide-vue-next';
import {
  createRawMaterial,
  deleteRawMaterial,
  getRawMaterials,
  getUnits,
  updateRawMaterial,
  type RawMaterial,
  type Unit,
} from '../../../api/rawMaterials';
import RawMaterialFormModal from './components/RawMaterialFormModal.vue';
import { useI18n } from '../../../i18n';

const { t } = useI18n();
const materials = ref<RawMaterial[]>([]);
const units = ref<Unit[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const selectedMaterial = ref<RawMaterial | null>(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const [materialData, unitData] = await Promise.all([
      getRawMaterials(),
      getUnits(),
    ]);
    materials.value = materialData;
    units.value = unitData;
  } catch (error) {
    console.error('Failed to fetch raw materials', error);
    alert(t('adminRawMaterials.loadError'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openModal = (material: RawMaterial | null = null) => {
  selectedMaterial.value = material ? { ...material } : null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedMaterial.value = null;
};

const saveMaterial = async ({ id, data, resolve, reject }: { id?: number; data: Partial<RawMaterial>; resolve: () => void; reject: () => void }) => {
  try {
    if (id) {
      await updateRawMaterial(id, data);
    } else {
      await createRawMaterial(data);
    }
    await fetchData();
    resolve();
  } catch (error: any) {
    console.error('Failed to save raw material', error);
    alert(error.response?.data?.message || t('adminRawMaterials.saveError'));
    reject();
  }
};

const confirmDelete = async (material: RawMaterial) => {
  if (!confirm(t('adminRawMaterials.confirmDelete', { name: material.name }))) {
    return;
  }

  try {
    await deleteRawMaterial(material.id);
    await fetchData();
  } catch (error: any) {
    alert(error.response?.data?.message || t('adminRawMaterials.deleteError'));
  }
};
</script>
