import api from '../api';
import type { RawMaterial } from './rawMaterials';

export type PurchaseRequestStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'received';

export interface PurchaseRequestItem {
  id?: number;
  raw_material_id: number;
  raw_material?: RawMaterial;
  quantity: number;
  estimated_price: number | null;
}

export interface PurchaseRequest {
  id: number;
  status: PurchaseRequestStatus;
  expected_date: string | null;
  total_estimated_cost: number;
  requested_by: number;
  requester?: { name: string };
  approved_by?: number | null;
  approver?: { name: string };
  created_at?: string;
  items?: PurchaseRequestItem[];
}

export interface PurchaseRequestPayload {
  expected_date?: string | null;
  items: Array<{
    raw_material_id: number;
    quantity: number;
    estimated_price?: number | null;
  }>;
}

export const getPurchaseRequests = async () => {
  const response = await api.get('/purchase-requests');
  return response.data.data;
};

export const createPurchaseRequest = async (data: PurchaseRequestPayload) => {
  const response = await api.post('/purchase-requests', data);
  return response.data.data;
};

export const deletePurchaseRequest = async (id: number) => {
  await api.delete(`/purchase-requests/${id}`);
};

export const approvePurchaseRequest = async (id: number) => {
  const response = await api.post(`/purchase-requests/${id}/approve`);
  return response.data.data;
};

export const rejectPurchaseRequest = async (id: number) => {
  const response = await api.post(`/purchase-requests/${id}/reject`);
  return response.data.data;
};

export const receivePurchaseRequest = async (id: number) => {
  const response = await api.post(`/purchase-requests/${id}/receive`);
  return response.data.data;
};
