import api from '../api';
import type { Product } from './products';
import type { RawMaterial } from './rawMaterials';

export interface RecipeIngredient {
  id?: number;
  raw_material_id: number;
  raw_material?: RawMaterial;
  amount: number;
}

export interface Recipe {
  id: number;
  product_id: number;
  product?: Product;
  yield_quantity: number;
  is_active: boolean;
  ingredients: RecipeIngredient[];
}

export interface RecipePayload {
  product_id: number;
  yield_quantity: number;
  is_active: boolean;
  ingredients: Array<{
    raw_material_id: number;
    amount: number;
  }>;
}

export const getRecipes = async (): Promise<Recipe[]> => {
  const response = await api.get('/recipes');
  return response.data.data;
};

export const createRecipe = async (data: RecipePayload): Promise<Recipe> => {
  const response = await api.post('/recipes', data);
  return response.data.data;
};

export const updateRecipe = async (id: number, data: RecipePayload): Promise<Recipe> => {
  const response = await api.put(`/recipes/${id}`, data);
  return response.data.data;
};

export const deleteRecipe = async (id: number): Promise<void> => {
  await api.delete(`/recipes/${id}`);
};
