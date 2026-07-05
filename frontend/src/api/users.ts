import api from '../api';
import type { Product } from './products';

export interface User {
  id: number;
  name: string;
  email: string;
  delivery_stock_mode?: 'warehouse' | 'driver_transfer';
  roles?: { id: number, name: string }[];
  role?: string; // used for forms
  password?: string;
  assigned_production_products?: Product[];
  production_product_ids?: number[];
}

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data.data;
};

export const getRoles = async () => {
  const response = await api.get('/roles');
  return response.data.data;
};

export const createUser = async (data: Partial<User>) => {
  const response = await api.post('/users', data);
  return response.data.data;
};

export const updateUser = async (id: number, data: Partial<User>) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data.data;
};

export const deleteUser = async (id: number) => {
  await api.delete(`/users/${id}`);
};
