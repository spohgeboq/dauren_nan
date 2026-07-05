import api from '../api';

export const getDailySummary = async (date_from?: string, date_to?: string) => {
  const params: any = {};
  if (date_from) params.date_from = date_from;
  if (date_to) params.date_to = date_to;
  const response = await api.get('/reports/daily', { params });
  return response.data;
};

export const getProductionReport = async (date_from?: string, date_to?: string) => {
  const params: any = {};
  if (date_from) params.date_from = date_from;
  if (date_to) params.date_to = date_to;

  const response = await api.get('/reports/production', { params });
  return response.data;
};

export type ExpenseReportFilters = {
  date_from?: string;
  date_to?: string;
  expense_type_id?: number | string;
  employee_id?: number | string;
  vehicle_id?: number | string;
  search?: string;
  sort_by?: 'date' | 'amount';
  sort_dir?: 'asc' | 'desc';
};

export const getExpenseReport = async (date_from?: string, date_to?: string, filters: Omit<ExpenseReportFilters, 'date_from' | 'date_to'> = {}) => {
  const params: any = {};
  if (date_from) params.date_from = date_from;
  if (date_to) params.date_to = date_to;
  if (filters.expense_type_id) params.expense_type_id = filters.expense_type_id;
  if (filters.employee_id) params.employee_id = filters.employee_id;
  if (filters.vehicle_id) params.vehicle_id = filters.vehicle_id;
  if (filters.search) params.search = filters.search;
  if (filters.sort_by) params.sort_by = filters.sort_by;
  if (filters.sort_dir) params.sort_dir = filters.sort_dir;
  const response = await api.get('/reports/expenses', { params });
  return response.data;
};

export type EmployeeReportFilters = {
  role?: 'all' | 'baker' | 'driver';
  employee_id?: number | string;
};

export const getEmployeeReport = async (date_from?: string, date_to?: string, filters: EmployeeReportFilters = {}) => {
  const params: any = {};
  if (date_from) params.date_from = date_from;
  if (date_to) params.date_to = date_to;
  if (filters.role && filters.role !== 'all') params.role = filters.role;
  if (filters.employee_id) params.employee_id = filters.employee_id;

  const response = await api.get('/reports/employees', { params });
  return response.data;
};

export const getInventoryReport = async () => {
  const response = await api.get('/reports/inventory');
  return response.data;
};

export const createProductWriteOff = async (payload: {
  product_id: number;
  quantity: number;
  date: string;
  reason: string;
  comment?: string;
}) => {
  const response = await api.post('/product-write-offs', payload);
  return response.data.data;
};



export type ClientReportFilters = {
  client_id?: number | string;
  date_from?: string;
  date_to?: string;
  name?: string;
  phone?: string;
  debt_filter?: 'all' | 'with_debt' | 'without_debt';
  type?: 'all' | 'store' | 'organization' | 'retail' | 'regular';
  driver_id?: number | string;
  sort_by?: 'name' | 'current_debt' | 'accepted_amount';
  sort_dir?: 'asc' | 'desc';
};

export const getClientReport = async (filters: ClientReportFilters = {}) => {
  const params: any = {};
  if (filters.client_id) params.client_id = filters.client_id;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.name) params.name = filters.name;
  if (filters.phone) params.phone = filters.phone;
  if (filters.debt_filter && filters.debt_filter !== 'all') params.debt_filter = filters.debt_filter;
  if (filters.type && filters.type !== 'all') params.type = filters.type;
  if (filters.driver_id) params.driver_id = filters.driver_id;
  if (filters.sort_by) params.sort_by = filters.sort_by;
  if (filters.sort_dir) params.sort_dir = filters.sort_dir;
  const response = await api.get('/reports/clients', { params });
  return response.data;
};

export const getDriverReport = async (driver_id: number, date?: string) => {
  const params = date ? { date } : {};
  const response = await api.get(`/reports/drivers/${driver_id}`, { params });
  return response.data;
};
