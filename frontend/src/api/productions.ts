import api from '../api';
import type { Product } from './products';

export type ProductionStatus = 'draft' | 'confirmed' | 'closed' | 'cancelled';

export interface ProductionItemPayload {
  product_id: number;
  planned_quantity: number;
  actual_quantity?: number;
}

export interface ProductionPayload {
  date: string;
  status: ProductionStatus;
  baker_id?: number;
  items: ProductionItemPayload[];
}

export interface ProductionItem {
  id: number;
  product_id: number;
  product?: Product;
  planned_quantity: number;
  actual_quantity: number | null;
}

export interface ProductionIngredient {
  id: number;
  raw_material_id: number;
  raw_material?: {
    id: number;
    name: string;
    unit?: {
      id: number;
      name: string;
      short_name: string;
    };
  };
  planned_amount: number;
  actual_amount: number | null;
}

export interface Production {
  id: number;
  status: ProductionStatus;
  date: string;
  baker_id: number;
  baker?: {
    id: number;
    name: string;
    email: string;
  };
  items?: ProductionItem[];
  ingredients?: ProductionIngredient[];
}

export const getProductions = async (): Promise<Production[]> => {
  const response = await api.get('/productions');
  return response.data.data;
};

export const getProductionProducts = async (): Promise<Product[]> => {
  const response = await api.get('/productions/products');
  return response.data.data;
};

export const getLatestProductionTemplate = async (): Promise<{ items: { product_id: number, planned_quantity: number }[] } | null> => {
  const response = await api.get('/productions/latest-template');
  return response.data.data;
};

export const createProduction = async (payload: ProductionPayload): Promise<Production> => {
  const response = await api.post('/productions', payload);
  return response.data.data;
};

export const updateProduction = async (id: number, payload: ProductionPayload): Promise<Production> => {
  const response = await api.put(`/productions/${id}`, payload);
  return response.data.data;
};

export const cancelProduction = async (id: number): Promise<Production> => {
  const response = await api.post(`/productions/${id}/cancel`);
  return response.data.data;
};

export const deleteProduction = async (id: number): Promise<void> => {
  await api.delete(`/productions/${id}`);
};
