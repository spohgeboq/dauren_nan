import { create } from 'zustand';
import api from '../../../api';
import { getCurrentSellerShiftStocks, type SellerShiftStock } from '../../../api/sellerShiftStocks';

export interface Product {
  id: number;
  name: string;
  retail_price: number;
  image_url: string | null;
  category_id: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleItem {
  id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface SalePaymentDetail {
  method: 'cash' | 'kaspi';
  amount: number;
}

export interface SalePayment {
  id: number;
  amount: number;
  payment_method: 'cash' | 'kaspi' | 'mixed';
  status: string;
  details?: SalePaymentDetail[];
}

export interface RetailSale {
  id: number;
  seller_id: number;
  seller_shift_id?: number | null;
  total_amount: number;
  status: string;
  created_at: string;
  items?: SaleItem[];
  payments?: SalePayment[];
}

interface PosState {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  sales: RetailSale[];
  shiftStocks: SellerShiftStock[];
  isLoading: boolean;
  isSalesLoading: boolean;

  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSales: (dateFrom?: string, dateTo?: string) => Promise<void>;
  fetchCurrentShiftStocks: () => Promise<void>;
  clearShiftStocks: () => void;
  stockForProduct: (productId: number) => number;
  cartQuantityForProduct: (productId: number) => number;
  availableForProduct: (productId: number) => number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  submitSale: (paymentMethod: string, paymentDetails?: any[]) => Promise<any>;
}

export const usePosStore = create<PosState>((set, get) => ({
  products: [],
  categories: [],
  cart: [],
  sales: [],
  shiftStocks: [],
  isLoading: false,
  isSalesLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/products');
      set({ products: res.data.data });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await api.get('/product-categories');
      set({ categories: res.data.data });
    } catch (e) {
      console.error(e);
    }
  },

  fetchSales: async (dateFrom?: string, dateTo?: string) => {
    set({ isSalesLoading: true });
    try {
      const params: any = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const res = await api.get('/retail-sales', { params });
      set({ sales: res.data.data || [] });
    } catch (e) {
      console.error(e);
      set({ sales: [] });
    } finally {
      set({ isSalesLoading: false });
    }
  },

  fetchCurrentShiftStocks: async () => {
    const stocks = await getCurrentSellerShiftStocks();
    set({ shiftStocks: stocks });
  },

  clearShiftStocks: () => {
    set({ shiftStocks: [] });
  },

  stockForProduct: (productId: number) => {
    return get()
      .shiftStocks.filter((stock) => stock.product_id === productId)
      .reduce((sum, stock) => sum + Number(stock.quantity || 0), 0);
  },

  cartQuantityForProduct: (productId: number) => {
    return get()
      .cart.filter((item) => item.product.id === productId)
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  },

  availableForProduct: (productId: number) => {
    const state = get();
    return Math.max(0, state.stockForProduct(productId) - state.cartQuantityForProduct(productId));
  },

  addToCart: (product: Product) => {
    const state = get();
    if (state.availableForProduct(product.id) <= 0) {
      return;
    }

    const existing = state.cart.find((i) => i.product.id === product.id);
    if (existing) {
      set({
        cart: state.cart.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ cart: [...state.cart, { product, quantity: 1 }] });
    }
  },

  removeFromCart: (productId: number) => {
    set({ cart: get().cart.filter((i) => i.product.id !== productId) });
  },

  updateQuantity: (productId: number, quantity: number) => {
    const state = get();
    if (quantity <= 0) {
      state.removeFromCart(productId);
      return;
    }

    const maxQuantity = state.stockForProduct(productId);
    const nextQuantity = Math.min(quantity, maxQuantity);
    set({
      cart: state.cart.map((i) =>
        i.product.id === productId ? { ...i, quantity: nextQuantity } : i
      ),
    });
  },

  clearCart: () => {
    set({ cart: [] });
  },

  totalAmount: () => {
    return get().cart.reduce((acc, item) => acc + item.product.retail_price * item.quantity, 0);
  },

  submitSale: async (paymentMethod: string, paymentDetails: any[] = []) => {
    const state = get();
    const items = state.cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    const payload = {
      items,
      payment_method: paymentMethod,
      payment_details: paymentDetails,
    };

    const res = await api.post('/retail-sales', payload);
    if (res.status === 201 || res.status === 200) {
      set({ cart: [] });
      await get().fetchCurrentShiftStocks();
    }
    return res;
  },
}));
