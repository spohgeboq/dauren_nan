import api from '../api';

export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}

export const getRoles = async () => {
  const response = await api.get('/roles');
  return response.data.data;
};

export const getPermissions = async () => {
  const response = await api.get('/permissions');
  return response.data.data;
};

export const createRole = async (data: any) => {
  const response = await api.post('/roles', data);
  return response.data.data;
};

export const updateRole = async (id: number, data: any) => {
  const response = await api.put(`/roles/${id}`, data);
  return response.data.data;
};

export const deleteRole = async (id: number) => {
  await api.delete(`/roles/${id}`);
};
