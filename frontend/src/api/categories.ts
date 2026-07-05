import api from '../api';

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export const getCategories = async () => {
  const response = await api.get('/product-categories');
  return response.data.data;
};

export const createCategory = async (data: Partial<Category>) => {
  const response = await api.post('/product-categories', data);
  return response.data.data;
};

export const updateCategory = async (id: number, data: Partial<Category>) => {
  const response = await api.put(`/product-categories/${id}`, data);
  return response.data.data;
};

export const deleteCategory = async (id: number) => {
  await api.delete(`/product-categories/${id}`);
};
