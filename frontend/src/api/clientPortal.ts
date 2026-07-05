import api from '../api';
import type { Client } from './clients';

export interface ClientOrderItem {
  id: number;
  product_id: number;
  product?: {
    id: number;
    name: string;
    image_url?: string | null;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ClientOrder {
  id: number;
  client_id: number;
  requested_delivery_date?: string | null;
  status: string;
  total_estimated_amount: number;
  comment?: string | null;
  created_at?: string;
  items?: ClientOrderItem[];
}

export interface ClientDelivery {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items?: ClientOrderItem[];
  payments?: Array<{
    id: number;
    amount: number;
    payment_method: string;
    status: string;
  }>;
}

export interface ClientPayment {
  id: number;
  delivery_id: number;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  details?: Array<{ method: string; amount: number }>;
}

export interface DebtSummary {
  client_id: number;
  current_debt: number;
  debt_limit: number;
  available_debt_limit: number;
  total_delivered: number;
  total_paid: number;
  deliveries_count: number;
  average_delivery_amount: number;
}

export const getClientProfile = async (): Promise<Client> => {
  const response = await api.get('/client/profile');
  return response.data.data;
};

export const getClientDebtSummary = async (): Promise<DebtSummary> => {
  const response = await api.get('/client/debt-summary');
  return response.data.data;
};

export const getClientDeliveries = async (): Promise<ClientDelivery[]> => {
  const response = await api.get('/client/deliveries');
  return response.data.data;
};

export const getClientPayments = async (): Promise<ClientPayment[]> => {
  const response = await api.get('/client/payments');
  return response.data.data;
};

export const getClientOrders = async (): Promise<ClientOrder[]> => {
  const response = await api.get('/client/orders');
  return response.data.data;
};

export const createClientOrder = async (data: {
  requested_delivery_date?: string | null;
  comment?: string | null;
  items: Array<{ product_id: number; quantity: number }>;
}): Promise<ClientOrder> => {
  const response = await api.post('/client/orders', data);
  return response.data.data;
};

export const repeatLastClientOrder = async (data: {
  requested_delivery_date?: string | null;
  comment?: string | null;
} = {}): Promise<ClientOrder> => {
  const response = await api.post('/client/orders/repeat-last', data);
  return response.data.data;
};
