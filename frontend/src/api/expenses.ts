import api from '../api';

export interface ExpenseType {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  date: string;
  expense_type_id: number;
  amount: number;
  comment: string | null;
  employee_id: number | null;
  vehicle_id: number | null;
  expense_type?: ExpenseType;
  employee?: { name: string; email: string };
  vehicle?: { name: string; license_plate: string | null };
  creator?: { name: string };
  attachment_url: string | null;
}

export const getExpenseTypes = async () => {
  const response = await api.get('/expense-types');
  return response.data.data;
};

export const createExpenseType = async (data: Partial<ExpenseType>) => {
  const response = await api.post('/expense-types', data);
  return response.data.data;
};

export const updateExpenseType = async (id: number, data: Partial<ExpenseType>) => {
  const response = await api.put(`/expense-types/${id}`, data);
  return response.data.data;
};

export const deleteExpenseType = async (id: number) => {
  await api.delete(`/expense-types/${id}`);
};

export const getExpenses = async () => {
  const response = await api.get('/expenses');
  return response.data.data;
};

export const createExpense = async (data: FormData | Partial<Expense>) => {
  const response = await api.post('/expenses', data);
  return response.data.data;
};

export const deleteExpense = async (id: number) => {
  await api.delete(`/expenses/${id}`);
};
