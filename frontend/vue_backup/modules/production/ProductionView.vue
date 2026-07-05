<template>
  <div class="min-h-screen bg-gray-50 p-4 font-sans sm:p-6 lg:p-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-4">
          <router-link
            to="/dashboard"
            class="group flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 text-gray-700 shadow-sm transition-colors hover:bg-gray-100 active:bg-gray-200 sm:px-4"
            :title="t('production.mainMenu')"
          >
            <ArrowLeft class="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span class="hidden text-sm font-bold sm:inline">{{ t('production.menu') }}</span>
          </router-link>

          <div>
            <div class="mb-2 flex items-center gap-3 text-sm text-gray-500">
              <router-link to="/admin" class="transition-colors hover:text-bakery-600">Dashboard</router-link>
              <span>/</span>
              <span class="font-medium text-gray-900">{{ t('production.breadcrumb') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{{ t('production.title') }}</h1>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LanguageSwitcher />
          <router-link
            to="/admin/recipes"
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <ClipboardList class="h-5 w-5" />
            {{ t('production.recipes') }}
          </router-link>
          <router-link
            to="/admin/reports"
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <ChartNoAxesCombined class="h-5 w-5" />
            {{ t('production.reports') }}
          </router-link>
          <button
            type="button"
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-bakery-900 px-5 py-3 font-bold text-white shadow-sm transition-colors hover:bg-bakery-800"
            @click="logout"
          >
            <LogOut class="h-5 w-5" />
            {{ t('common.logout') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <section class="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div v-if="editingProduction" class="mb-5 flex flex-col gap-3 rounded-2xl border border-bakery-100 bg-bakery-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-extrabold text-bakery-900">
                {{ t('production.editingDraft', { id: editingProduction.id }) }}
              </p>
              <p class="mt-1 text-sm font-medium text-bakery-700">
                {{ t('production.editingDraftHint') }}
              </p>
            </div>
            <button
              type="button"
              class="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-bakery-200 bg-white px-3 text-sm font-extrabold text-bakery-700 shadow-sm hover:bg-bakery-50"
              @click="cancelEdit"
            >
              <X class="h-4 w-4" />
              {{ t('production.cancelEdit') }}
            </button>
          </div>

          <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr_180px]">
            <label>
              <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('production.date') }}</span>
              <TailwindDatePicker
                v-model="form.date"
                class="w-full"
              />
            </label>

            <div>
              <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('production.status') }}</span>
              <div class="grid grid-cols-1 gap-2 rounded-2xl bg-gray-100 p-1 sm:grid-cols-2">
                <button
                  v-for="option in statusOptions"
                  :key="option.value"
                  type="button"
                  :class="[
                    'min-h-11 min-w-0 rounded-xl px-2 text-[13px] font-extrabold leading-none transition-colors sm:text-sm',
                    form.status === option.value ? 'bg-white text-bakery-700 shadow-sm ring-1 ring-bakery-100' : 'text-gray-600 hover:bg-white/70'
                  ]"
                  @click="form.status = option.value"
                >
                  {{ t(`production.statuses.${option.value}`) }}
                </button>
              </div>
            </div>

            <div class="rounded-2xl border border-bakery-100 bg-bakery-50 p-3">
              <p class="text-xs font-bold uppercase tracking-wider text-bakery-700">{{ t('production.total') }}</p>
              <p class="mt-1 text-2xl font-extrabold text-gray-900">{{ formatQuantity(totalActualQuantity) }} {{ t('production.pieces') }}</p>
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl border border-gray-200">
            <div class="grid grid-cols-[minmax(180px,1fr)_110px_120px_52px] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 max-md:hidden">
              <span>{{ t('production.product') }}</span>
              <span class="text-right">{{ t('production.plan') }}</span>
              <span class="text-right">{{ t('production.baked') }}</span>
              <span></span>
            </div>

            <div class="divide-y divide-gray-200">
              <div
                v-for="(row, index) in form.items"
                :key="row.key"
                class="grid grid-cols-1 gap-3 bg-white p-4 md:grid-cols-[minmax(180px,1fr)_110px_120px_52px] md:items-end"
              >
                <label>
                  <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500 md:hidden">{{ t('production.product') }}</span>
                  <select
                    v-model.number="row.product_id"
                    class="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm font-bold text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500"
                  >
                    <option value="">{{ t('production.chooseProduct') }}</option>
                    <option v-for="product in activeProducts" :key="product.id" :value="product.id">
                      {{ product.name }} (На складе: {{ getProductStock(product.id) }} {{ t('production.pieces') }})
                    </option>
                  </select>
                </label>

                <label>
                  <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500 md:hidden">{{ t('production.plan') }}</span>
                  <input
                    v-model.number="row.planned_quantity"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    step="1"
                    class="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-right text-sm font-extrabold text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500"
                    @input="syncActualWithPlan(row)"
                  />
                </label>

                <label>
                  <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500 md:hidden">{{ t('production.baked') }}</span>
                  <input
                    v-model.number="row.actual_quantity"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    step="1"
                    class="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-right text-sm font-extrabold text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500"
                    @input="row.actualTouched = true"
                  />
                </label>

                <button
                  type="button"
                  class="flex h-12 w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 md:w-12"
                  :title="t('production.deleteRow')"
                  :disabled="form.items.length === 1"
                  @click="removeRow(index)"
                >
                  <Trash2 class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              @click="addRow"
            >
              <Plus class="h-5 w-5" />
              {{ t('production.addRow') }}
            </button>

            <button
              v-if="!editingProduction"
              type="button"
              class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-bakery-200 bg-bakery-50 px-5 py-3 font-bold text-bakery-700 shadow-sm transition-colors hover:bg-bakery-100"
              @click="loadFromLatest"
            >
              <Copy class="h-5 w-5" />
              {{ t('production.copyPrevious') }}
            </button>

            <button
              type="button"
              class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-bakery-600 px-6 py-3 font-extrabold text-white shadow-sm transition-colors hover:bg-bakery-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="saving || !canSubmit"
              @click="submitProduction"
            >
              <Save class="h-5 w-5" />
              {{ saving ? t('production.saving') : submitLabel }}
            </button>
          </div>

          <div
            v-if="message.text"
            class="mt-5 rounded-2xl border p-4 text-sm font-bold"
            :class="message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'"
          >
            {{ message.text }}
          </div>

        </section>

        <aside class="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-xl font-extrabold text-gray-900">{{ t('production.latestBatches') }}</h2>
              <p class="text-sm font-medium text-gray-500">{{ t('production.records', { count: productions.length }) }}</p>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              :title="t('production.refresh')"
              @click="fetchData"
            >
              <RefreshCw class="h-5 w-5" :class="{ 'animate-spin': loading }" />
            </button>
          </div>

          <div v-if="loading" class="flex justify-center py-16">
            <div class="h-10 w-10 animate-spin rounded-full border-b-2 border-bakery-600"></div>
          </div>

          <div v-else-if="productions.length === 0" class="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <PackageCheck class="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p class="font-bold text-gray-500">{{ t('production.noBatches') }}</p>
          </div>

          <div v-else class="space-y-3">
            <article
              v-for="production in productions"
              :key="production.id"
              class="rounded-2xl border border-gray-100 bg-gray-50 p-4"
            >
              <div class="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p class="font-extrabold text-gray-900">{{ t('production.batch', { id: production.id }) }}</p>
                  <p class="text-xs font-bold text-gray-500">{{ formatDate(production.date) }} · {{ production.baker?.name || t('production.baker') }}</p>
                </div>
                <span :class="['rounded-full px-2.5 py-1 text-xs font-extrabold', statusClass(production.status)]">
                  {{ statusLabel(production.status) }}
                </span>
              </div>

              <div class="space-y-2">
                <div
                  v-for="item in production.items || []"
                  :key="item.id"
                  class="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm"
                >
                  <span class="truncate font-bold text-gray-900">{{ item.product?.name || t('production.product') }}</span>
                  <span class="shrink-0 font-extrabold text-bakery-700">{{ formatQuantity(item.actual_quantity ?? item.planned_quantity) }} {{ t('production.pieces') }}</span>
                </div>
              </div>

              <details v-if="production.ingredients?.length" class="mt-3">
                <summary class="cursor-pointer text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('production.ingredients') }}</summary>
                <div class="mt-2 space-y-1">
                  <div
                    v-for="ingredient in production.ingredients"
                    :key="ingredient.id"
                    class="flex justify-between gap-3 text-xs text-gray-600"
                  >
                    <span class="truncate">{{ ingredient.raw_material?.name || t('production.ingredients') }}</span>
                    <span class="shrink-0 font-bold">
                      {{ formatQuantity(ingredient.actual_amount ?? ingredient.planned_amount) }}
                      {{ ingredient.raw_material?.unit?.short_name || '' }}
                    </span>
                  </div>
                </div>
              </details>

              <div v-if="production.status === 'draft'" class="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  class="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-extrabold text-gray-700 shadow-sm transition-colors hover:bg-gray-100"
                  @click="startEditDraft(production)"
                >
                  <Pencil class="h-4 w-4" />
                  {{ t('production.editDraft') }}
                </button>
              </div>

              <div v-if="isAdmin && (production.status === 'closed' || production.status === 'draft' || production.status === 'cancelled')" class="mt-3 flex flex-col gap-2 border-t border-gray-200/50 pt-2 sm:flex-row">
                <button
                  v-if="production.status === 'closed'"
                  type="button"
                  class="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 text-sm font-extrabold text-orange-700 shadow-sm transition-colors hover:bg-orange-100"
                  @click="openProductionConfirmation('cancel', production)"
                >
                  <Ban class="h-4 w-4" />
                  {{ t('production.cancelBatch') }}
                </button>

                <button
                  v-if="production.status === 'draft' || production.status === 'cancelled'"
                  type="button"
                  class="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-extrabold text-red-700 shadow-sm transition-colors hover:bg-red-100"
                  @click="openProductionConfirmation('delete', production)"
                >
                  <Trash2 class="h-4 w-4" />
                  {{ t('production.deleteBatch') }}
                </button>
              </div>
            </article>
          </div>
        </aside>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="confirmation.open && confirmation.production"
        class="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/55 px-4 py-6 backdrop-blur-sm sm:items-center"
        role="dialog"
        aria-modal="true"
        @click.self="closeProductionConfirmation"
      >
        <section class="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
          <div
            class="relative overflow-hidden px-6 py-6 text-white sm:px-7"
            :class="confirmation.mode === 'cancel' ? 'bg-gradient-to-br from-amber-700 via-orange-700 to-red-800' : 'bg-gradient-to-br from-red-700 via-rose-700 to-gray-950'"
          >
            <div class="relative flex items-start gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <AlertTriangle v-if="confirmation.mode === 'cancel'" class="h-7 w-7" />
                <Trash2 v-else class="h-7 w-7" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-extrabold uppercase tracking-wider text-white/75">
                  {{ confirmation.mode === 'cancel' ? t('production.cancelModal.eyebrow') : t('production.deleteModal.eyebrow') }}
                </p>
                <h2 class="mt-2 text-2xl font-black leading-tight sm:text-3xl">
                  {{ confirmation.mode === 'cancel' ? t('production.cancelModal.title', { id: confirmation.production.id }) : t('production.deleteModal.title', { id: confirmation.production.id }) }}
                </h2>
                <p class="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/85">
                  {{ confirmation.mode === 'cancel' ? t('production.cancelModal.text') : t('production.deleteModal.text') }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-5 p-5 sm:p-6">
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p class="text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('production.cancelModal.date') }}</p>
                <p class="mt-1 text-lg font-black text-gray-950">{{ formatDate(confirmation.production.date) }}</p>
              </div>
              <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p class="text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('production.cancelModal.status') }}</p>
                <p class="mt-1 text-lg font-black text-gray-950">{{ statusLabel(confirmation.production.status) }}</p>
              </div>
              <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p class="text-xs font-extrabold uppercase tracking-wider text-gray-500">{{ t('production.cancelModal.quantity') }}</p>
                <p class="mt-1 text-lg font-black text-gray-950">{{ formatQuantity(productionTotal(confirmation.production)) }} {{ t('production.pieces') }}</p>
              </div>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-white">
              <div class="border-b border-gray-100 px-4 py-3">
                <p class="text-sm font-black text-gray-950">{{ t('production.cancelModal.products') }}</p>
              </div>
              <div class="max-h-56 overflow-y-auto divide-y divide-gray-100">
                <div
                  v-for="item in confirmation.production.items || []"
                  :key="item.id"
                  class="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span class="min-w-0 truncate font-bold text-gray-800">{{ item.product?.name || t('production.product') }}</span>
                  <span class="shrink-0 rounded-full bg-bakery-50 px-3 py-1 font-black text-bakery-800">
                    {{ formatQuantity(item.actual_quantity ?? item.planned_quantity) }} {{ t('production.pieces') }}
                  </span>
                </div>
              </div>
            </div>

            <div
              class="rounded-2xl border px-4 py-3 text-sm font-semibold leading-6"
              :class="confirmation.mode === 'cancel' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-red-200 bg-red-50 text-red-900'"
            >
              {{ confirmation.mode === 'cancel' ? t('production.cancelModal.warning') : t('production.deleteModal.warning') }}
            </div>

            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-extrabold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="confirmation.processing"
                @click="closeProductionConfirmation"
              >
                {{ t('production.cancelModal.keep') }}
              </button>
              <button
                type="button"
                class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                :class="confirmation.mode === 'cancel' ? 'bg-orange-700 hover:bg-orange-800' : 'bg-red-700 hover:bg-red-800'"
                :disabled="confirmation.processing"
                @click="confirmProductionAction"
              >
                <Loader2 v-if="confirmation.processing" class="h-4 w-4 animate-spin" />
                <Ban v-else-if="confirmation.mode === 'cancel'" class="h-4 w-4" />
                <Trash2 v-else class="h-4 w-4" />
                {{ confirmation.processing ? t('production.cancelModal.processing') : confirmation.mode === 'cancel' ? t('production.cancelModal.confirm') : t('production.deleteModal.confirm') }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowLeft,
  ChartNoAxesCombined,
  ClipboardList,
  Copy,
  AlertTriangle,
  Loader2,
  PackageCheck,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
  Ban,
  LogOut,
} from 'lucide-vue-next';
import type { Product } from '../../api/products';
import api from '../../api';
import {
  createProduction,
  getProductionProducts,
  getProductions,
  getLatestProductionTemplate,
  updateProduction,
  deleteProduction,
  cancelProduction,
  type Production,
  type ProductionStatus,
} from '../../api/productions';
import { useI18n } from '../../i18n';
import LanguageSwitcher from '../../components/LanguageSwitcher.vue';
import TailwindDatePicker from '../../components/ui/TailwindDatePicker.vue';

const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = computed(() => currentUser?.roles?.includes('admin') || false);
const router = useRouter();

interface ProductionFormRow {
  key: number;
  product_id: number | '';
  planned_quantity: number | '';
  actual_quantity: number | '';
  actualTouched: boolean;
}

const localDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const createRow = (): ProductionFormRow => ({
  key: Date.now() + Math.random(),
  product_id: '',
  planned_quantity: '',
  actual_quantity: '',
  actualTouched: false,
});

const { t } = useI18n();
const loading = ref(true);
const saving = ref(false);
const products = ref<Product[]>([]);
const productStocks = ref<any[]>([]);
const productions = ref<Production[]>([]);
const editingProduction = ref<Production | null>(null);
const message = reactive<{ type: 'success' | 'error'; text: string }>({
  type: 'success',
  text: '',
});
const confirmation = reactive<{
  open: boolean;
  mode: 'cancel' | 'delete';
  production: Production | null;
  processing: boolean;
}>({
  open: false,
  mode: 'cancel',
  production: null,
  processing: false,
});

const form = reactive<{
  date: string;
  status: ProductionStatus;
  items: ProductionFormRow[];
}>({
  date: localDate(),
  status: 'closed',
  items: [createRow()],
});

const statusOptions: Array<{ value: ProductionStatus }> = [
  { value: 'draft' },
  { value: 'closed' },
];

const activeProducts = computed(() => {
  return products.value.filter(product => product.is_active !== false);
});

const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error(error);
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

const validRows = computed(() => {
  return form.items
    .map(row => {
      const planned = Number(row.planned_quantity || 0);
      const actual = row.actual_quantity === '' ? planned : Number(row.actual_quantity || 0);

      return {
        product_id: Number(row.product_id || 0),
        planned_quantity: planned,
        actual_quantity: actual,
      };
    })
    .filter(row => row.product_id > 0 && row.planned_quantity > 0 && row.actual_quantity >= 0);
});

const getProductStock = (productId: number) => {
  return productStocks.value
    .filter(stock => Number(stock.product_id) === Number(productId))
    .reduce((sum, stock) => sum + Number(stock.quantity), 0);
};

const totalActualQuantity = computed(() => {
  return validRows.value.reduce((sum, row) => sum + row.actual_quantity, 0);
});

const canSubmit = computed(() => {
  return Boolean(form.date) && validRows.value.length > 0 && totalActualQuantity.value > 0;
});

const submitLabel = computed(() => {
  if (form.status === 'draft') {
    return t('production.saveDraft');
  }

  return editingProduction.value ? t('production.finalizeDraft') : t('production.saveProduction');
});

const fetchData = async () => {
  loading.value = true;
  try {
    const [productData, productionData, stockData] = await Promise.all([
      getProductionProducts(),
      getProductions(),
      api.get('/inventory/products').then(res => res.data.data),
    ]);

    products.value = productData;
    productions.value = productionData;
    productStocks.value = stockData;
  } catch (error: any) {
    console.error('Failed to load production data', error);
    message.type = 'error';
    message.text = error.response?.data?.message || t('production.loadError');
  } finally {
    loading.value = false;
  }
};

const openProductionConfirmation = (mode: 'cancel' | 'delete', production: Production) => {
  confirmation.mode = mode;
  confirmation.production = production;
  confirmation.open = true;
  confirmation.processing = false;
};

const closeProductionConfirmation = () => {
  if (confirmation.processing) {
    return;
  }

  confirmation.open = false;
  confirmation.production = null;
};

const confirmProductionAction = async () => {
  if (!confirmation.production) {
    return;
  }

  confirmation.processing = true;
  message.text = '';

  try {
    if (confirmation.mode === 'cancel') {
      await cancelProduction(confirmation.production.id);
      message.type = 'success';
      message.text = t('production.cancelledSuccess');
    } else {
      await deleteProduction(confirmation.production.id);
      message.type = 'success';
      message.text = t('production.deletedSuccess');
    }

    confirmation.open = false;
    confirmation.production = null;
    await fetchData();
  } catch (error: any) {
    message.type = 'error';
    message.text = error.response?.data?.message || (
      confirmation.mode === 'cancel'
        ? t('production.cancelError')
        : t('production.deleteError')
    );
  } finally {
    confirmation.processing = false;
  }
};

const addRow = () => {
  form.items.push(createRow());
};

const loadFromLatest = async () => {
  try {
    loading.value = true;
    const template = await getLatestProductionTemplate();
    if (template && template.items && template.items.length > 0) {
      form.items = template.items.map((item: any) => ({
        key: Date.now() + Math.random(),
        product_id: item.product_id,
        planned_quantity: item.planned_quantity,
        actual_quantity: '',
        actualTouched: false,
      }));
      message.type = 'success';
      message.text = t('production.templateLoaded');
    } else {
      message.type = 'error';
      message.text = t('production.noTemplateFound');
    }
  } catch (error: any) {
    message.type = 'error';
    message.text = error.response?.data?.message || 'Error loading template';
  } finally {
    loading.value = false;
  }
};

const removeRow = (index: number) => {
  if (form.items.length === 1) {
    return;
  }

  form.items.splice(index, 1);
};

const syncActualWithPlan = (row: ProductionFormRow) => {
  if (!row.actualTouched || row.actual_quantity === '') {
    row.actual_quantity = row.planned_quantity;
  }
};

const resetForm = () => {
  editingProduction.value = null;
  form.date = localDate();
  form.status = 'closed';
  form.items = [createRow()];
};

const startEditDraft = (production: Production) => {
  if (production.status !== 'draft') {
    return;
  }

  editingProduction.value = production;
  form.date = production.date.slice(0, 10);
  form.status = 'draft';
  form.items = (production.items || []).map(item => ({
    key: Date.now() + Math.random(),
    product_id: item.product_id,
    planned_quantity: Number(item.planned_quantity || 0),
    actual_quantity: Number(item.actual_quantity ?? item.planned_quantity ?? 0),
    actualTouched: item.actual_quantity !== null,
  }));

  if (form.items.length === 0) {
    form.items = [createRow()];
  }

  message.type = 'success';
  message.text = t('production.draftLoaded');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  resetForm();
  message.text = '';
};

const submitProduction = async () => {
  if (!canSubmit.value) {
    return;
  }

  saving.value = true;
  message.text = '';

  try {
    const payload = {
      date: form.date,
      status: form.status,
      items: validRows.value.map(row => ({
        product_id: row.product_id,
        planned_quantity: row.planned_quantity,
        actual_quantity: row.actual_quantity,
      })),
    };

    const editingDraft = editingProduction.value;

    if (editingDraft) {
      await updateProduction(editingDraft.id, payload);
    } else {
      await createProduction(payload);
    }

    message.type = 'success';
    message.text = form.status === 'draft'
      ? t(editingDraft ? 'production.draftUpdated' : 'production.draftSaved')
      : t(editingDraft ? 'production.draftFinalized' : 'production.productionSaved', { quantity: formatQuantity(totalActualQuantity.value) });
    resetForm();
    await fetchData();
  } catch (error: any) {
    console.error('Failed to save production', error);
    message.type = 'error';
    message.text = error.response?.data?.message || t('production.saveError');
  } finally {
    saving.value = false;
  }
};

const statusLabel = (status: ProductionStatus) => ({
  draft: t('production.statuses.draft'),
  confirmed: t('production.statuses.confirmed'),
  closed: t('production.statuses.closed'),
  cancelled: t('production.statuses.cancelled'),
}[status] || status);

const statusClass = (status: ProductionStatus) => ({
  draft: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  closed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}[status] || 'bg-gray-100 text-gray-700');

const productionTotal = (production: Production) => {
  return (production.items || []).reduce((sum, item) => {
    return sum + Number(item.actual_quantity ?? item.planned_quantity ?? 0);
  }, 0);
};

const formatQuantity = (value: number) => {
  return Number(value || 0).toLocaleString('ru-RU', {
    maximumFractionDigits: 2,
  });
};

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

onMounted(() => {
  fetchData();
});
</script>
