import api from '../api';

export interface Product {
  id: number;
  name: string;
  category_id: number;
  unit_id: number;
  retail_price: number;
  wholesale_price: number;
  image_url: string | null;
  freshness_days: number;
  description: string | null;
  is_active: boolean;
  category?: { id: number, name: string };
  unit?: { id: number, name: string, short_name: string };
}

export interface PublicCatalogProduct {
  id: number;
  name: string;
  image_url: string | null;
}

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data.data;
};

export const getPublicCatalogProducts = async (): Promise<PublicCatalogProduct[]> => {
  const response = await api.get('/catalog/products');
  return response.data.data;
};

export const getCategories = async () => {
  const response = await api.get('/product-categories');
  return response.data.data;
};

export const getUnits = async () => {
  const response = await api.get('/units');
  return response.data.data;
};

export const createProduct = async (formData: FormData) => {
  const response = await api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const updateProduct = async (id: number, formData: FormData) => {
  // Laravel requires _method=PUT or _method=PATCH for multipart/form-data updates
  formData.append('_method', 'PUT');
  const response = await api.post(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const deleteProduct = async (id: number) => {
  await api.delete(`/products/${id}`);
};
