<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="close"></div>
      </div>

      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

      <div class="inline-block w-full transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-w-3xl sm:align-middle">
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold leading-6 text-gray-900">
                {{ material?.id ? 'Редактировать сырье' : 'Новое сырье' }}
              </h3>
              <p class="mt-2 text-sm text-gray-500">
                Закупка вводится в упаковках, склад и рецепты работают в базовой единице.
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
            <div>
              <label class="block text-sm font-medium text-gray-700">Название</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm"
                placeholder="Мука высший сорт"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700">Базовая единица для склада и рецептов</label>
                <select
                  v-model="form.unit_id"
                  required
                  class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm"
                >
                  <option value="" disabled>Выберите единицу...</option>
                  <option v-for="unit in units" :key="unit.id" :value="unit.id">
                    {{ unit.name }} ({{ unit.short_name }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Закупочная единица</label>
                <select
                  v-model="form.purchase_unit_id"
                  required
                  class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm"
                >
                  <option value="" disabled>Выберите упаковку...</option>
                  <option v-for="unit in units" :key="unit.id" :value="unit.id">
                    {{ unit.name }} ({{ unit.short_name }})
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">В 1 закупочной единице</label>
                <input
                  v-model="form.qty_per_purchase_unit"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm"
                  placeholder="50000"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Минимальный остаток</label>
                <input
                  v-model="form.minimum_stock"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm"
                  placeholder="100000"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Рекомендуемый остаток</label>
                <input
                  v-model="form.recommended_stock"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm"
                  placeholder="300000"
                />
              </div>
            </div>

            <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <div class="flex items-start gap-3">
                <RefreshCcw class="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p class="font-bold">Конвертация</p>
                  <p class="mt-1">{{ conversionPreview }}</p>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Поставщик</label>
              <input
                v-model="form.supplier"
                type="text"
                class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500 sm:text-sm"
                placeholder="ТОО Поставщик"
              />
            </div>

            <div class="flex items-start">
              <input
                id="raw_material_is_active"
                v-model="form.is_active"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-gray-300 text-bakery-600 focus:ring-bakery-500"
              />
              <div class="ml-3 text-sm">
                <label for="raw_material_is_active" class="font-medium text-gray-700">Активно</label>
                <p class="text-gray-500">Активное сырье доступно в рецептах и заявках на закупку.</p>
              </div>
            </div>
          </form>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="button"
            :disabled="loading"
            class="inline-flex w-full justify-center rounded-xl border border-transparent bg-bakery-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-bakery-700 focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
            @click="submit"
          >
            <span v-if="loading">Сохранение...</span>
            <span v-else>Сохранить сырье</span>
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
import { RefreshCcw, X } from 'lucide-vue-next';
import type { RawMaterial, Unit } from '../../../../api/rawMaterials';

const props = defineProps<{
  isOpen: boolean;
  material: RawMaterial | null;
  units: Unit[];
}>();

const emit = defineEmits<{
  close: [];
  save: [{ id?: number; data: Partial<RawMaterial>; resolve: () => void; reject: () => void }];
}>();

const loading = ref(false);

const form = reactive({
  name: '',
  unit_id: '' as number | '',
  purchase_unit_id: '' as number | '',
  qty_per_purchase_unit: '',
  minimum_stock: '0',
  recommended_stock: '0',
  supplier: '',
  is_active: true,
});

const baseUnit = computed(() => props.units.find(unit => Number(unit.id) === Number(form.unit_id)));
const purchaseUnit = computed(() => props.units.find(unit => Number(unit.id) === Number(form.purchase_unit_id)));

const conversionPreview = computed(() => {
  const purchase = purchaseUnit.value?.short_name || 'закупочная ед.';
  const base = baseUnit.value?.short_name || 'базовая ед.';
  const qty = Number(form.qty_per_purchase_unit || 0);

  if (qty <= 0) {
    return `1 ${purchase} должен быть равен количеству в ${base}.`;
  }

  return `1 ${purchase} = ${qty} ${base}. Например, 2 ${purchase} попадут на склад как ${qty * 2} ${base}.`;
});

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    return;
  }

  if (props.material) {
    form.name = props.material.name;
    form.unit_id = props.material.unit_id;
    form.purchase_unit_id = props.material.purchase_unit_id;
    form.qty_per_purchase_unit = String(props.material.qty_per_purchase_unit);
    form.minimum_stock = String(props.material.minimum_stock);
    form.recommended_stock = String(props.material.recommended_stock);
    form.supplier = props.material.supplier || '';
    form.is_active = props.material.is_active;
  } else {
    form.name = '';
    form.unit_id = props.units[0]?.id || '';
    form.purchase_unit_id = props.units[0]?.id || '';
    form.qty_per_purchase_unit = '';
    form.minimum_stock = '0';
    form.recommended_stock = '0';
    form.supplier = '';
    form.is_active = true;
  }
});

const close = () => {
  emit('close');
};

const submit = () => {
  if (!form.name || !form.unit_id || !form.purchase_unit_id || !form.qty_per_purchase_unit) {
    alert('Заполните название, единицы и коэффициент конвертации');
    return;
  }

  if (Number(form.qty_per_purchase_unit) <= 0) {
    alert('Количество в закупочной единице должно быть больше 0');
    return;
  }

  loading.value = true;
  emit('save', {
    id: props.material?.id,
    data: {
      name: form.name,
      unit_id: Number(form.unit_id),
      purchase_unit_id: Number(form.purchase_unit_id),
      qty_per_purchase_unit: Number(form.qty_per_purchase_unit),
      minimum_stock: Number(form.minimum_stock),
      recommended_stock: Number(form.recommended_stock),
      supplier: form.supplier || null,
      is_active: form.is_active,
    },
    resolve: () => {
      loading.value = false;
      close();
    },
    reject: () => {
      loading.value = false;
    },
  });
};
</script>
