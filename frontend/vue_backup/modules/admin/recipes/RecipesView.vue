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
              <span class="font-medium text-gray-900">{{ t('adminRecipes.breadcrumb') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{{ t('adminRecipes.title') }}</h1>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row">
          <router-link
            to="/admin/raw-materials"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Wheat class="h-5 w-5" />
            {{ t('adminRecipes.rawMaterialsBtn') }}
          </router-link>
          <router-link
            to="/admin/products"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Package class="h-5 w-5" />
            {{ t('adminRecipes.productsBtn') }}
          </router-link>
          <button
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-bakery-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-bakery-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canManage || productsWithoutRecipe.length === 0"
            @click="openModal()"
          >
            <Plus class="h-5 w-5" />
            {{ t('adminRecipes.newRecipe') }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-bakery-600"></div>
      </div>

      <div v-else class="space-y-6">
        <div
          v-if="productsWithoutRecipe.length > 0"
          class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {{ t('adminRecipes.withoutRecipe', { products: productsWithoutRecipe.map(product => product.name).join(', ') }) }}
        </div>

        <div v-if="recipes.length === 0" class="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-400">
            <NotebookTabs class="h-10 w-10" />
          </div>
          <h3 class="mb-2 text-xl font-bold text-gray-900">{{ t('adminRecipes.emptyTitle') }}</h3>
          <p class="mb-6 text-gray-500">{{ t('adminRecipes.emptyText') }}</p>
          <button
            v-if="canManage"
            class="font-medium text-bakery-600 hover:text-bakery-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="productsWithoutRecipe.length === 0"
            @click="openModal()"
          >
            {{ t('adminRecipes.createFirstRecipe') }}
          </button>
        </div>

        <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article
            v-for="recipe in recipes"
            :key="recipe.id"
            class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="flex gap-4 border-b border-gray-100 p-5">
              <div class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                <img
                  v-if="recipe.product?.image_url"
                  :src="recipe.product.image_url"
                  class="h-full w-full object-cover"
                  :alt="recipe.product?.name"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-gray-300">
                  <Package class="h-9 w-9" />
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="mb-1 flex flex-wrap items-center gap-2">
                  <h2 class="truncate text-xl font-bold text-gray-900">{{ recipe.product?.name || t('adminRecipes.deletedProduct') }}</h2>
                  <span
                    :class="[
                      'rounded-full px-2 py-0.5 text-xs font-bold',
                      recipe.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    ]"
                  >
                    {{ recipe.is_active ? t('adminRecipes.active') : t('adminRecipes.inactive') }}
                  </span>
                </div>
                <p class="text-sm text-gray-500">
                  {{ t('adminRecipes.normFor', { quantity: recipe.yield_quantity, unit: recipe.product?.unit?.short_name || 'ед.' }) }}
                </p>
              </div>

              <div v-if="canManage" class="flex shrink-0 gap-2">
                <button
                  class="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  :title="t('adminRecipes.edit')"
                  @click="openModal(recipe)"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                  class="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  :title="t('adminRecipes.delete')"
                  @click="confirmDelete(recipe)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="divide-y divide-gray-100">
              <div
                v-for="ingredient in recipe.ingredients"
                :key="ingredient.id || ingredient.raw_material_id"
                class="flex items-center justify-between gap-4 px-5 py-3"
              >
                <div class="min-w-0">
                  <p class="truncate font-medium text-gray-900">{{ ingredient.raw_material?.name || t('adminRecipes.deletedRawMaterial') }}</p>
                  <p class="text-xs text-gray-500">{{ t('adminRecipes.writeOffInfo') }}</p>
                </div>
                <div class="shrink-0 text-right">
                  <p class="font-bold text-gray-900">
                    {{ ingredient.amount }} {{ ingredient.raw_material?.unit?.short_name || '' }}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>

    <RecipeFormModal
      :is-open="isModalOpen"
      :recipe="selectedRecipe"
      :products="productOptions"
      :raw-materials="rawMaterials"
      @close="closeModal"
      @save="saveRecipe"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ArrowLeft, NotebookTabs, Package, Pencil, Plus, Trash2, Wheat } from 'lucide-vue-next';
import { getProducts, type Product } from '../../../api/products';
import { getRawMaterials, type RawMaterial } from '../../../api/rawMaterials';
import { createRecipe, deleteRecipe, getRecipes, updateRecipe, type Recipe, type RecipePayload } from '../../../api/recipes';
import RecipeFormModal from './components/RecipeFormModal.vue';
import { useI18n } from '../../../i18n';

interface CurrentUser {
  permissions?: string[];
}

const { t } = useI18n();
const recipes = ref<Recipe[]>([]);
const products = ref<Product[]>([]);
const rawMaterials = ref<RawMaterial[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const selectedRecipe = ref<Recipe | null>(null);

const currentUser = computed<CurrentUser>(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
});

const canManage = computed(() => {
  const permissions = currentUser.value.permissions || [];
  return ['recipes.create', 'recipes.update', 'recipes.delete'].some(permission => permissions.includes(permission));
});

const recipeProductIds = computed(() => new Set(recipes.value.map(recipe => recipe.product_id)));

const productsWithoutRecipe = computed(() => products.value.filter(product => !recipeProductIds.value.has(product.id)));

const productOptions = computed(() => {
  if (!selectedRecipe.value) {
    return productsWithoutRecipe.value;
  }

  return products.value.filter(product => product.id === selectedRecipe.value?.product_id || !recipeProductIds.value.has(product.id));
});

const fetchData = async () => {
  loading.value = true;
  try {
    const [recipeData, productData, rawMaterialData] = await Promise.all([
      getRecipes(),
      getProducts(),
      getRawMaterials(),
    ]);
    recipes.value = recipeData;
    products.value = productData;
    rawMaterials.value = rawMaterialData;
  } catch (error) {
    console.error('Failed to fetch recipes data', error);
    alert(t('adminRecipes.loadError'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const openModal = (recipe: Recipe | null = null) => {
  selectedRecipe.value = recipe ? { ...recipe, ingredients: [...recipe.ingredients] } : null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedRecipe.value = null;
};

const recipeErrorMessage = (error: any) => {
  const errors = error.response?.data?.errors;
  if (errors && typeof errors === 'object') {
    const firstError = Object.values(errors).flat()[0];
    if (typeof firstError === 'string') {
      return firstError;
    }
  }

  return error.response?.data?.message || t('adminRecipes.saveError');
};

const saveRecipe = async ({ id, data, resolve, reject }: { id?: number; data: RecipePayload; resolve: () => void; reject: (message?: string) => void }) => {
  try {
    if (id) {
      await updateRecipe(id, data);
    } else {
      await createRecipe(data);
    }
    await fetchData();
    resolve();
  } catch (error: any) {
    console.error('Failed to save recipe', error);
    reject(recipeErrorMessage(error));
  }
};

const confirmDelete = async (recipe: Recipe) => {
  if (!confirm(t('adminRecipes.confirmDelete', { name: recipe.product?.name || 'товара' }))) {
    return;
  }

  try {
    await deleteRecipe(recipe.id);
    await fetchData();
  } catch (error: any) {
    alert(error.response?.data?.message || t('adminRecipes.deleteError'));
  }
};
</script>
