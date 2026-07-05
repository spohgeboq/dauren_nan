<template>
  <div class="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
      <div class="flex items-center gap-4">
        <!-- Back to Main Menu Button -->
        <router-link 
          to="/dashboard" 
          class="flex items-center justify-center gap-2 px-3 sm:px-4 h-12 rounded-2xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-bakery-500 touch-manipulation group"
          :title="t('pos.backTitle')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:-translate-x-1 transition-transform">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span class="font-bold text-sm hidden sm:inline">{{ t('pos.backShort') }}</span>
        </router-link>

        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-bakery-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-inner">
            B
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 tracking-tight">Daurennan POS</h1>
            <p class="text-sm font-medium" :class="canSell ? 'text-green-600' : hasStaleOpenShift ? 'text-amber-600' : 'text-red-600'">{{ shiftCaption }}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex rounded-2xl border border-gray-200 bg-gray-50 p-1">
          <button
            :class="['px-4 py-2 rounded-xl text-sm font-bold transition-colors', sidePanel === 'cart' ? 'bg-bakery-600 text-white shadow-sm' : 'text-gray-500 hover:text-bakery-700']"
            @click="sidePanel = 'cart'"
          >
            {{ t('pos.receipt') }}
          </button>
          <button
            :class="['px-4 py-2 rounded-xl text-sm font-bold transition-colors', sidePanel === 'history' ? 'bg-bakery-600 text-white shadow-sm' : 'text-gray-500 hover:text-bakery-700']"
            @click="openHistory"
          >
            {{ t('pos.history') }}
          </button>
        </div>
        <button
          v-if="isShiftOpen"
          type="button"
          class="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-bakery-600 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-bakery-700 active:scale-[0.98]"
          @click="isShiftCloseModalOpen = true"
        >
          <ReceiptText class="h-4 w-4" />
          <span class="hidden lg:inline">{{ t('pos.closeShift') }}</span>
          <span class="lg:hidden">{{ t('pos.shiftShort') }}</span>
        </button>
        <button
          @click="toggleFullscreen"
          class="flex items-center justify-center h-12 w-12 text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-2xl transition-colors focus:outline-none touch-manipulation"
          :title="isFullscreen ? 'Свернуть' : 'Во весь экран'"
        >
          <Minimize v-if="isFullscreen" class="w-6 h-6" />
          <Maximize v-else class="w-6 h-6" />
        </button>
        <LanguageSwitcher />
        <div class="flex min-w-0 items-center gap-2 rounded-2xl border border-bakery-100 bg-bakery-50 px-3 py-2">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-bakery-600 text-sm font-extrabold text-white shadow-sm">
            {{ cashierInitials }}
          </div>
          <div class="hidden min-w-0 sm:block">
            <p class="max-w-40 truncate text-sm font-extrabold text-gray-900">{{ cashierName }}</p>
            <p class="text-xs font-semibold text-bakery-700">{{ cashierRoleLabel }}</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div v-if="shiftLoading" class="flex flex-1 items-center justify-center">
      <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-bakery-600"></div>
    </div>

    <div v-else-if="!isShiftOpen" class="flex flex-1 items-center justify-center bg-gray-50 p-6">
      <section class="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-bakery-900/10">
        <div class="mb-5 flex items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bakery-600 text-white shadow-lg shadow-bakery-600/25">
            <ReceiptText class="h-6 w-6" />
          </div>
          <div>
            <h2 class="text-xl font-extrabold text-gray-900">{{ t('pos.openShiftTitle') }}</h2>
            <p class="mt-1 text-sm font-medium text-gray-500">
              {{ currentShift?.status === 'closed' ? t('pos.previousShiftClosed') : t('pos.openShiftHint') }}
            </p>
          </div>
        </div>

        <label class="block">
          <span class="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('pos.openingCash') }}</span>
          <input
            v-model="openingCash"
            type="text"
            inputmode="none"
            readonly
            class="w-full rounded-2xl border border-gray-300 bg-white px-4 py-4 text-right text-3xl font-extrabold text-gray-900 shadow-sm focus:border-bakery-500 focus:ring-bakery-500"
            placeholder="0"
          />
        </label>

        <div class="mt-3 grid grid-cols-4 gap-2">
          <button
            v-for="preset in openingCashPresets"
            :key="preset.label"
            type="button"
            class="min-h-12 rounded-xl border border-gray-200 bg-white px-2 text-sm font-extrabold text-gray-700 shadow-sm transition hover:bg-bakery-50 hover:text-bakery-800 active:scale-[0.98]"
            @click="setOpeningCash(preset.amount)"
          >
            {{ preset.label }}
          </button>
        </div>

        <AmountKeypad v-model="openingCash" class="mt-3" :disabled="openingShift" />

        <button
          type="button"
          class="mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl bg-bakery-600 px-5 py-3 text-base font-extrabold text-white shadow-sm hover:bg-bakery-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="openingShift"
          @click="openShift"
        >
          {{ openingShift ? t('pos.opening') : t('pos.openShift') }}
        </button>

        <p v-if="shiftError" class="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {{ shiftError }}
        </p>
      </section>
    </div>

    <div v-else-if="hasStaleOpenShift" class="flex flex-1 items-center justify-center bg-gray-50 p-6">
      <section class="w-full max-w-lg rounded-3xl border border-amber-100 bg-white p-6 shadow-xl shadow-bakery-900/10">
        <div class="mb-5 flex items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25">
            <ReceiptText class="h-6 w-6" />
          </div>
          <div>
            <h2 class="text-xl font-extrabold text-gray-900">{{ t('pos.previousShiftOpenTitle') }}</h2>
            <p class="mt-1 text-sm font-medium text-gray-500">
              {{ t('pos.previousShiftOpenHint', { date: currentShiftDateLabel }) }}
            </p>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">{{ t('pos.previousShiftOpeningCash') }}</p>
          <p class="mt-1 text-2xl font-extrabold text-gray-900">{{ formatMoney(currentShift?.opening_cash || 0) }} ₸</p>
        </div>

        <button
          type="button"
          class="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-bakery-600 px-5 py-3 text-base font-extrabold text-white shadow-sm hover:bg-bakery-700 active:scale-[0.99]"
          @click="isShiftCloseModalOpen = true"
        >
          <ReceiptText class="h-5 w-5" />
          {{ t('pos.closeShift') }}
        </button>

        <p v-if="shiftError" class="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {{ shiftError }}
        </p>
      </section>
    </div>

    <div v-else class="flex-1 flex overflow-hidden">
      <!-- Left side: Products -->
      <div class="flex-1 flex flex-col min-w-0 bg-gray-50">
        <!-- Categories -->
        <div class="p-6 pb-2 shrink-0 overflow-x-auto no-scrollbar">
          <div class="flex items-center gap-3">
            <button 
              @click="refreshCatalog"
              :disabled="isRefreshingCatalog"
              class="flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors shadow-sm disabled:opacity-50"
              title="Обновить каталог и остатки"
            >
              <RefreshCw :class="{'animate-spin': isRefreshingCatalog}" class="w-4 h-4" />
              <span class="hidden sm:inline">Обновить</span>
            </button>
            
            <div class="h-6 w-px bg-gray-300 shrink-0 mx-1"></div>

            <button 
              @click="activeCategory = null"
              :class="['px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ease-out whitespace-nowrap shrink-0', 
                activeCategory === null ? 'bg-bakery-800 text-white shadow-md transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200']"
            >
              {{ t('pos.allProducts') }}
            </button>
            <button 
              v-for="cat in posStore.categories" 
              :key="cat.id"
              @click="activeCategory = cat.id"
              :class="['px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ease-out whitespace-nowrap shrink-0', 
                activeCategory === cat.id ? 'bg-bakery-800 text-white shadow-md transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200']"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="flex-1 p-6 overflow-y-auto relative">
          <div v-if="posStore.isLoading" class="flex items-center justify-center h-full">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-bakery-600"></div>
          </div>
          <div v-else-if="filteredProducts.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 space-y-4">
            <svg class="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            <p class="text-lg font-medium">{{ t('pos.noProducts') }}</p>
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <ProductCard 
              v-for="product in filteredProducts" 
              :key="product.id" 
              :product="product"
              :stock-quantity="posStore.availableForProduct(product.id)"
              @add="posStore.addToCart(product)"
            />
          </div>
        </div>
      </div>

      <!-- Right side: Cart / History -->
      <Cart v-if="sidePanel === 'cart'" @checkout="openPaymentModal" />
      <SalesHistory v-else ref="salesHistoryRef" />
    </div>

    <!-- Payment Modal -->
    <PaymentModal 
      v-if="isPaymentModalOpen && canSell" 
      @close="isPaymentModalOpen = false" 
      @success="handlePaymentSuccess" 
    />

    <ShiftCloseModal
      v-if="isShiftCloseModalOpen && currentShift"
      :current-shift="currentShift"
      @close="isShiftCloseModalOpen = false"
      @closed="handleShiftClosed"
    />

    <Transition name="pos-toast">
      <div
        v-if="successToast.visible"
        class="fixed right-4 top-4 z-[60] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-bakery-100 bg-white shadow-2xl shadow-bakery-900/15"
        role="status"
        aria-live="polite"
      >
        <div class="h-1.5 bg-bakery-600"></div>
        <div class="flex gap-4 p-5">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bakery-600 text-white shadow-lg shadow-bakery-600/25">
            <CheckCircle2 class="h-6 w-6" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-base font-extrabold text-gray-900">{{ t('pos.saleSuccessTitle') }}</p>
                <p class="mt-1 text-sm font-medium text-gray-500">
                  {{ successToast.saleId ? t('pos.receiptNumber', { id: successToast.saleId }) : t('pos.saleSaved') }}
                </p>
              </div>
              <button
                type="button"
                class="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-bakery-50 hover:text-bakery-700 focus:outline-none focus:ring-2 focus:ring-bakery-500"
                :aria-label="t('pos.closeNotification')"
                @click="hideSuccessToast"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400">{{ t('pos.amount') }}</p>
                <p class="mt-0.5 text-lg font-extrabold text-gray-900">{{ formatMoney(successToast.totalAmount || 0) }} ₸</p>
              </div>
              <div class="rounded-xl border border-bakery-100 bg-bakery-50 px-3 py-2">
                <p class="text-[11px] font-bold uppercase tracking-wider text-bakery-500">{{ t('pos.payment') }}</p>
                <p class="mt-0.5 flex items-center gap-2 text-sm font-extrabold text-bakery-800">
                  <ReceiptText class="h-4 w-4" />
                  {{ successToast.paymentLabel }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="pos-toast">
      <div
        v-if="shiftToast.visible"
        class="fixed right-4 top-4 z-[60] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-bakery-100 bg-white shadow-2xl shadow-bakery-900/15"
        role="status"
        aria-live="polite"
      >
        <div class="h-1.5 bg-bakery-600"></div>
        <div class="flex gap-4 p-5">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bakery-600 text-white shadow-lg shadow-bakery-600/25">
            <ReceiptText class="h-6 w-6" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-base font-extrabold text-gray-900">{{ t('pos.shiftClosed') }}</p>
                <p class="mt-1 text-sm font-medium" :class="shiftToast.shortageAmount > 0 ? 'text-red-600' : 'text-gray-500'">
                  {{ shiftToast.shortageAmount > 0 ? t('pos.shortage', { amount: formatMoney(shiftToast.shortageAmount) }) : t('pos.noShortage') }}
                </p>
              </div>
              <button
                type="button"
                class="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-bakery-50 hover:text-bakery-700 focus:outline-none focus:ring-2 focus:ring-bakery-500"
                :aria-label="t('pos.closeNotification')"
                @click="hideShiftToast"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { CheckCircle2, ReceiptText, X, RefreshCw, Maximize, Minimize } from 'lucide-vue-next';
import api from '../../../api';
import { usePosStore } from './store';
import type { RetailSale } from './store';
import {
  getCurrentSellerShift,
  openSellerShift,
  type CurrentSellerShift,
  type SellerShift,
} from '../../../api/sellerShifts';
import ProductCard from './components/ProductCard.vue';
import Cart from './components/Cart.vue';
import PaymentModal from './components/PaymentModal.vue';
import SalesHistory from './components/SalesHistory.vue';
import AmountKeypad from './components/AmountKeypad.vue';
import ShiftCloseModal from './components/ShiftCloseModal.vue';
import LanguageSwitcher from '../../../components/LanguageSwitcher.vue';
import { useI18n } from '../../../i18n';

interface CurrentUser {
  id: number;
  name: string;
  email?: string;
  roles?: Array<string | { name: string }>;
}

const posStore = usePosStore();
const { t } = useI18n();
const activeCategory = ref<number | null>(null);
const isPaymentModalOpen = ref(false);
const isShiftCloseModalOpen = ref(false);
const sidePanel = ref<'cart' | 'history'>('cart');
const salesHistoryRef = ref<InstanceType<typeof SalesHistory> | null>(null);
const currentUser = ref<CurrentUser | null>(null);
const shiftState = ref<CurrentSellerShift | null>(null);
const shiftLoading = ref(true);
const openingShift = ref(false);
const openingCash = ref('');
const shiftError = ref('');
const successToast = ref({
  visible: false,
  saleId: null as number | null,
  totalAmount: 0,
  paymentLabel: '',
});
const shiftToast = ref({
  visible: false,
  shortageAmount: 0,
});

let successToastTimer: number | undefined;
let shiftToastTimer: number | undefined;

const filteredProducts = computed(() => {
  if (activeCategory.value === null) return posStore.products;
  return posStore.products.filter(p => p.category_id === activeCategory.value);
});

const currentShift = computed<SellerShift | null>(() => shiftState.value?.shift || null);

const isShiftOpen = computed(() => {
  return currentShift.value?.status === 'open';
});

const canSell = computed(() => {
  return Boolean(shiftState.value?.can_sell && isShiftOpen.value);
});

const hasStaleOpenShift = computed(() => {
  return Boolean(isShiftOpen.value && !canSell.value);
});

const formatShiftDateLabel = (value?: string | null) => {
  if (!value) return '';

  const datePart = value.includes('T') ? value.slice(0, 10) : value;
  const [year, month, day] = datePart.split('-');

  if (!year || !month || !day) return datePart;

  return `${day}.${month}.${year}`;
};

const currentShiftDateLabel = computed(() => {
  return formatShiftDateLabel(currentShift.value?.date);
});

const shiftCaption = computed(() => {
  if (shiftLoading.value) return t('pos.shiftChecking');
  if (canSell.value) return t('pos.shiftOpenCaption', { amount: formatMoney(currentShift.value?.opening_cash || 0) });
  if (hasStaleOpenShift.value) return t('pos.shiftNeedsCloseCaption', { date: currentShiftDateLabel.value });
  if (currentShift.value?.status === 'closed') return t('pos.shiftClosed');
  return t('pos.shiftNotOpen');
});

const userRoles = computed(() => {
  return (currentUser.value?.roles || []).map((role) => typeof role === 'string' ? role : role.name);
});

const cashierName = computed(() => currentUser.value?.name || t('pos.cashier'));

const cashierInitials = computed(() => {
  const name = cashierName.value.trim();
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'K';
});

const cashierRoleLabel = computed(() => {
  if (userRoles.value.includes('seller')) return t('roles.seller');
  if (userRoles.value.includes('admin')) return t('roles.admin');
  if (userRoles.value.includes('owner')) return t('pos.owner');
  return t('pos.cashierEmployee');
});

const openingCashPresets = [
  { label: '0 ₸', amount: 0 },
  { label: '5 000', amount: 5000 },
  { label: '10 000', amount: 10000 },
  { label: '20 000', amount: 20000 },
];

const setOpeningCash = (amount: number) => {
  openingCash.value = amount > 0 ? String(amount) : '';
};

const openPaymentModal = () => {
  if (!canSell.value) return;
  if (posStore.cart.length === 0) return;
  isPaymentModalOpen.value = true;
};

const formatMoney = (amount: number | string) => {
  return new Intl.NumberFormat('ru-KZ').format(Number(amount || 0));
};

const paymentLabel = (sale?: RetailSale) => {
  const method = sale?.payments?.[0]?.payment_method;
  if (method === 'cash') return t('pos.payments.cash');
  if (method === 'kaspi') return t('pos.payments.kaspi');
  if (method === 'mixed') return t('pos.payments.mixed');
  return t('pos.payment');
};

const hideSuccessToast = () => {
  successToast.value.visible = false;
  if (successToastTimer) {
    window.clearTimeout(successToastTimer);
    successToastTimer = undefined;
  }
};

const hideShiftToast = () => {
  shiftToast.value.visible = false;
  if (shiftToastTimer) {
    window.clearTimeout(shiftToastTimer);
    shiftToastTimer = undefined;
  }
};

const showSuccessToast = (sale?: RetailSale) => {
  hideSuccessToast();

  successToast.value = {
    visible: true,
    saleId: sale?.id ?? null,
    totalAmount: Number(sale?.total_amount || 0),
    paymentLabel: paymentLabel(sale),
  };

  successToastTimer = window.setTimeout(() => {
    successToast.value.visible = false;
    successToastTimer = undefined;
  }, 4500);
};

const showShiftClosedToast = (shift: SellerShift) => {
  hideShiftToast();

  shiftToast.value = {
    visible: true,
    shortageAmount: Number(shift.shortage_amount || 0),
  };

  shiftToastTimer = window.setTimeout(() => {
    shiftToast.value.visible = false;
    shiftToastTimer = undefined;
  }, 5500);
};

const handlePaymentSuccess = (sale?: RetailSale) => {
  isPaymentModalOpen.value = false;
  if (sidePanel.value === 'history') {
    nextTick(() => salesHistoryRef.value?.reload());
  }
  showSuccessToast(sale);
};

const openHistory = async () => {
  sidePanel.value = 'history';
  await nextTick();
  await salesHistoryRef.value?.reload();
};

const loadCurrentShift = async () => {
  shiftLoading.value = true;
  shiftError.value = '';
  try {
    shiftState.value = await getCurrentSellerShift();
    if (shiftState.value?.can_sell) {
      await posStore.fetchCurrentShiftStocks();
    } else {
      posStore.clearShiftStocks();
    }
  } catch (error: any) {
    shiftError.value = error.response?.data?.message || t('pos.checkShiftError');
    posStore.clearShiftStocks();
  } finally {
    shiftLoading.value = false;
  }
};

const openShift = async () => {
  openingShift.value = true;
  shiftError.value = '';
  try {
    await openSellerShift({
      opening_cash: Number(openingCash.value || 0),
    });
    openingCash.value = '';
    await loadCurrentShift();
  } catch (error: any) {
    shiftError.value = error.response?.data?.message || t('pos.openShiftError');
  } finally {
    openingShift.value = false;
  }
};

const handleShiftClosed = async (shift?: SellerShift) => {
  isPaymentModalOpen.value = false;
  isShiftCloseModalOpen.value = false;
  sidePanel.value = 'cart';
  posStore.clearCart();
  await loadCurrentShift();
  if (shift) {
    showShiftClosedToast(shift);
  }
};

const loadCurrentUser = async () => {
  const cachedUser = localStorage.getItem('user');
  if (cachedUser) {
    try {
      currentUser.value = JSON.parse(cachedUser);
    } catch (error) {
      localStorage.removeItem('user');
    }
  }

  try {
    const response = await api.get('/me');
    currentUser.value = response.data.data;
    localStorage.setItem('user', JSON.stringify(response.data.data));
  } catch (error) {
    console.error(error);
  }
};

const isRefreshingCatalog = ref(false);

const refreshCatalog = async () => {
  if (isRefreshingCatalog.value) return;
  isRefreshingCatalog.value = true;
  try {
    await Promise.all([
      posStore.fetchCategories(),
      posStore.fetchProducts(),
    ]);
    if (canSell.value) {
      await posStore.fetchCurrentShiftStocks();
    }
  } catch (error) {
    console.error('Failed to refresh catalog:', error);
  } finally {
    isRefreshingCatalog.value = false;
  }
};

const isFullscreen = ref(false);

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.warn(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

const init = async () => {
  await Promise.all([
    posStore.fetchCategories(),
    posStore.fetchProducts(),
    loadCurrentUser(),
  ]);
  await loadCurrentShift();
};

onMounted(() => {
  init();
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onBeforeUnmount(() => {
  hideSuccessToast();
  hideShiftToast();
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.pos-toast-enter-active,
.pos-toast-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.pos-toast-enter-from,
.pos-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>
