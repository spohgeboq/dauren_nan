<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="close"></div>
      </div>

      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

      <div class="inline-block w-full transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-w-4xl sm:align-middle">
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold leading-6 text-gray-900">
                {{ recipe?.id ? 'Редактировать рецепт' : 'Новый рецепт' }}
              </h3>
              <p class="mt-2 text-sm text-gray-500">
                Норма сырья указывается на выход рецепта. Производство умножит эти значения на количество товара.
              </p>
            </div>
            <button
              type="button"
              class="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              title="Закрыть"
              @click="close"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <form class="mt-6 space-y-6" @submit.prevent="submit">
            <div v-if="formError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {{ formError }}
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Товар</label>
                <select
                  v-model="form.product_id"
                  required
                  class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm"
                >
                  <option value="" disabled>Выберите товар...</option>
                  <option v-for="product in products" :key="product.id" :value="product.id">
                    {{ product.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Выход рецепта</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                  <input
                    v-model="form.yield_quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    class="block w-full min-w-0 flex-1 rounded-l-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm"
                    placeholder="1"
                  />
                  <span class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                    {{ selectedProductUnit }}
                  </span>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div class="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h4 class="font-bold text-gray-900">Сырье</h4>
                  <p class="text-sm text-gray-500">Например: мука 500 г, дрожжи 5 г, вода 300 мл.</p>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                  @click="addIngredient"
                >
                  <Plus class="h-4 w-4" />
                  Добавить сырье
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(ingredient, index) in form.ingredients"
                  :key="ingredient.local_id"
                  class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_180px_44px]"
                >
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-gray-500">Сырье</label>
                    <select
                      v-model="ingredient.raw_material_id"
                      required
                      class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm"
                    >
                      <option value="" disabled>Выберите сырье...</option>
                      <option v-for="material in activeRawMaterials" :key="material.id" :value="material.id">
                        {{ material.name }} ({{ material.unit?.short_name || 'ед.' }})
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-gray-500">Количество</label>
                    <div class="mt-1 flex rounded-md shadow-sm">
                      <input
                        v-model="ingredient.amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        class="block w-full min-w-0 flex-1 rounded-l-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm"
                        placeholder="0"
                      />
                      <span class="inline-flex min-w-12 items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        {{ unitForIngredient(ingredient.raw_material_id) }}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-end">
                    <button
                      type="button"
                      class="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Удалить строку"
                      :disabled="form.ingredients.length === 1"
                      @click="removeIngredient(index)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-start">
              <input
                id="recipe_is_active"
                v-model="form.is_active"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-gray-300 text-bakery-600 focus:ring-bakery-500"
              />
              <div class="ml-3 text-sm">
                <label for="recipe_is_active" class="font-medium text-gray-700">Активен</label>
                <p class="text-gray-500">Активный рецепт используется при расчете планового расхода сырья.</p>
              </div>
            </div>
          </form>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="button"
            class="inline-flex w-full justify-center rounded-xl border border-transparent bg-bakery-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-bakery-700 focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
            :disabled="loading"
            @click="submit"
          >
            <span v-if="loading">Сохранение...</span>
            <span v-else>Сохранить рецепт</span>
          </button>
          <button
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
            @click="close"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Plus, Trash2, X } from 'lucide-vue-next';
import type { Product } from '../../../../api/products';
import type { RawMaterial } from '../../../../api/rawMaterials';
import type { Recipe, RecipePayload } from '../../../../api/recipes';

interface IngredientFormRow {
  local_id: number;
  raw_material_id: number | '';
  amount: string;
}

const props = defineProps<{
  isOpen: boolean;
  recipe: Recipe | null;
  products: Product[];
  rawMaterials: RawMaterial[];
}>();

const emit = defineEmits<{
  close: [];
  save: [{ id?: number; data: RecipePayload; resolve: () => void; reject: (message?: string) => void }];
}>();

const loading = ref(false);
const formError = ref('');
let nextLocalId = 1;

const form = reactive({
  product_id: '' as number | '',
  yield_quantity: '1',
  is_active: true,
  ingredients: [] as IngredientFormRow[],
});

const activeRawMaterials = computed(() => props.rawMaterials.filter(material => material.is_active));

const selectedProductUnit = computed(() => {
  const product = props.products.find(item => Number(item.id) === Number(form.product_id));
  return product?.unit?.short_name || 'шт';
});

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    return;
  }

  formError.value = '';

  if (props.recipe) {
    form.product_id = props.recipe.product_id;
    form.yield_quantity = String(props.recipe.yield_quantity);
    form.is_active = props.recipe.is_active;
    form.ingredients = props.recipe.ingredients.map(ingredient => ({
      local_id: nextLocalId++,
      raw_material_id: ingredient.raw_material_id,
      amount: String(ingredient.amount),
    }));
  } else {
    form.product_id = props.products[0]?.id || '';
    form.yield_quantity = '1';
    form.is_active = true;
    form.ingredients = [createEmptyIngredient()];
  }

  if (form.ingredients.length === 0) {
    form.ingredients = [createEmptyIngredient()];
  }
});

const createEmptyIngredient = (): IngredientFormRow => ({
  local_id: nextLocalId++,
  raw_material_id: '',
  amount: '',
});

const addIngredient = () => {
  form.ingredients.push(createEmptyIngredient());
};

const removeIngredient = (index: number) => {
  if (form.ingredients.length > 1) {
    form.ingredients.splice(index, 1);
  }
};

const unitForIngredient = (rawMaterialId: number | '') => {
  const material = props.rawMaterials.find(item => Number(item.id) === Number(rawMaterialId));
  return material?.unit?.short_name || 'ед.';
};

const close = () => {
  emit('close');
};

const submit = () => {
  formError.value = '';

  if (!form.product_id) {
    formError.value = 'Выберите товар для рецепта.';
    return;
  }

  if (!form.yield_quantity || Number(form.yield_quantity) <= 0) {
    formError.value = 'Укажите выход рецепта.';
    return;
  }

  const ingredients = form.ingredients.map(ingredient => ({
    raw_material_id: Number(ingredient.raw_material_id),
    amount: Number(ingredient.amount),
  }));

  if (ingredients.some(ingredient => !ingredient.raw_material_id || ingredient.amount <= 0)) {
    formError.value = 'Заполните сырье и количество во всех строках.';
    return;
  }

  const uniqueMaterialIds = new Set(ingredients.map(ingredient => ingredient.raw_material_id));
  if (uniqueMaterialIds.size !== ingredients.length) {
    formError.value = 'Одно и то же сырье нельзя указывать дважды в одном рецепте.';
    return;
  }

  loading.value = true;
  emit('save', {
    id: props.recipe?.id,
    data: {
      product_id: Number(form.product_id),
      yield_quantity: Number(form.yield_quantity),
      is_active: form.is_active,
      ingredients,
    },
    resolve: () => {
      loading.value = false;
      formError.value = '';
      close();
    },
    reject: (message?: string) => {
      loading.value = false;
      formError.value = message || 'Ошибка сохранения рецепта.';
    },
  });
};
</script>
