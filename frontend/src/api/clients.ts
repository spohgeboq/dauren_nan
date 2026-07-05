import api from '../api';

export type ClientType = 'store' | 'organization' | 'regular' | 'retail';

export interface Driver {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface Client {
  id: number;
  user_id?: number | null;
  user?: Driver | null;
  name: string;
  type: ClientType;
  type_label: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  assigned_driver_id?: number | null;
  assigned_driver?: Driver | null;
  debt_limit: number;
  current_debt: number;
  loyalty_bonus_balance?: number;
  is_active: boolean;
}

export interface LoyaltySettings {
  id: number;
  is_enabled: boolean;
  bonus_percent: number;
  redeem_rate: number;
  max_bonus_per_order?: number | null;
  manual_bonus_enabled: boolean;
}

export interface LoyaltyBonusTransaction {
  id: number;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  comment?: string | null;
  created_by?: number | null;
  creator_name?: string | null;
  created_at?: string;
}

export interface ClientDriverTransfer {
  id: number;
  client_id: number;
  client?: Client;
  old_driver_id?: number | null;
  old_driver?: Driver | null;
  new_driver_id: number;
  new_driver?: Driver | null;
  date_from: string;
  date_to?: string | null;
  reason?: string | null;
  approved_by?: number | null;
  approver?: Driver | null;
  created_at?: string;
}

export const getClients = async (): Promise<Client[]> => {
  const response = await api.get('/clients');
  return response.data.data;
};

export const createClient = async (data: Partial<Client>): Promise<Client> => {
  const response = await api.post('/clients', data);
  return response.data.data;
};

export const updateClient = async (id: number, data: Partial<Client>): Promise<Client> => {
  const response = await api.put(`/clients/${id}`, data);
  return response.data.data;
};

export const deleteClient = async (id: number): Promise<void> => {
  await api.delete(`/clients/${id}`);
};

export const getClientTransfers = async (clientId?: number): Promise<ClientDriverTransfer[]> => {
  const params: Record<string, any> = {};
  if (clientId) params.client_id = clientId;
  const response = await api.get('/client-driver-transfers', { params });
  return response.data.data;
};

export const transferClientDriver = async (data: {
  client_id: number;
  new_driver_id: number;
  date_from: string;
  date_to?: string | null;
  reason?: string | null;
}): Promise<{ data: ClientDriverTransfer; client: Client; message: string }> => {
  const response = await api.post('/client-driver-transfers', data);
  return response.data;
};

export const payClientDebt = async (
  clientId: number,
  data: { amount: number; payment_method: string; comment?: string }
): Promise<{ message: string; client: Client; payment: any }> => {
  const response = await api.post(`/clients/${clientId}/pay-debt`, data);
  return response.data;
};

export const getLoyaltySettings = async (): Promise<LoyaltySettings> => {
  const response = await api.get('/loyalty/settings');
  return response.data.data;
};

export const updateLoyaltySettings = async (data: Partial<LoyaltySettings>): Promise<LoyaltySettings> => {
  const response = await api.put('/loyalty/settings', data);
  return response.data.data;
};

export const getClientLoyaltyBonuses = async (clientId: number): Promise<{ balance: number; transactions: LoyaltyBonusTransaction[] }> => {
  const response = await api.get(`/clients/${clientId}/loyalty-bonuses`);
  return response.data.data;
};

export const addClientLoyaltyBonus = async (
  clientId: number,
  data: { type: 'manual_credit' | 'manual_debit' | 'adjustment'; amount: number; comment?: string }
): Promise<{ client: Client; transaction: LoyaltyBonusTransaction }> => {
  const response = await api.post(`/clients/${clientId}/loyalty-bonuses`, data);
  return response.data.data;
};
