import api from '../api';
import type { Product } from './products';
import type { SellerShift } from './sellerShifts';

export interface SellerShiftStock {
  id: number;
  seller_shift_id?: number | null;
  product_id: number;
  product?: Product;
  shift?: SellerShift;
  date: string;
  quantity: number;
}

export const getCurrentSellerShiftStocks = async (): Promise<SellerShiftStock[]> => {
  const response = await api.get('/seller-shift-stocks/current');
  return response.data.data || [];
};

export const getSellerShiftStocks = async (params: {
  seller_shift_id?: number;
  seller_id?: number;
} = {}): Promise<SellerShiftStock[]> => {
  const response = await api.get('/seller-shift-stocks', { params });
  return response.data.data || [];
};

export const getOpenSellerShiftsForTransfer = async (): Promise<SellerShift[]> => {
  const response = await api.get('/seller-shift-stocks/open-shifts');
  return response.data.data || [];
};

export const transferProductsToSellerShift = async (payload: {
  seller_shift_id: number;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}): Promise<void> => {
  await api.post('/seller-shift-stocks/transfer', payload);
};
