import api from '../api';

export interface Vehicle {
  id: number;
  name: string;
  license_plate: string | null;
  is_active: boolean;
}

export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get('/vehicles');
  return response.data.data;
};

export const createVehicle = async (data: Partial<Vehicle>): Promise<Vehicle> => {
  const response = await api.post('/vehicles', data);
  return response.data.data;
};

export const updateVehicle = async (id: number, data: Partial<Vehicle>): Promise<Vehicle> => {
  const response = await api.put(`/vehicles/${id}`, data);
  return response.data.data;
};

export const deleteVehicle = async (id: number): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};
