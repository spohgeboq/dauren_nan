import api from '../api';

export interface SellerShift {
  id: number;
  seller_id: number;
  seller?: {
    id: number;
    name: string;
    email?: string;
  };
  date: string;
  opening_cash: number;
  expected_cash: number;
  expected_kaspi: number;
  actual_cash: number;
  actual_kaspi: number;
  shortage_amount: number;
  status: 'open' | 'closed';
  opened_at: string | null;
  closed_at: string | null;
}

export interface CurrentSellerShift {
  date: string;
  status: 'open' | 'closed' | 'none';
  can_sell: boolean;
  must_open: boolean;
  must_close: boolean;
  shift: SellerShift | null;
}

export const getCurrentSellerShift = async (date?: string): Promise<CurrentSellerShift> => {
  const response = await api.get('/seller-shifts/current', {
    params: date ? { date } : {},
  });
  return response.data.data;
};

export const getSellerShifts = async (params: {
  date?: string;
  status?: 'open' | 'closed';
  seller_id?: number;
} = {}): Promise<SellerShift[]> => {
  const response = await api.get('/seller-shifts', { params });
  return response.data.data?.data || response.data.data || [];
};

export const openSellerShift = async (payload: {
  date?: string;
  opening_cash: number;
  comment?: string;
}): Promise<SellerShift> => {
  const response = await api.post('/seller-shifts/open', payload);
  return response.data.data;
};

export const closeCurrentSellerShift = async (payload: {
  date?: string;
  actual_cash: number;
  actual_kaspi: number;
  comment?: string;
}): Promise<SellerShift> => {
  const response = await api.post('/seller-shifts/current/close', payload);
  return response.data.data;
};
