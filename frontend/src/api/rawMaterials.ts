import api from '../api';

export interface Unit {
  id: number;
  name: string;
  short_name: string;
}

export interface RawMaterial {
  id: number;
  name: string;
  unit_id: number;
  unit?: Unit;
  minimum_stock: number;
  recommended_stock: number;
  purchase_unit_id: number;
  purchase_unit?: Unit;
  qty_per_purchase_unit: number;
  supplier: string | null;
  is_active: boolean;
  current_stock?: number;
  active_purchases?: {
    quantity: number;
    status: string;
    expected_date?: string;
  }[];
}

export const getRawMaterials = async (): Promise<RawMaterial[]> => {
  const response = await api.get('/raw-materials');
  return response.data.data;
};

export const getUnits = async (): Promise<Unit[]> => {
  const response = await api.get('/units');
  return response.data.data;
};

export const createRawMaterial = async (data: Partial<RawMaterial>): Promise<RawMaterial> => {
  const response = await api.post('/raw-materials', data);
  return response.data.data;
};

export const updateRawMaterial = async (id: number, data: Partial<RawMaterial>): Promise<RawMaterial> => {
  const response = await api.put(`/raw-materials/${id}`, data);
  return response.data.data;
};

export const deleteRawMaterial = async (id: number): Promise<void> => {
  await api.delete(`/raw-materials/${id}`);
};
