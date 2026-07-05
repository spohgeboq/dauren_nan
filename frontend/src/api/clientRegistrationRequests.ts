import api from '../api';
import type { Client, ClientType, Driver } from './clients';

export type ClientRegistrationRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ClientRegistrationRequestPayload {
  name: string;
  type: ClientType;
  phone: string;
  email?: string;
  address: string;
  contact_person?: string;
  preferred_delivery_time?: string;
  comment?: string;
}

export interface ClientRegistrationRequest extends ClientRegistrationRequestPayload {
  id: number;
  user_id?: number | null;
  type_label: string;
  status: ClientRegistrationRequestStatus;
  client_id?: number | null;
  client?: Client | null;
  approver?: Driver | null;
  rejecter?: Driver | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  created_at?: string;
}

export const createClientRegistrationRequest = async (
  payload: ClientRegistrationRequestPayload,
): Promise<ClientRegistrationRequest> => {
  const response = await api.post('/client-registration-requests', payload);
  return response.data.data;
};

export const getMyClientRegistrationRequest = async (): Promise<ClientRegistrationRequest | null> => {
  const response = await api.get('/client-registration-requests/my');
  return response.data.data;
};

export const getClientRegistrationRequests = async (
  status?: ClientRegistrationRequestStatus,
): Promise<ClientRegistrationRequest[]> => {
  const response = await api.get('/client-registration-requests', {
    params: status ? { status } : {},
  });
  return response.data.data;
};

export const approveClientRegistrationRequest = async (
  id: number,
  payload: { assigned_driver_id?: number | null; debt_limit?: number } = {},
): Promise<ClientRegistrationRequest> => {
  const response = await api.post(`/client-registration-requests/${id}/approve`, payload);
  return response.data.data;
};

export const rejectClientRegistrationRequest = async (id: number): Promise<ClientRegistrationRequest> => {
  const response = await api.post(`/client-registration-requests/${id}/reject`);
  return response.data.data;
};
