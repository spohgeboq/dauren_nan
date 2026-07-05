export interface ClientReportRow {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  debt_limit: number;
  current_debt: number;
  type_label: string;
  accepted_quantity: number;
  accepted_amount: number;
  paid_amount: number;
  new_debt_amount: number;
  returned_quantity: number;
  returned_amount: number;
  returns_count: number;
  loyalty_bonus_balance: number;
  assigned_driver_name: string | null;
  deliveries: any[];
  direct_payments: any[];
  loyalty_transactions: any[];
}

export interface ClientReport {
  date_from: string;
  date_to: string;
  filters: any;
  filter_options?: any;
  totals: {
    clients_count: number;
    accepted_quantity: number;
    accepted_amount: number;
    paid_amount: number;
    delivery_paid_amount: number;
    debt_paid_amount: number;
    new_debt_amount: number;
    current_debt: number;
    returned_quantity: number;
    returned_amount: number;
    returns_count: number;
    loyalty_bonus_balance: number;
  };
  total_debt_market: number;
  clients: ClientReportRow[];
}
